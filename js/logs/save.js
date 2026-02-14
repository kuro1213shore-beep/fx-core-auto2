import { getLogs, saveLogs } from "./storage.js";
import { chooseDirection } from "./modals.js";

export async function saveEntry(){

  if(!window.lastResult){
    alert("Run AUTO ANALYZE first");
    return;
  }

  const resultPipsInput = prompt("Result pips?");
  if(resultPipsInput === null) return;

  const resultPips = Number(resultPipsInput);
  if(Number.isNaN(resultPips)){
    alert("Enter number");
    return;
  }

  const direction = await chooseDirection();
  if(!direction) return;

  const comment = prompt("Comment") || "";

  const logs = getLogs();

  const log = {
    id: Date.now(),
    date: new Date().toLocaleString(),
    direction,
    resultPips,
    win: resultPips >= 0,
    ...window.lastResult,
    comment
  };

  logs.unshift(log);
  saveLogs(logs);

  alert("Saved ✔");
}