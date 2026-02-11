/* ===================================================== */
/* 00_TEXT_HELPER */
/* ===================================================== */

export function setText(id, value){
  const el = document.getElementById(id);
  if(el) el.innerText = value;
}

/* ===================================================== */
/* 10_THEME_CONTROL */
/* ===================================================== */

function setTheme(mode){
  document.body.classList.remove(
    "long-mode",
    "short-mode",
    "range-mode"
  );

  if(mode === "LONG")  document.body.classList.add("long-mode");
  if(mode === "SHORT") document.body.classList.add("short-mode");
  if(mode === "RANGE") document.body.classList.add("range-mode");
}

/* ===================================================== */
/* 20_MAIN_UI_UPDATE */
/* ===================================================== */

export function updateUI(result){

  setText("env", result.env);
  setText("dir", result.dir);
  setText("rsiSignal", result.rsiSignal);
  setText("order", result.order);

  setTheme(result.mode);

  /* ---------- 21_GAUGE ---------- */
  const percent = result.confidence || 0;
  const gauge = document.getElementById("confidenceGauge");
  if(gauge){
    gauge.style.width = percent + "%";
  }
}