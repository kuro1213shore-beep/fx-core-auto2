import { getLogs } from "./storage.js";

console.log("viewer loaded"); // ← 読み込み確認

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