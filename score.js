// ===== SCORE LOGIC LAYER =====
export function calcScore(data){

  let riskScore = 0;

  if(data.spPct > 0) riskScore++;
  if(data.spPct < 0) riskScore--;

  if(data.vixPct < 0) riskScore++;
  if(data.vixPct > 0) riskScore--;

  if(data.tltPct < 0) riskScore++;
  if(data.tltPct > 0) riskScore--;

  let usdScore = 0;

  if(data.dxyPct > 0) usdScore++;
  if(data.dxyPct < 0) usdScore--;

  const totalScore = riskScore + usdScore;

  return {
    riskScore,
    usdScore,
    totalScore
  };
}