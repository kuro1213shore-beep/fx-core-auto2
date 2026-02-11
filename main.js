/* ===================================================== */
/* 00_IMPORTS */
/* ===================================================== */

import { calcScore } from "./score.js";
import { analyzeLogic } from "./engine.js";
import { updateUI, setText } from "./ui.js";

/* ===================================================== */
/* 10_UTILS */
/* ===================================================== */

function fmt(n){
  return (typeof n === "number" && Number.isFinite(n))
    ? Number(n).toFixed(3)
    : "--";
}

/* ===================================================== */
/* 20_CORE_ANALYZE */
/* ===================================================== */

async function autoAnalyze(){

  try{
    /* ---------- 21_FETCH ---------- */
    const res = await fetch("/api/market", { cache:"no-store" });
    if(!res.ok) throw new Error("API ERROR");
    const data = await res.json();

    /* ---------- 22_DISPLAY_RAW ---------- */
    setText("usdPrice",  fmt(data.usdjpy?.price));
    setText("usdChange", fmt(data.usdjpy?.changePct));
    setText("usdRsi",    fmt(data.usdjpy?.rsi));

    setText("sp",  fmt(data.spPct));
    setText("vix", fmt(data.vixPct));
    setText("tlt", fmt(data.tltPct));
    setText("dxy", fmt(data.dxyPct));

    setText("updatedAt", data.updatedAt || "--");

    /* ---------- 23_SCORE ---------- */
    const { riskScore, usdScore, totalScore } = calcScore(data);

    setText("riskScore", riskScore);
    setText("usdScore", usdScore);
    setText("totalScore", totalScore);

    /* ---------- 24_LOGIC ---------- */
    const result = analyzeLogic(data, riskScore, usdScore, totalScore);

    setText("mode", result.mode || "RANGE");

    /* ---------- 25_UI ---------- */
    updateUI(result);

  }catch(e){
    console.error(e);
    alert("API ERROR");
  }
}

/* ===================================================== */
/* 90_GLOBAL_BIND */
/* ===================================================== */

window.autoAnalyze = autoAnalyze;