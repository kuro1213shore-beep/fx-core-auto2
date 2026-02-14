/* ===================================================== */
/* 00_SCORE_ENTRY */
/* ===================================================== */

import { loadConfig, getModeConfig } from "./config.js";
import { getSettings } from "./settings.js";

/* ===================================================== */
/* 10_UTILS */
/* ===================================================== */

function num(x) {
  return (typeof x === "number" && Number.isFinite(x)) ? x : null;
}

// 「上なら +1、下なら -1」みたいな符号判定（0 は 0）
function signScore(v) {
  if (v === null) return 0;
  if (v > 0) return 1;
  if (v < 0) return -1;
  return 0;
}

// 重み付きで加算（例: sp が +なら +w、-なら -w）
function weightedSign(v, w) {
  const s = signScore(v);
  const ww = (typeof w === "number" && Number.isFinite(w)) ? w : 0;
  return s * ww;
}

/* ===================================================== */
/* 20_MODE_PICK */
/* ===================================================== */

function pickMode(data) {
  // ここが "RANGE" / "UPTREND" / "DOWNTREND" を返す想定
  const m = data?.usdjpy?.marketMode;
  return (typeof m === "string" && m.length) ? m : "RANGE";
}

/* ===================================================== */
/* 30_SCORE_CORE */
/* ===================================================== */

export function calcScore(data) {
  const cfg = loadConfig();
  const mode = pickMode(data);
  const mcfg = getModeConfig(mode, cfg);

  // --- inputs（%変化が入る想定） ---
  const sp  = num(data?.spPct);
  const vix = num(data?.vixPct);
  const tlt = num(data?.tltPct);
  const dxy = num(data?.dxyPct);

  /* ===================================================== */
  /* 31_RISK_SCORE */
  /* ===================================================== */
  // あなたの現行ロジック互換：
  // SP: 上で risk+ / 下で risk-
  // VIX: 下で risk+ / 上で risk-
  // TLT: 下で risk+ / 上で risk-
  // ※ weights で強弱付ける

  const wRisk = mcfg?.weights?.risk || {};
  let riskScore = 0;

  riskScore += weightedSign(sp,  wRisk.sp);

  // VIX は「上がる＝リスクオフ」なので符号反転
  riskScore += weightedSign(vix !== null ? -vix : null, wRisk.vix);

  // TLT は「上がる＝リスクオフ」になりがちなので符号反転（現行互換）
  riskScore += weightedSign(tlt !== null ? -tlt : null, wRisk.tlt);

  /* ===================================================== */
  /* 32_USD_SCORE */
  /* ===================================================== */
  const wUsd = mcfg?.weights?.usd || {};
  let usdScore = 0;

  usdScore += weightedSign(dxy, wUsd.dxy);

  /* ===================================================== */
  /* 33_TOTAL */
  /* ===================================================== */
  const totalScore = riskScore + usdScore;

  return { riskScore, usdScore, totalScore };
}