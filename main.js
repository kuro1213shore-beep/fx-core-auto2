import { calcScore } from "./score.js";
import { analyzeLogic } from "./engine.js";
import { updateUI, setText } from "./ui.js";
import { showLogs, showStats } from "./logs.js";

function fmt(n){
  return (typeof n === "number" && Number.isFinite(n))
    ? Number(n).toFixed(3)
    : "--";
}

async function autoAnalyze(){

  try{
    const res = await fetch("/api/market");
    if(!res.ok) throw new Error("API ERROR");

    const data = await res.json();

    /* ===== DISPLAY RAW ===== */
    setText("usdPrice", fmt(data.usdjpy?.price));
    setText("usdChange", fmt(data.usdjpy?.change));
    setText("usdRsi", fmt(data.usdjpy?.rsi));

    setText("sp", fmt(data.spPct));
    setText("vix", fmt(data.vixPct));
    setText("tlt", fmt(data.tltPct));
    setText("dxy", fmt(data.dxyPct));
    setText("updatedAt", data.updatedAt || "--");

    /* ===== SCORE ===== */
    const { riskScore, usdScore, totalScore } = calcScore(data);

    setText("riskScore", riskScore);
    setText("usdScore", usdScore);
    setText("totalScore", totalScore);

    /* ===== LOGIC ===== */
    const result = analyzeLogic(data, riskScore, usdScore, totalScore);

    setText("mode", result.mode || "RANGE");
    updateUI(result);

    /* ===== SVG GAUGE ===== */
    const arc = document.getElementById("gaugeArc");
    const gaugeText = document.getElementById("gaugeText");
    const strengthText = document.getElementById("strengthText");

    const max = 4;
    const percent = Math.round((Math.abs(totalScore) / max) * 100);

    const totalLength = 251;
    const offset = totalLength - (percent / 100) * totalLength;

    if(arc) arc.style.strokeDashoffset = offset;
    if(gaugeText) gaugeText.innerText = percent + "%";

    if(strengthText){
      if(percent < 30) strengthText.innerText = "WEAK";
      else if(percent < 60) strengthText.innerText = "NORMAL";
      else if(percent < 80) strengthText.innerText = "STRONG";
      else strengthText.innerText = "EXTREME";
    }

  }catch(e){
    console.error(e);
    alert("API ERROR");
  }

  // ===== ボタン有効化（Safari対策） =====
  setTimeout(() => {
    const saveBtn = document.getElementById("saveBtn");
    const logBtn = document.getElementById("logBtn");

    if(saveBtn) saveBtn.disabled = false;
    if(logBtn) logBtn.disabled = false;
  }, 100);
}

// ===== グローバル公開（HTMLボタン用） =====
window.autoAnalyze = autoAnalyze;
window.showLogs = showLogs;
window.showStats = showStats;