/* ===================================================== */
/* 00_IMPORT */
/* ===================================================== */
import { calcScore } from "./score.js";
import { analyzeLogic } from "./engine.js";
import { updateUI, setText } from "./ui.js";

/* ===================================================== */
/* 10_UTIL */
/* ===================================================== */
function fmt(n) {
  return (typeof n === "number" && Number.isFinite(n))
    ? Number(n).toFixed(3)
    : "--";
}

/* ===================================================== */
/* 20_ANALYZE */
/* ===================================================== */
async function autoAnalyze() {

  try {

    /* ===== API ===== */
    const res = await fetch("/api/market");
    if (!res.ok) throw new Error("API ERROR");

    const data = await res.json();

    /* ===================================================== */
    /* 21_DISPLAY_RAW */
    /* ===================================================== */

    setText("usdPrice", fmt(data.usdjpy?.price));
    setText("usdChange", fmt(data.usdjpy?.change));
    setText("usdRsi", fmt(data.usdjpy?.rsi));

    setText("sp", fmt(data.spPct));
    setText("vix", fmt(data.vixPct));
    setText("tlt", fmt(data.tltPct));
    setText("dxy", fmt(data.dxyPct));

    setText("updatedAt", data.updatedAt || "--");

    /* ===================================================== */
    /* 22_SCORE */
    /* ===================================================== */

    const { riskScore, usdScore, totalScore } = calcScore(data);

    setText("riskScore", riskScore);
    setText("usdScore", usdScore);
    setText("totalScore", totalScore);

    /* ===================================================== */
    /* 23_LOGIC */
    /* ===================================================== */

    const result = analyzeLogic(data, riskScore, usdScore, totalScore);

    setText("mode", result.mode || "RANGE");

    /* ===================================================== */
    /* 24_UI */
    /* ===================================================== */

    updateUI(result);

    /* ===================================================== */
    /* 25_GAUGE */
    /* ===================================================== */

 /* 22B_GAUGE */
const max = 4;
const percent = Math.round((Math.abs(totalScore) / max) * 100);

const arc = document.getElementById("gaugeArc");
const text = document.getElementById("gaugeText");
const strength = document.getElementById("strengthText");

const circumference = 251; // 半円長さ

if (arc){
  const offset = circumference - (percent / 100) * circumference;
  arc.style.strokeDashoffset = offset;
}

if (text){
  text.innerText = percent + "%";
}

if (strength){
  if (percent >= 70) strength.innerText = "STRONG";
  else if (percent >= 40) strength.innerText = "MODERATE";
  else strength.innerText = "WEAK";

}

/* ===================================================== */
/* 90_GLOBAL */
/* ===================================================== */

window.autoAnalyze = autoAnalyze;

/* saveEntry がまだ未実装なら安全対策 */
window.saveEntry = function () {
  alert("SAVE ENTRY not implemented yet");
};