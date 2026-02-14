import { CONFIG } from "./config.js";

export function analyzeLogic(data, riskScore, usdScore, totalScore){

  const mode = data.usdjpy?.marketMode || "RANGE";

  // モード別設定取得
  const cfg = (mode === "UPTREND" || mode === "DOWNTREND")
    ? CONFIG.trend
    : CONFIG.range;

  /* ===== ENV ===== */
  let env = "MIXED";

  if (riskScore >= cfg.riskThreshold) {
    env = "RISK ON";
  } else if (riskScore <= -cfg.riskThreshold) {
    env = "RISK OFF";
  }

  /* ===== DIR ===== */
  let dir = "NEUTRAL";

  if (usdScore > 0) {
    dir = "USD STRONG";
  } else if (usdScore < 0) {
    dir = "USD WEAK";
  }

  /* ===== RSI SIGNAL ===== */
  let rsiSignal = "NORMAL";
  const rsi = data.usdjpy?.rsi;

  if (typeof rsi === "number") {
    if (rsi >= cfg.rsiOverbought) {
      rsiSignal = "OVERBOUGHT";
    } else if (rsi <= cfg.rsiOversold) {
      rsiSignal = "OVERSOLD";
    }
  }

  /* ===== ORDER ===== */
  let order = "NO TRADE";

  if (mode === "DOWNTREND") {
    if (totalScore <= -cfg.minTotalScore && rsiSignal !== "OVERSOLD") {
      order = "SHORT (trend)";
    }
  }
  else if (mode === "UPTREND") {
    if (totalScore >= cfg.minTotalScore && rsiSignal !== "OVERBOUGHT") {
      order = "LONG (trend)";
    }
  }
  else { // RANGE
    if (env === "RISK OFF" && rsiSignal === "OVERSOLD") {
      order = "LONG (counter)";
    }
    else if (env === "RISK ON" && rsiSignal === "OVERBOUGHT") {
      order = "SHORT (counter)";
    }
  }

  /* ✅ ここが重要 */
  return {
    mode,
    env,
    dir,
    rsiSignal,
    order,
    totalScore   // ← 追加
  };
}