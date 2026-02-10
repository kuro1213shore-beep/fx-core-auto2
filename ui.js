export function updateUI(result){
  document.getElementById("env").innerText=result.env;
  document.getElementById("dir").innerText=result.dir;
  document.getElementById("rsiSignal").innerText=result.rsiSignal;
  document.getElementById("order").innerText=result.order;

  applyTheme(result.order);
}

function applyTheme(order){
  document.body.classList.remove("long-mode","short-mode","range-mode");

  if(order.includes("LONG")){
    document.body.classList.add("long-mode");
  }
  else if(order.includes("SHORT")){
    document.body.classList.add("short-mode");
  }
  else{
    document.body.classList.add("range-mode");
  }
}