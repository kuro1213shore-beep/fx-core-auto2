console.log("main loaded");

/* ========= FORMAT ========= */

function fmt(n){
  if (n === null || n === undefined) return "--";
  if (typeof n !== "number" || !Number.isFinite(n)) return "--";
  return Number(n).toFixed(3);
}

/* ========= API ========= */

async function autoAnalyze(){

  try{

    console.log("fetch start");

    const res = await fetch("https://fx-core-auto.vercel.app/api/market");

    console.log("status:", res.status);

    if(!res.ok){
      alert("API STATUS ERROR: " + res.status);
      return;
    }

    const data = await res.json();

    console.log("DATA:", data);

    // ===== 表示 =====

    document.getElementById("usdPrice").innerText =
      fmt(data.usdjpy?.price);

    document.getElementById("usdChange").innerText =
      fmt(data.usdjpy?.changePct);

    document.getElementById("usdRsi").innerText =
      fmt(data.usdjpy?.rsi);

    // ===== ダミースコア表示 =====
    // （まず動作確認優先）

    document.getElementById("riskScore").innerText = "OK";
    document.getElementById("usdScore").innerText = "OK";
    document.getElementById("totalScore").innerText = "OK";

    document.getElementById("gaugeText").innerText = "100%";

    alert("SUCCESS");

  }catch(e){

    console.error("ERROR:", e);
    alert("LOAD FAILED");

  }
}

/* 🔥 ボタンから呼べるようにする */
window.autoAnalyze = autoAnalyze;