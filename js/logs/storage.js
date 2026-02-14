const STORAGE_KEY = "fx_logs";

export function getLogs(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  }catch{
    return [];
  }
}

export function saveLogs(logs){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
}

export function clearLogs(){
  if(confirm("Delete ALL logs?")){
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function deleteLog(index){
  const logs = getLogs();
  logs.splice(index,1);
  saveLogs(logs);
}