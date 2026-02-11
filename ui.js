/* ========================================= */
/* 00_SET_TEXT */
/* ========================================= */
export function setText(id, value){
  const el = document.getElementById(id);
  if(el) el.innerText = value;
}

/* ========================================= */
/* 10_THEME */
/* ========================================= */
function setTheme(mode){
  document.body.classList.remove("long-mode","short-mode","range-mode");

  if(mode === "LONG"){
    document.body.classList.add("long-mode");
  } else if(mode === "SHORT"){
    document.body.classList.add("short-mode");
  } else {
    document.body.classList.add("range-mode");
  }
}

/* ========================================= */
/* 20_UPDATE_UI */
/* ========================================= */
export function updateUI(result){

  // ---- テキスト更新 ----
  setText("env", result.env);
  setText("dir", result.dir);
  setText("rsiSignal", result.rsiSignal);
  setText("order", result.order);

  setTheme(result.mode);

  // ---- ゲージ計算 ----
  const max = 4; // 最大スコア（今のロジックに合わせて）
  const raw = Math.abs(result.totalScore || 0);

  const percent = Math.min(
    100,
    Math.round((raw / max) * 100)
  );

  const fill = document.getElementById("gaugeFill");
  const text = document.getElementById("gaugeText");

  if(fill) fill.style.width = percent + "%";
  if(text) text.innerText = percent + "%";
}