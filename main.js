/* ===================================================== */
/* 00_AUTO_ANALYZE */
/* ===================================================== */

function autoAnalyze(){

  // ダミー値（あとでAPI差し替え可）
  const totalScore = Math.random() * 100;

  const percent = Math.round(Math.abs(totalScore));

  const arc = document.getElementById("gaugeArc");
  const text = document.getElementById("gaugeText");
  const strength = document.getElementById("strengthText");

  const circumference = 251; // 半円長さ

  if (arc){
    const offset = circumference - (percent / 100) * circumference;
    arc.style.strokeDashoffset = offset;
  }

  if (text){
    text.innerText = percent + "%";
  }

  if (strength){
    if (percent >= 70) strength.innerText = "STRONG";
    else if (percent >= 40) strength.innerText = "NEUTRAL";
    else strength.innerText = "WEAK";
  }

}

/* ===================================================== */
/* 90_GLOBAL */
/* ===================================================== */

window.autoAnalyze = autoAnalyze;

window.saveEntry = function(){
  alert("SAVE ENTRY not implemented yet");
};