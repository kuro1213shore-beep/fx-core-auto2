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
export async function saveEntry(){

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

  const direction = await chooseDirection();
  if(!direction) return;
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

export function chooseDirection(){

  return new Promise(resolve => {

    const modal = document.createElement("div");
    modal.style.position = "fixed";
    modal.style.inset = "0";
    modal.style.background = "rgba(0,0,0,0.4)";
    modal.style.display = "flex";
    modal.style.alignItems = "center";
    modal.style.justifyContent = "center";
    modal.style.zIndex = "9999";

    modal.innerHTML = `
      <div style="
        background:#1b2235;
        padding:24px;
        border-radius:18px;
        text-align:center;
        width:80%;
        max-width:320px;
        box-shadow:0 10px 30px rgba(0,0,0,.6);
      ">
        <div style="margin-bottom:18px;font-size:18px;">
          Direction
        </div>

        <div style="display:flex;gap:12px;">
          <button id="longBtn" style="
            flex:1;padding:14px;border-radius:12px;
            background:#00c896;color:white;border:none;">
            LONG
          </button>

          <button id="shortBtn" style="
            flex:1;padding:14px;border-radius:12px;
            background:#ff4d4d;color:white;border:none;">
            SHORT
          </button>
        </div>

        <button id="cancelBtn" style="
          margin-top:14px;
          padding:10px 20px;
          border-radius:10px;
          border:none;
          background:#555;
          color:white;">
          CANCEL
        </button>
      </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector("#longBtn").onclick = () => {
      modal.remove();
      resolve("LONG");
    };

    modal.querySelector("#shortBtn").onclick = () => {
      modal.remove();
      resolve("SHORT");
    };

    modal.querySelector("#cancelBtn").onclick = () => {
      modal.remove();
      resolve(null);
    };

  });
}