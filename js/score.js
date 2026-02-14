/* ===================================================== */
/* SCORE ENGINE */
/* ===================================================== */

import { loadConfig, getModeConfig } from "./config.js";

/* ===================================================== */
/* UTILS */
/* ===================================================== */

function num(x){
  return (typeof x === "number" && Number.isFinite(x)) ? x : null;
}

function signScore(v){
  if(v === null) return 0;
  if(v > 0) return 1;
  if(v < 0) return -1;
  return 0;
}

function weightedSign(v,w){
  const s = signScore(v);
  const ww = (typeof w === "number" && Number.isFinite(w)) ? w : 0;
  return s * ww;
}

/* ===================================================== */
/* MODE */
/* ===================================================== */

function pickMode(data){
  const m = data?.usdjpy?.marketMode;
  return (typeof m === "string" && m.length) ? m : "RANGE";
}

/* ===================================================== */
/* CORE */
/* ===================================================== */

export function calcScore(data){

  const cfg = loadConfig();

  const mode = pickMode(data);
  const mcfg = getModeConfig(mode, cfg);

  /* ===== MODE WEIGHT ===== */

  let weight = 1;

  if(mode === "UPTREND" || mode === "DOWNTREND"){
    weight = cfg.trendWeight ?? 1;
  }else{
    weight = cfg.rangeWeight ?? 1;
  }

  /* ===== INPUTS ===== */

  const sp  = num(data?.spPct);
  const vix = num(data?.vixPct);
  const tlt = num(data?.tltPct);
  const dxy = num(data?.dxyPct);

  /* ===================================================== */
  /* RISK SCORE */
  /* ===================================================== */

  const wRisk = mcfg?.weights?.risk || {};
  let riskScore = 0;

  // SP ↑ = risk ON
  riskScore += weightedSign(sp, wRisk.sp);

  // VIX ↑ = risk OFF
  riskScore += weightedSign(vix !== null ? -vix : null, wRisk.vix);

  // TLT ↑ = risk OFF
  riskScore += weightedSign(tlt !== null ? -tlt : null, wRisk.tlt);

  /* ===================================================== */
  /* USD SCORE */
  /* ===================================================== */

  const wUsd = mcfg?.weights?.usd || {};
  let usdScore = 0;

  usdScore += weightedSign(dxy, wUsd.dxy);

  /* ===================================================== */
  /* TOTAL */
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