/* 00_IMPORT */
import { calcScore } from "./score.js";
import { analyzeLogic } from "./engine.js";
import { updateUI, setText } from "./ui.js";

/* 10_UTIL */
function fmt(n){
  return (typeof n === "number" && Number.isFinite(n))
    ? Number(n).toFixed(3)
    : "--";
}

/* 20_ANALYZE */
async function autoAnalyze(){

  try{
    const res = await fetch("/api/market", { cache:"no-store" });
    if(!res.ok) throw new Error("API ERROR");

    const data = await res.json();

    /* 21_DISPLAY_RAW */
    setText("usdPrice", fmt(data.usdjpy?.price));
    setText("usdChange", fmt(data.usdjpy?.changePct));
    setText("usdRsi", fmt(data.usdjpy?.rsi));

    setText("sp", fmt(data.spPct));
    setText("vix", fmt(data.vixPct));
    setText("tlt", fmt(data.tltPct));
    setText("dxy", fmt(data.dxyPct));
    setText("updatedAt", data.updatedAt || "--");

/* 22B_GAUGE */
const max = 4; // 今のスコア最大値（-4〜+4想定）
const percent = Math.round((Math.abs(totalScore) / max) * 100);

const fill = document.getElementById("gaugeFill");
const text = document.getElementById("gaugeText");

if (fill) fill.style.width = percent + "%";
if (text) text.innerText = percent + "%";

    /* 23_LOGIC */
    const result = analyzeLogic(data, riskScore, usdScore, totalScore);

    setText("mode", result.mode || "RANGE");

    /* 24_UI */
    updateUI(result);

  }catch(e){
    console.error(e);
    alert("API ERROR");
  }
}

/* 90_GLOBAL */
window.autoAnalyze = autoAnalyze;