/* ===================================================== */
/* 00_SET_TEXT */
/* ===================================================== */
export function setText(id, value){
  const el = document.getElementById(id);
  if(el) el.innerText = value;
}

/* ===================================================== */
/* 10_THEME */
/* ===================================================== */
function setTheme(mode){
  document.body.classList.remove("long-mode","short-mode","range-mode");

  if(mode === "LONG") document.body.classList.add("long-mode");
  else if(mode === "SHORT") document.body.classList.add("short-mode");
  else document.body.classList.add("range-mode");
}

/* ===================================================== */
/* 20_UPDATE_UI */
/* ===================================================== */
export function updateUI(result){

  setText("env", result.env);
  setText("dir", result.dir);
  setText("rsiSignal", result.rsiSignal);
  setText("order", result.order);

  setTheme(result.mode);

  /* ===== 30_GAUGE ===== */

  const max = 4; // totalScore最大値
  const percent = Math.round(
    (Math.abs(result.totalScore) / max) * 100
  );

  const fill = document.getElementById("gaugeFill");
  const text = document.getElementById("gaugeText");

  if(fill) fill.style.width = percent + "%";
  if(text) text.innerText = percent + "%";
}