import { addLog } from "./logs.js";
import { chooseDirection } from "./modals.js";

export async function saveEntry(){

  if(!window.lastResult){
    alert("Run AUTO ANALYZE first");
    return;
  }

  const resultPips = Number(prompt("Result pips"));

  const direction = await chooseDirection();
  if(!direction) return;

  const log = {
    ...window.lastResult,
    direction,
    resultPips,
    win: resultPips >= 0,
    session: "AUTO"
  };

  addLog(log);

  alert("Saved ✔");
}