import { getLogs, deleteLog as deleteLogFromStorage } from "./logs.js";

const table = document.getElementById("logTable");
let logs = getLogs();

/* =========================
   DELETE
========================= */

function deleteLog(index){
  deleteLogFromStorage(index);
  logs = getLogs();
  render();
}

/* =========================
   SWIPE
========================= */

function enableSwipe(row, index){

  let startX = 0;
  let currentX = 0;
  let isSwiping = false;

  row.addEventListener("touchstart", e=>{
    startX = e.touches[0].clientX;
    isSwiping = false;
  });

  row.addEventListener("touchmove", e=>{
    currentX = e.touches[0].clientX;
    const diff = currentX - startX;

    // 横スワイプ検知（縦スクロール妨害防止）
    if(Math.abs(diff) > 10){
      isSwiping = true;
    }

    if(isSwiping && diff < 0){
      row.classList.add("swiping");
      row.style.transform = `translateX(${diff}px)`;

      // 背景表示
      const bg = row.previousElementSibling;
      if(bg) bg.style.opacity = 1;
    }
  });

  row.addEventListener("touchend", ()=>{
    const diff = currentX - startX;
    const bg = row.previousElementSibling;

    if(isSwiping && diff < -80){
      deleteLog(index);
      return;
    }

    row.style.transform = "translateX(0)";
    row.classList.remove("swiping");

    if(bg) bg.style.opacity = 0;
  });
}

/* =========================
   RENDER
========================= */

function render(){

  if(!logs.length){
    table.innerHTML = "<p>No logs</p>";
    return;
  }

  let html = "";

  logs.forEach((l,i)=>{
    html += `
      <div class="logRowWrap">
        <div class="deleteBg">DELETE</div>
        <div class="logRow" data-index="${i}">
          <table>
            <tr>
              <td>${l.date}</td>
              <td>${l.mode}</td>
              <td>${l.direction || "-"}</td>
              <td>${l.totalScore ?? "-"}</td>
              <td>${l.resultPips ?? "-"}</td>
              <td>${l.comment || ""}</td>
            </tr>
          </table>
        </div>
      </div>
    `;
  });

  table.innerHTML = html;

  document.querySelectorAll(".logRow").forEach(row=>{
    enableSwipe(row, Number(row.dataset.index));
  });
}

render();