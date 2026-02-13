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

  const resultPips = prompt("Result pips? 例: 25 / -12");
  if(resultPips === null) return;

  const direction = prompt("Direction? LONG / SHORT") || "-";
  const comment = prompt("Comment (optional)") || "";

  const log = {
    id: Date.now(),

    date: new Date().toLocaleString(),

    // ===== 市場状態 =====
    mode: document.getElementById("mode")?.innerText || "-",
    price: document.getElementById("usdPrice")?.innerText || "-",
    change: document.getElementById("usdChange")?.innerText || "-",
    rsi: document.getElementById("usdRsi")?.innerText || "-",

    // ===== スコア =====
    riskScore: Number(document.getElementById("riskScore")?.innerText || 0),
    usdScore: Number(document.getElementById("usdScore")?.innerText || 0),
    totalScore: Number(document.getElementById("totalScore")?.innerText || 0),

    // ===== トレード結果 =====
    direction: direction.toUpperCase(),
    resultPips: Number(resultPips),
    win: Number(resultPips) >= 0,

    // ===== 補助情報 =====
    session: getSession(),   // Tokyo / London / NY
    comment: comment
  };

  logs.unshift(log);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));

  alert("Saved ✔");
}

// =======================
// セッション判定
// =======================
function getSession(){
  const hour = new Date().getHours();

  if(hour >= 8 && hour < 15) return "TOKYO";
  if(hour >= 15 && hour < 21) return "LONDON";
  return "NY";
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
// 全削除
// =======================
export function clearLogs(){
  if(confirm("Delete ALL logs?")){
    localStorage.removeItem(STORAGE_KEY);
  }
}

// =======================
// 📊 簡易統計
// =======================
export function getStats(){
  const logs = getLogs();
  if(logs.length === 0) return null;

  const wins = logs.filter(l => l.win).length;
  const losses = logs.length - wins;

  const totalPips = logs.reduce((sum,l)=> sum + l.resultPips,0);

  const avg = Math.round(totalPips / logs.length);

  return {
    trades: logs.length,
    winRate: Math.round((wins / logs.length) * 100),
    totalPips: totalPips,
    avgPips: avg
  };
}

// =======================
// 📱 ログ表示（スマホ用）
// =======================
export function showLogs(){

  const logs = getLogs();

  if(logs.length === 0){
    alert("No logs yet");
    return;
  }

  let text = "";

  logs.slice(0,20).forEach(l => {
    text += `${l.resultPips}p ${l.direction}\n`;
    text += `Score:${l.totalScore}  ${l.mode}\n`;
    text += `${l.session}\n`;
    text += `---\n`;
  });

  alert(text);
}

// =======================
// 📊 統計表示
// =======================
export function showStats(){
  const s = getStats();
  if(!s){
    alert("No data");
    return;
  }

  alert(
`Trades: ${s.trades}
WinRate: ${s.winRate}%
Total: ${s.totalPips} pips
Avg: ${s.avgPips} pips`
  );
}