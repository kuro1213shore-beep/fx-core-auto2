/* ===================================================== */
/* 00_CONFIG_ENTRY */
/* ===================================================== */

const LS_KEY = "FX_CORE_AUTO_CONFIG_V2";

/* ===================================================== */
/* 10_DEFAULTS */
/* ===================================================== */

const DEFAULT_CONFIG = {

  /* ---------- 環境判定 ---------- */
  envThresholdHigh: 2,
  envThresholdLow: -2,
  usdStrongThreshold: 0,

  /* ⭐ モード別スコア倍率 */
  trendWeight: 1.5,
  rangeWeight: 1,

  /* ===================================================== */
  /* 🔒 安全制御 */
  /* ===================================================== */
  risk: {
    maxDailyLoss: 3,
    maxLossStreak: 4,
  },

  /* ===================================================== */
  /* 🎯 エントリー品質 */
  /* ===================================================== */
  entry: {
    minScore: 2,
  },

  /* ===================================================== */
  /* 🌪 ボラティリティフィルター */
  /* ===================================================== */
  filters: {
    minATR: 0.08,
    maxATR: 0.6,
  },

  /* ===================================================== */
  /* 📈 TREND モード */
  /* ===================================================== */
  trend: {
    maUpper: 1.002,
    maLower: 0.998,
    minTotalScore: 1,
    riskThreshold: 2,
    rsiOverbought: 70,
    rsiOversold: 30,
    weights: {
      risk: { sp: 1, vix: 1, tlt: 1 },
      usd: { dxy: 1 },
    },
  },

  /* ===================================================== */
  /* 📉 RANGE モード */
  /* ===================================================== */
  range: {
    maUpper: 1.001,
    maLower: 0.999,
    minTotalScore: 0,
    riskThreshold: 1,
    rsiOverbought: 65,
    rsiOversold: 35,
    weights: {
      risk: { sp: 1, vix: 1, tlt: 1 },
      usd: { dxy: 1 },
    },
  },
};

/* ===================================================== */
/* STORAGE */
/* ===================================================== */

function deepMerge(base, override) {
  if (!override || typeof override !== "object") return base;
  const out = { ...base };

  for (const k in override) {
    if (
      typeof base[k] === "object" &&
      typeof override[k] === "object"
    ) {
      out[k] = deepMerge(base[k], override[k]);
    } else {
      out[k] = override[k];
    }
  }
  return out;
}

function safeParse(json) {
  try { return JSON.parse(json); }
  catch { return null; }
}

export function loadConfig() {
  const raw = localStorage.getItem(LS_KEY);
  const saved = raw ? safeParse(raw) : null;
  return deepMerge(DEFAULT_CONFIG, saved || {});
}

export function saveConfig(cfg) {
  localStorage.setItem(LS_KEY, JSON.stringify(cfg));
}

export function resetConfig() {
  localStorage.removeItem(LS_KEY);
}

export function getDefaultConfig() {
  return JSON.parse(JSON.stringify(DEFAULT_CONFIG));
}

/* ===================================================== */
/* HELPERS */
/* ===================================================== */

export function getModeConfig(mode, config = loadConfig()) {
  const trend = mode === "UPTREND" || mode === "DOWNTREND";
  return trend ? config.trend : config.range;
}

/* 今日の損益 */
export function getTodayLoss(logs) {
  const today = new Date().toDateString();
  return logs
    .filter(l => new Date(l.date).toDateString() === today)
    .reduce((sum,l)=> sum + (l.resultPips || 0), 0);
}

/* 連敗数 */
export function getLossStreak(logs) {
  let streak = 0;
  for(const l of logs){
    if(l.win) break;
    streak++;
  }
  return streak;
}

export const CONFIG = loadConfig();