import { getLogs } from "./storage.js";

export function showStats(){

  const logs = getLogs();
  if(!logs.length){
    alert("No data");
    return;
  }

  const wins = logs.filter(l => l.win).length;
  const totalPips = logs.reduce((sum,l)=> sum + l.resultPips,0);

  alert(
`Trades: ${logs.length}
WinRate: ${Math.round((wins/logs.length)*100)}%
Total: ${totalPips} pips
Avg: ${Math.round(totalPips/logs.length)} pips`
  );
}