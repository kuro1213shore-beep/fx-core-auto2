/* ===================================================== */
/* 00_CONFIG_ENTRY */
/* ===================================================== */

// localStorage key
const LS_KEY = "FX_CORE_AUTO_CONFIG_V1";

/* ===================================================== */
/* 10_DEFAULTS */
/* ===================================================== */

const DEFAULT_CONFIG = {
  /* ---------- engine.js 互換（ENV / DIR 判定など） ---------- */
  envThresholdHigh: 2,
  envThresholdLow: -2,
  usdStrongThreshold: 0,

  /* ---------- モード別パラメータ ---------- */
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

    /* スコア重み（trend） */
    weights: {
      risk: { sp: 1, vix: 1, tlt: 1 },
      usd: { dxy: 1 },
    },
  },

  range: {
    /* 200MA 判定幅（狭く） */
    maUpper: 1.001,
    maLower: 0.999,

    /* エントリー条件 */
    minTotalScore: 0,
    riskThreshold: 1,

    /* RSI */
    rsiOverbought: 65,
    rsiOversold: 35,

    /* スコア重み（range） */
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
    if (bv && typeof bv === "object" && !Array.isArray(bv) && typeof ov === "object" && !Array.isArray(ov)) {
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

  // デフォ + 保存値 をマージ（保存が欠けてても壊れない）
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
  // settings.html で初期表示に使える
  return JSON.parse(JSON.stringify(DEFAULT_CONFIG));
}

/* ===================================================== */
/* 40_HELPERS */
/* ===================================================== */

export function getModeConfig(mode, config = loadConfig()) {
  // mode は "DOWNTREND"/"UPTREND"/"RANGE" を想定
  // trend 扱い: UPTREND / DOWNTREND
  const isTrend = mode === "UPTREND" || mode === "DOWNTREND";
  return isTrend ? config.trend : config.range;
}

/* ===================================================== */
/* 90_EXPORT_COMPAT */
/* ===================================================== */

// 既存コードが「CONFIG を import」してるならそのまま使えるように。
// ※ loadConfig() を都度使いたい場合は、各所で loadConfig() を呼んでOK
export const CONFIG = loadConfig();