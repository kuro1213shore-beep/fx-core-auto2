import { getLogs, deleteLog } from "./storage.js";

console.log("viewer loaded");

/* =========================
   画面表示
========================= */
function renderLogs(){
  const container = document.getElementById("logTable");
  if(!container) return;

  const logs = getLogs();

  if(!logs.length){
    container.innerHTML = `
      <p style="opacity:.6;padding:20px;">
        No logs yet
      </p>
    `;
    return;
  }

  container.innerHTML = logs.map((log, index) => `
    <div class="logRowWrap">

      <div class="deleteBg">DEL</div>

      <div class="logRow">
        <div style="padding:14px">

          <div style="font-weight:600">
            ${log.date}
          </div>

          <div style="opacity:.6;font-size:12px">
            ${log.session} | ${log.mode}
          </div>

          <div style="margin-top:6px">
            ENV: ${log.env} / DIR: ${log.dir}
          </div>

          <div>
            ORDER: ${log.order}
          </div>

          <div style="margin-top:6px">
            Score: ${log.totalScore}
          </div>

          <div style="font-weight:600">
            Result: ${log.resultPips} pips
          </div>

          ${log.comment ? `<div style="opacity:.7">${log.comment}</div>` : ""}

        </div>
      </div>

    </div>
  `).join("");

  enableSwipeDelete();
}

/* =========================
   スワイプ削除
========================= */
function enableSwipeDelete(){
  const wraps = document.querySelectorAll(".logRowWrap");

  wraps.forEach((wrap, index) => {
    const row = wrap.querySelector(".logRow");
    const bg = wrap.querySelector(".deleteBg");

    let startX = 0;
    let currentX = 0;

    wrap.addEventListener("touchstart", e => {
      startX = e.touches[0].clientX;
    });

    wrap.addEventListener("touchmove", e => {
      currentX = e.touches[0].clientX;
      const diff = currentX - startX;

      if(diff < 0){
        row.style.transform = `translateX(${diff}px)`;
        bg.style.opacity = "1";
      }
    });

    wrap.addEventListener("touchend", () => {
      const diff = currentX - startX;

      if(diff < -80){
        deleteLog(index);
        renderLogs();
      }else{
        row.style.transform = "";
        bg.style.opacity = "0";
      }
    });
  });
}

/* =========================
   統計
========================= */
export function showStats(){
  const logs = getLogs();

  if(!logs.length){
    alert("No data");
    return;
  }

  const wins = logs.filter(l => l.win).length;
  const totalPips = logs.reduce((s,l)=>s+l.resultPips,0);

  alert(
`Trades: ${logs.length}
WinRate: ${Math.round(wins/logs.length*100)}%
Total: ${totalPips} pips
Avg: ${Math.round(totalPips/logs.length)} pips`
  );
}

/* =========================
   起動時に表示
========================= */
document.addEventListener("DOMContentLoaded", renderLogs);