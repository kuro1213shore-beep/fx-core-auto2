export function analyzeLogic(data, riskScore, usdScore, totalScore){

  const mode = data.usdjpy?.marketMode || "RANGE";

  let env="MIXED";
  if(riskScore>=2) env="RISK ON";
  if(riskScore<=-2) env="RISK OFF";

  let dir="NEUTRAL";
  if(usdScore>0) dir="USD STRONG";
  if(usdScore<0) dir="USD WEAK";

  let rsiSignal="NORMAL";
  const rsi=data.usdjpy?.rsi;
  if(rsi>=70) rsiSignal="OVERBOUGHT";
  if(rsi<=30) rsiSignal="OVERSOLD";

  let order="NO TRADE";

  if(mode==="DOWNTREND"){
    if(totalScore<=-1 && rsiSignal!=="OVERSOLD"){
      order="SHORT (trend)";
    }
  }
  else if(mode==="UPTREND"){
    if(totalScore>=1 && rsiSignal!=="OVERBOUGHT"){
      order="LONG (trend)";
    }
  }

  return { env, dir, rsiSignal, order };
}