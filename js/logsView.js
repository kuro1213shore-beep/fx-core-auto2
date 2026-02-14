import { getLogs, saveLogs } from "./logs.js";

const table = document.getElementById("logTable");
let logs = getLogs();

/* =========================
   DELETE
========================= */

function deleteLog(index){
  logs.splice(index,1);
  saveLogs(logs);
  render();
}

/* =========================
   SWIPE
========================= */

function enableSwipe(row, index){

  let startX = 0;
  let currentX = 0;
  let moved = false;

  row.addEventListener("touchstart", e=>{
    startX = e.touches[0].clientX;
  });

  row.addEventListener("touchmove", e=>{
    currentX = e.touches[0].clientX;
    const diff = currentX - startX;

    if(diff < 0){
      moved = true;
      row.style.transform = `translateX(${diff}px)`;
    }
  });

  row.addEventListener("touchend", ()=>{
    const diff = currentX - startX;

    if(diff < -80){
      deleteLog(index);
    }else{
      row.style.transform = "translateX(0)";
    }
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
    enableSwipe(row, row.dataset.index);
  });
}

render();