import { getLogs, saveLogs } from "./storage.js";

export function saveEntry(){
  const last = window.lastResult;

  if(!last){
    alert("Run AUTO ANALYZE first");
    return;
  }

  const logs = getLogs();
  logs.unshift({
    time: last.time,
    session: last.session || "AUTO",
    mode: last.mode,
    env: last.env,
    dir: last.dir,
    order: last.order,
    totalScore: last.totalScore,
    resultPips: last.resultPips ?? 0,
    comment: last.comment || ""
  });

  saveLogs(logs);
  alert("Saved");
}