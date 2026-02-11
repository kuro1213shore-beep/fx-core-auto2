export function updateUI(result){

  document.getElementById("env").innerText = result.env;
  document.getElementById("dir").innerText = result.dir;
  document.getElementById("rsiSignal").innerText = result.rsiSignal;
  document.getElementById("order").innerText = result.order;

  applyTheme(result.mode);  // ← orderじゃない
}

function applyTheme(mode){

  document.body.classList.remove("long-mode","short-mode","range-mode");

  if(mode === "UPTREND"){
    document.body.classList.add("long-mode");
  }
  else if(mode === "DOWNTREND"){
    document.body.classList.add("short-mode");
  }
  else{
    document.body.classList.add("range-mode");
  }
// ===== SIGNAL STRENGTH =====
const percent = Math.min(100, Math.max(0, (result.totalScore + 5) * 10));
const gauge = document.getElementById("signalGauge");
const text = document.getElementById("signalPercent");

if(gauge) gauge.style.width = percent + "%";
if(text) text.innerText = percent + "%";
}