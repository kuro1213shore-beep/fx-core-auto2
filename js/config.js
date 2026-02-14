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

  /* ===================================================== */
  /* 🔒 安全制御（超重要） */
  /* ===================================================== */
  risk: {
    maxDailyLoss: 3,      // 1日の最大損失（pips単位想定）
    maxLossStreak: 4,     // 連敗ストップ
  },

  /* ===================================================== */
  /* 🎯 エントリー品質制御 */
  /* ===================================================== */
  entry: {
    minScore: 2,          // これ未満はエントリーしない
  },

  /* ===================================================== */
  /* 🌪 ボラティリティフィルター */
  /* ===================================================== */
  filters: {
    minATR: 0.08,         // ボラ不足フィルター
    maxATR: 0.6,          // 危険ボラ回避
  },

  /* ===================================================== */
  /* 📈 TREND モード */
  /* ===================================================== */
  trend: {

    /* 200MA 判定幅 */
    maUpper: 1.002,
    maLower: 0.998,

    /* エントリー条件 */
    minTotalScore: 1,
    riskThreshold: 2,

    /* RSI */
    rsiOverbought: 70,
    rsiOversold: 30,

    /* スコア重み */
    weights: {
      risk: { sp: 1, vix: 1, tlt: 1 },
      usd: { dxy: 1 },
    },
  },

  /* ===================================================== */
  /* 📉 RANGE モード */
  /* ===================================================== */
  range: {

    /* 200MA 判定幅（狭い） */
    maUpper: 1.001,
    maLower: 0.999,

    /* エントリー条件 */
    minTotalScore: 0,
    riskThreshold: 1,

    /* RSI */
    rsiOverbought: 65,
    rsiOversold: 35,

    /* スコア重み */
    weights: {
      risk: { sp: 1, vix: 1, tlt: 1 },
      usd: { dxy: 1 },
    },
  },
};

/* ===================================================== */
/* 20_UTILS */
/* ===================================================== */

function deepMerge(base, override) {
  if (!override || typeof override !== "object") return base;

  const out = Array.isArray(base) ? [...base] : { ...base };

  for (const k of Object.keys(override)) {
    const bv = base?.[k];
    const ov = override[k];

    if (
      bv &&
      typeof bv === "object" &&
      !Array.isArray(bv) &&
      typeof ov === "object" &&
      !Array.isArray(ov)
    ) {
      out[k] = deepMerge(bv, ov);
    } else {
      out[k] = ov;
    }
  }
  return out;
}

function safeParse(json) {
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/* ===================================================== */
/* 30_STORAGE */
/* ===================================================== */

export function loadConfig() {
  if (typeof window === "undefined") return DEFAULT_CONFIG;

  const raw = window.localStorage.getItem(LS_KEY);
  const saved = raw ? safeParse(raw) : null;

  return deepMerge(DEFAULT_CONFIG, saved || {});
}

export function saveConfig(nextConfig) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LS_KEY, JSON.stringify(nextConfig));
}

export function resetConfig() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(LS_KEY);
}

export function getDefaultConfig() {
  return JSON.parse(JSON.stringify(DEFAULT_CONFIG));
}

/* ===================================================== */
/* 40_HELPERS */
/* ===================================================== */

export function getModeConfig(mode, config = loadConfig()) {
  const isTrend = mode === "UPTREND" || mode === "DOWNTREND";
  return isTrend ? config.trend : config.range;
}

/* ===================================================== */
/* 50_RISK_CONTROL_HELPERS */
/* ===================================================== */

/* 今日の損失計算 */
export function getTodayLoss(logs) {
  const today = new Date().toDateString();
  return logs
    .filter(l => new Date(l.date).toDateString() === today)
    .reduce((sum, l) => sum + (l.resultPips || 0), 0);
}

/* 連敗数計算 */
export function getLossStreak(logs) {
  let streak = 0;
  for (const log of logs) {
    if (log.win) break;
    streak++;
  }
  return streak;
}

/* ===================================================== */
/* 90_EXPORT_COMPAT */
/* ===================================================== */

export const CONFIG = loadConfig();