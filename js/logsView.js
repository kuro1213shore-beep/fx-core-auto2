import { getLogs } from "./logs.js";

const table = document.getElementById("logTable");

if(!table){
  console.error("logTable not found");
}

const logs = getLogs();

if(!logs || logs.length === 0){
  table.innerHTML = "<p>No logs yet</p>";
}else{

  let html = `
  <table>
    <tr>
      <th>Date</th>
      <th>Mode</th>
      <th>Dir</th>
      <th>Score</th>
      <th>Result</th>
      <th>Note</th>
    </tr>
  `;

  logs.forEach(l=>{
    html += `
      <tr>
        <td>${l.date || "-"}</td>
        <td>${l.mode || "-"}</td>
        <td>${l.direction || "-"}</td>
        <td>${l.totalScore ?? "-"}</td>
        <td>${l.resultPips ?? "-"}</td>
        <td>${l.comment || ""}</td>
      </tr>
    `;
  });

  html += "</table>";

  table.innerHTML = html;
}