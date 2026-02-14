import { calcScore } from "./score.js";
import { analyzeLogic } from "./engine.js";
import { updateUI, setText } from "./ui.js";
import { showLogs, showStats, saveEntry } from "./logs.js"; // ★追加

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

    /* ===== DISPLAY ===== */
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

    /* ===== 最新分析結果を保存（ログ用） ===== */
    window.lastResult = {
      time: new Date().toLocaleString(),

      mode: result.mode || "-",
      env: result.env || "-",
      dir: result.dir || "-",
      order: result.order || "-",

      riskScore,
      usdScore,
      totalScore,

      price: data.usdjpy?.price ?? "-",
      change: data.usdjpy?.change ?? "-",
      rsi: data.usdjpy?.rsi ?? "-"
    };

    /* ===== GAUGE ===== */
    const arc = document.getElementById("gaugeArc");
    const gaugeText = document.getElementById("gaugeText");
    const strengthText = document.getElementById("strengthText");

    const percent = Math.round((Math.abs(totalScore) / 4) * 100);
    const offset = 251 - (percent / 100) * 251;

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
    return;
  }

  // ===== ボタン有効化 =====
  enableActionButtons();
}

/* ===== ボタン制御 ===== */

function enableActionButtons(){
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

/* ===== HTMLから呼び出し ===== */

window.autoAnalyze = autoAnalyze;
window.showLogs = showLogs;
window.showStats = showStats;
window.saveEntry = saveEntry;   // ★超重要：これがないと動かない