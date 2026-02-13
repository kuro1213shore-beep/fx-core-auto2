const STORAGE_KEY = "fx_logs";

// =======================
// 取得
// =======================
export function getLogs(){
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

// =======================
// 保存
// =======================
export function saveEntry(){

  const logs = getLogs();

  // 🔹 結果入力（最低限）
  const resultPips = prompt("Result pips? 例: 25 / -12");
  if(resultPips === null) return;

  const direction = prompt("Direction? LONG / SHORT") || "-";
  const comment = prompt("Comment (optional)") || "";

  const log = {
    id: Date.now(),

    date: new Date().toLocaleString(),

    mode: document.getElementById("mode")?.innerText || "-",

    price: document.getElementById("usdPrice")?.innerText || "-",
    change: document.getElementById("usdChange")?.innerText || "-",
    rsi: document.getElementById("usdRsi")?.innerText || "-",

    riskScore: Number(document.getElementById("riskScore")?.innerText || 0),
    usdScore: Number(document.getElementById("usdScore")?.innerText || 0),
    totalScore: Number(document.getElementById("totalScore")?.innerText || 0),

    direction: direction,
    resultPips: Number(resultPips),
    win: Number(resultPips) >= 0,

    comment: comment
  };

  logs.unshift(log);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));

  alert("Saved ✔");
}

// =======================
// 削除
// =======================
export function deleteLog(index){
  const logs = getLogs();
  logs.splice(index,1);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
}

// =======================
// 全削除（保守用）
// =======================
export function clearLogs(){
  if(confirm("Delete ALL logs?")){
    localStorage.removeItem(STORAGE_KEY);
  }
}