console.log("main loaded");

/* ========= IMPORT ========= */

import { calcScore } from "./score.js";
import { analyzeLogic } from "./engine.js";
import { updateUI, setText } from "./ui.js";
import { saveEntry } from "./logs/save.js";

/* ========= FORMAT ========= */

function fmt(n){
  if (n === null || n === undefined) return "--";
  if (typeof n !== "number" || !Number.isFinite(n)) return "--";
  return Number(n).toFixed(3);
}

/* ========= AUTO ANALYZE ========= */

async function autoAnalyze(){

  try{
    const res = await fetch("https://fx-core-auto.vercel.app/api/market");

    if(!res.ok) throw new Error("API ERROR");

    const data = await res.json();

    console.log("API:", data);

    const change =
      data.usdjpy?.change ??
      data.usdjpy?.changePct ??
      data.usdjpy?.delta ??
      null;

    /* ===== DISPLAY ===== */

    setText("usdPrice", fmt(data.usdjpy?.price));
    setText("usdChange", fmt(change));
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

    // ⭐⭐⭐ ここが超重要 ⭐⭐⭐
    updateUI({ ...result, totalScore });

    /* ===== GAUGE SVG ===== */

    const arc = document.getElementById("gaugeArc");
    const gaugeText = document.getElementById("gaugeText");
    const strengthText = document.getElementById("strengthText");

    const percent = Math.round((Math.abs(totalScore || 0) / 4) * 100);
    const offset = 251 - (percent / 100) * 251;

    if(arc) arc.style.strokeDashoffset = offset;
    if(gaugeText) gaugeText.innerText = percent + "%";

    if(strengthText){
      if(percent < 30) strengthText.innerText = "WEAK";
      else if(percent < 60) strengthText.innerText = "NORMAL";
      else if(percent < 80) strengthText.innerText = "STRONG";
      else strengthText.innerText = "EXTREME";
    }

    enableButtons();

  }catch(e){
    console.error("ERROR:", e);
    alert(e.message);
  }
}

/* ========= BUTTON ENABLE ========= */

function enableButtons(){
  const saveBtn = document.getElementById("saveBtn");
  const logBtn = document.getElementById("logBtn");

  if(saveBtn){
    saveBtn.classList.remove("btnDisabled");
    saveBtn.classList.add("btnEnabled");
  }

  if(logBtn){
    logBtn.classList.remove("btnDisabled");
    logBtn.classList.add("btnEnabled");
  }
}

/* ========= GLOBAL ========= */

window.autoAnalyze = autoAnalyze;
window.saveEntry = saveEntry;
window.showStats = () => location.href="logs.html";