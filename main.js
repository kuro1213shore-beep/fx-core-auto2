/* ===================================================== */
/* 00_IMPORT */
/* ===================================================== */
import { calcScore } from "./score.js";
import { analyzeLogic } from "./engine.js";
import { updateUI, setText } from "./ui.js";

/* ===================================================== */
/* 10_UTIL */
/* ===================================================== */
function fmt(n){
  return typeof n === "number" && !Number.isNaN(n)
    ? n.toFixed(2)
    : "--";
}

/* ===================================================== */
/* 20_MARKET_DATA (安定取得版) */
/* ===================================================== */

async function getMarketData(){

  // ★ ここを後でAPIに差し替え可能

  return {
    usdjpy: { price: 152.34, change: 0.12, rsi: 55 },
    spPct: 0.42,
    vixPct: -1.15,
    tltPct: 0.30,
    dxyPct: 0.28,
    updatedAt: new Date().toLocaleTimeString()
  };
}

/* ===================================================== */
/* 30_ANALYZE */
/* ===================================================== */
async function autoAnalyze(){

  try {

    const data = await getMarketData();

    /* ===== RAW DISPLAY ===== */

    setText("usdPrice", fmt(data.usdjpy.price));
    setText("usdChange", fmt(data.usdjpy.change));
    setText("usdRsi", fmt(data.usdjpy.rsi));

    setText("sp", fmt(data.spPct));
    setText("vix", fmt(data.vixPct));
    setText("tlt", fmt(data.tltPct));
    setText("dxy", fmt(data.dxyPct));

    setText("updatedAt", data.updatedAt);

    /* ===== SCORE ===== */

    const { riskScore, usdScore, totalScore } = calcScore(data);

    /* ===== LOGIC ===== */

    const result = analyzeLogic(data, riskScore, usdScore);

    setText("mode", result.mode || "RANGE");

    /* ===== UI UPDATE ===== */

    updateUI(result);

    /* ===== GAUGE ===== */

    const percent = Math.round(Math.abs(totalScore));

    const arc = document.getElementById("gaugeArc");
    const text = document.getElementById("gaugeText");
    const strength = document.getElementById("strengthText");

    const circumference = 251;

    if (arc){
      const offset = circumference - (percent / 100) * circumference;
      arc.style.strokeDashoffset = offset;
    }

    if (text){
      text.innerText = percent + "%";
    }

    if (strength){
      if (percent >= 70) strength.innerText = "STRONG";
      else if (percent >= 40) strength.innerText = "NEUTRAL";
      else strength.innerText = "WEAK";
    }

  } catch (err){
    console.error("Analyze Error:", err);
  }
}

/* ===================================================== */
/* 90_GLOBAL */
/* ===================================================== */

window.autoAnalyze = autoAnalyze;

window.saveEntry = function(){
  alert("SAVE ENTRY not implemented yet");
};

/* 自動起動（ページ開いたら実行） */
autoAnalyze();