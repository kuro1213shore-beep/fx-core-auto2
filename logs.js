const STORAGE_KEY = "fx_logs";

// 取得
export function getLogs(){
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
}

// 保存
export function saveEntry(){

  const log = {
    date: new Date().toLocaleString(),
    env: document.getElementById("env").innerText,
    dir: document.getElementById("dir").innerText,
    rsi: document.getElementById("rsiSignal").innerText,
    order: document.getElementById("order").innerText,
    price: document.getElementById("usdPrice").innerText,
    pnl: "-",   // 今は手動後付け
    comment: "-"
  };

  const logs = getLogs();
  logs.unshift(log);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));

  renderLogs();
}

// 削除
export function deleteLog(index){
  const logs = getLogs();
  logs.splice(index,1);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  renderLogs();
}

// 全削除
export function clearLogs(){
  localStorage.removeItem(STORAGE_KEY);
  renderLogs();
}

// 表示
export function renderLogs(){

  const logs = getLogs();
  const tbody = document.getElementById("logBody");
  if(!tbody) return;

  tbody.innerHTML = "";

  logs.forEach((log,i)=>{
    const row = `
      <tr>
        <td>${log.date}</td>
        <td>${log.env}</td>
        <td>${log.dir}</td>
        <td>${log.rsi}</td>
        <td>${log.order}</td>
        <td>${log.price}</td>
        <td>${log.pnl}</td>
        <td>${log.comment}</td>
        <td><button onclick="deleteLog(${i})">X</button></td>
      </tr>
    `;
    tbody.innerHTML += row;
  });
}