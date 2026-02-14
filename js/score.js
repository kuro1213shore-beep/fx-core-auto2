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

function signScore(v) {
  if (v === null) return 0;
  if (v > 0) return 1;
  if (v < 0) return -1;
  return 0;
}

function weightedSign(v, w) {
  const s = signScore(v);
  const ww = (typeof w === "number" && Number.isFinite(w)) ? w : 0;
  return s * ww;
}

/* ===================================================== */
/* 20_MODE_PICK */
/* ===================================================== */

function pickMode(data) {
  const m = data?.usdjpy?.marketMode;
  return (typeof m === "string" && m.length) ? m : "RANGE";
}

/* ===================================================== */
/* 30_SCORE_CORE */
/* ===================================================== */

export function calcScore(data) {

  const cfg = loadConfig();
  const settings = getSettings();

  const mode = pickMode(data);
  const mcfg = getModeConfig(mode, cfg);

  /* ===== MODE WEIGHT ===== */

  let weight = 1;

  if (mode === "UPTREND" || mode === "DOWNTREND") {
    weight = settings?.trendWeight ?? 1;
  } else {
    weight = settings?.rangeWeight ?? 1;
  }

  /* ===== INPUTS (%変化) ===== */

  const sp  = num(data?.spPct);
  const vix = num(data?.vixPct);
  const tlt = num(data?.tltPct);
  const dxy = num(data?.dxyPct);

  /* ===================================================== */
  /* 31_RISK_SCORE */
  /* ===================================================== */

  const wRisk = mcfg?.weights?.risk || {};
  let riskScore = 0;

  // SP: 上昇 = risk ON
  riskScore += weightedSign(sp, wRisk.sp);

  // VIX: 上昇 = risk OFF → 符号反転
  riskScore += weightedSign(vix !== null ? -vix : null, wRisk.vix);

  // TLT: 上昇 = risk OFF → 符号反転
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

  const totalScore = Math.round((riskScore + usdScore) * weight);

  return {
    riskScore,
    usdScore,
    totalScore,
    mode,
    weight
  };
}