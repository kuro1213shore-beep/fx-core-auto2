// ===== GLOBAL CONFIG =====

export const CONFIG = {

  trend: {
    // 200MA 判定幅
    maUpper: 1.002,
    maLower: 0.998,

    // エントリー条件
    minTotalScore: 1,
    riskThreshold: 2,

    // RSI
    rsiOverbought: 70,
    rsiOversold: 30
  },

  range: {
    // 200MA 判定幅（狭く）
    maUpper: 1.001,
    maLower: 0.999,

    minTotalScore: 0,
    riskThreshold: 1,

    rsiOverbought: 65,
    rsiOversold: 35
  }

};