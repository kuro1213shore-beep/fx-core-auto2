export function saveEntry(){

  const entry = {
    date: new Date().toLocaleString(),
    env: document.getElementById("env").innerText,
    dir: document.getElementById("dir").innerText,
    rsi: document.getElementById("rsiSignal").innerText,
    order: document.getElementById("order").innerText,
    price: document.getElementById("usdPrice").innerText,
    pnl: "",
    comment: ""
  };

  let logs = JSON.parse(localStorage.getItem("tradeLogs") || "[]");
  logs.push(entry);
  localStorage.setItem("tradeLogs", JSON.stringify(logs));

  alert("Saved ✅");
}