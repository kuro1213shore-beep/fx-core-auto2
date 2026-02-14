const STORAGE_KEY = "fx_logs";

/* =======================
   取得
======================= */
export function getLogs(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  }catch{
    return [];
  }
}

/* =======================
   保存
======================= */
export function saveEntry(){

  // 分析前保存防止
  if(!window.lastResult){
    alert("先に AUTO ANALYZE を実行してください");
    return;
  }

  const logs = getLogs();

  const resultPipsInput = prompt("Result pips? 例: 25 / -12");
  if(resultPipsInput === null) return;

  const resultPips = Number(resultPipsInput);

  if(Number.isNaN(resultPips)){
    alert("数値で入力してください");
    return;
  }

 const direction = confirm("LONGにしますか？\nキャンセル → SHORT")
  ? "LONG"
  : "SHORT";
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

    // ===== 分析結果 =====
    env: window.lastResult.env,
    dir: window.lastResult.dir,
    order: window.lastResult.order,

    // ===== トレード結果 =====
    direction: direction.toUpperCase(),
    resultPips,
    win: resultPips >= 0,

    // ===== 補助情報 =====
    session: getSession(),
    comment
  };

  logs.unshift(log);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));

  alert("Saved ✔");
}

/* =======================
   セッション判定
======================= */
function getSession(){
  const hour = new Date().getHours();
  if(hour >= 8 && hour < 15) return "TOKYO";
  if(hour >= 15 && hour < 21) return "LONDON";
  return "NY";
}

/* =======================
   削除
======================= */
export function deleteLog(index){
  const logs = getLogs();
  logs.splice(index,1);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
}

/* =======================
   全削除
======================= */
export function clearLogs(){
  if(confirm("Delete ALL logs?")){
    localStorage.removeItem(STORAGE_KEY);
  }
}

/* =======================
   統計
======================= */
export function getStats(){
  const logs = getLogs();
  if(logs.length === 0) return null;

  const wins = logs.filter(l => l.win).length;
  const totalPips = logs.reduce((sum,l)=> sum + l.resultPips,0);

  return {
    trades: logs.length,
    winRate: Math.round((wins / logs.length) * 100),
    totalPips,
    avgPips: Math.round(totalPips / logs.length)
  };
}

/* =======================
   ログ表示（スマホ）
======================= */
export function showLogs(){
  const logs = getLogs();

  if(!logs.length){
    alert("No logs yet");
    return;
  }

  let text = "";

  logs.forEach(l => {
    text += `
${l.date}
${l.session} | ${l.mode}

ENV: ${l.env} / DIR: ${l.dir}
ORDER: ${l.order}

Score: ${l.totalScore}
Result: ${l.resultPips} pips
${l.comment || ""}
----------------
`;
  });

  alert(text);
}

/* =======================
   統計表示
======================= */
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