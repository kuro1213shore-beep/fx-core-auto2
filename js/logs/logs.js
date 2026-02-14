import { getLogs, saveLogs } from "./storage.js";

export function addLog(log){
  const logs = getLogs();
  logs.unshift(log);
  saveLogs(logs);
}