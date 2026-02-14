export function setText(id, value){
  const el = document.getElementById(id);
  if(el) el.innerText = value;
}

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

export function updateUI(result){

  setText("env", result.env);
  setText("dir", result.dir);
  setText("rsiSignal", result.rsiSignal);
  setText("order", result.order);

  setTheme(result.mode);

  /* SAFE GAUGE */
  const fill = document.getElementById("gaugeFill");
  const text = document.getElementById("gaugeText");

  if(fill) fill.style.width = "0%";
  if(text) text.innerText = "--";
}