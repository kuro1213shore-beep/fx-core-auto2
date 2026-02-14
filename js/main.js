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

    setText("usdPrice", fmt(data.usdjpy?.price));
    setText("usdChange", fmt(change));
    setText("usdRsi", fmt(data.usdjpy?.rsi));

    setText("sp", fmt(data.spPct));
    setText("vix", fmt(data.vixPct));
    setText("tlt", fmt(data.tltPct));
    setText("dxy", fmt(data.dxyPct));
    setText("updatedAt", data.updatedAt || "--");

    const { riskScore, usdScore, totalScore } = calcScore(data);

    setText("riskScore", riskScore);
    setText("usdScore", usdScore);
    setText("totalScore", totalScore);

    const result = analyzeLogic(data, riskScore, usdScore, totalScore);
    updateUI(result);

    const arc = document.getElementById("gaugeArc");
    const gaugeText = document.getElementById("gaugeText");

    const percent = Math.round((Math.abs(totalScore || 0) / 4) * 100);
    const offset = 251 - (percent / 100) * 251;

    if(arc) arc.style.strokeDashoffset = offset;
    if(gaugeText) gaugeText.innerText = percent + "%";

  }catch(e){
    console.error("ERROR:", e);
    alert(e.message);
  }
}

/* ========= GLOBAL ========= */

window.autoAnalyze = autoAnalyze;
window.saveEntry = saveEntry;
window.showStats = () => location.href="logs.html";