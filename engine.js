import { CONFIG } from "./config.js";

export function analyzeLogic(data, riskScore, usdScore, totalScore){

  const mode = data.usdjpy?.marketMode || "RANGE";

  /* ===== ENV ===== */
  let env = "MIXED";

  if(riskScore >= CONFIG.envThresholdHigh){
    env = "RISK ON";
  }
  else if(riskScore <= CONFIG.envThresholdLow){
    env = "RISK OFF";
  }

  /* ===== DIR ===== */
  let dir = "NEUTRAL";

  if(usdScore > CONFIG.usdStrongThreshold){
    dir = "USD STRONG";
  }
  else if(usdScore < -CONFIG.usdStrongThreshold){
    dir = "USD WEAK";
  }

  /* ===== RSI SIGNAL ===== */
  let rsiSignal = "NORMAL";
  const rsi = data.usdjpy?.rsi;

  if(typeof rsi === "number"){
    if(rsi >= CONFIG.rsiOverbought){
      rsiSignal = "OVERBOUGHT";
    }
    else if(rsi <= CONFIG.rsiOversold){
      rsiSignal = "OVERSOLD";
    }
  }

  /* ===== ORDER LOGIC ===== */
  let order = "NO TRADE";

  if(mode === "DOWNREND" || mode === "DOWNTRAND" || mode === "DOWNTREND"){
    if(totalScore <= -1 && rsiSignal !== "OVERSOLD"){
      order = "SHORT (trend)";
    }
  }
  else if(mode === "UPTREND"){
    if(totalScore >= 1 && rsiSignal !== "OVERBOUGHT"){
      order = "LONG (trend)";
    }
  }
  else{
    if(env === "RISK OFF" && rsiSignal === "OVERSOLD"){
      order = "LONG (counter)";
    }
    else if(env === "RISK ON" && rsiSignal === "OVERBOUGHT"){
      order = "SHORT (counter)";
    }
  }

  return {
    mode,
    env,
    dir,
    rsiSignal,
    order
  };
}