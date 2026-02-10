const STORAGE_KEY = "fx_logs";

// 取得
export function getLogs(){
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

// 保存
export function saveEntry(){
  const logs = getLogs();

  const log = {
    date: new Date().toLocaleString(),
    mode: document.getElementById("mode")?.innerText || "-",
    price: document.getElementById("usdPrice")?.innerText || "-",
    change: document.getElementById("usdChange")?.innerText || "-",
    rsi: document.getElementById("usdRsi")?.innerText || "-",
    riskScore: document.getElementById("riskScore")?.innerText || "-",
    usdScore: document.getElementById("usdScore")?.innerText || "-",
    totalScore: document.getElementById("totalScore")?.innerText || "-"
  };

  logs.unshift(log);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));

  alert("Saved ✔");
}

// 削除
export function deleteLog(index){
  const logs = getLogs();
  logs.splice(index,1);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
}