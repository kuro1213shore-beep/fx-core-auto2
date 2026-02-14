import { getLogs } from "./storage.js";

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