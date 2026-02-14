const KEY = "fx_settings";

export function getSettings(){
  const raw = localStorage.getItem(KEY);
  if(raw) return JSON.parse(raw);

  return {
    trendWeight: 1.5,
    rangeWeight: 1.0
  };
}

export function saveSettings(settings){
  localStorage.setItem(KEY, JSON.stringify(settings));
}