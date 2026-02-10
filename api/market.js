// /api/market.js
// Real USDJPY + RSI(14) calculated from OHLC (Alpha Vantage)
// Fallback: if intraday is not available, use daily.
// Env: ALPHAVANTAGE_API_KEY

function rsi14(closes) {
  // closes: newest -> oldest OR any order; we assume newest first and slice
  // Need at least 15 closes for RSI(14)
  if (!Array.isArray(closes) || closes.length < 15) return null;

  let gains = 0;
  let losses = 0;

  // Use the last 14 differences: close[i] - close[i+1] where i=0..13
  for (let i = 0; i < 14; i++) {
    const diff = closes[i] - closes[i + 1];
    if (diff >= 0) gains += diff;
    else losses += Math.abs(diff);
  }

  const avgGain = gains / 14;
  const avgLoss = losses / 14;

  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  const rsi = 100 - 100 / (1 + rs);
  return Math.round(rsi * 10) / 10; // 1 decimal
}

async function avFetch(url) {
  const res = await fetch(url);
  const json = await res.json();
  return json;
}

function pickLatestTwoFromTimeSeries(timeSeriesObj) {
  // timeSeriesObj: { "YYYY-MM-DD HH:MM:SS": { "4. close": "150.12", ... }, ... }
  const keys = Object.keys(timeSeriesObj || {}).sort().reverse(); // newest first
  if (keys.length < 2) return null;
  const latest = timeSeriesObj[keys[0]];
  const prev = timeSeriesObj[keys[1]];
  const latestClose = Number(latest["4. close"]);
  const prevClose = Number(prev["4. close"]);
  return { latestClose, prevClose, keys };
}

export default async function handler(req, res) {
  try {
    const apiKey = process.env.ALPHAVANTAGE_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Missing ALPHAVANTAGE_API_KEY in Vercel env" });
    }

    // ---- Settings (you can tweak) ----
    const from = "USD";
    const to = "JPY";
    const interval = "5min"; // 1min/5min/15min/30min/60min (FX_INTRADAY)
    // ---------------------------------

    // 1) Try FX_INTRADAY first
    // Docs: Alpha Vantage FX_INTRADAY / FX_DAILY / CURRENCY_EXCHANGE_RATE  [oai_citation:1‡アルファバンテージ](https://www.alphavantage.co/documentation/)
    const intradayUrl =
      `https://www.alphavantage.co/query?function=FX_INTRADAY&from_symbol=${from}&to_symbol=${to}&interval=${interval}&outputsize=compact&apikey=${apiKey}`;

    let intraday = await avFetch(intradayUrl);

    // If rate-limited or unavailable, AlphaVantage returns "Note" or error fields
    const hasIntraday =
      intraday &&
      !intraday["Error Message"] &&
      !intraday["Note"] &&
      Object.keys(intraday).some((k) => k.toLowerCase().includes("time series"));

    let price = null;
    let change = null;
    let rsi = null;

    if (hasIntraday) {
      const tsKey = Object.keys(intraday).find((k) => k.toLowerCase().includes("time series"));
      const ts = intraday[tsKey];

      const picked = pickLatestTwoFromTimeSeries(ts);
      if (!picked) throw new Error("Not enough intraday candles to compute change/RSI");

      price = picked.latestClose;
      change = Math.round((picked.latestClose - picked.prevClose) * 1000) / 1000;

      // RSI from latest 15 closes
      const closesNewestFirst = picked.keys.slice(0, 200).map((k) => Number(ts[k]["4. close"]));
      rsi = rsi14(closesNewestFirst);
    } else {
      // 2) Fallback to FX_DAILY
      const dailyUrl =
        `https://www.alphavantage.co/query?function=FX_DAILY&from_symbol=${from}&to_symbol=${to}&outputsize=compact&apikey=${apiKey}`;
      const daily = await avFetch(dailyUrl);

      const tsKey = Object.keys(daily).find((k) => k.toLowerCase().includes("time series"));
      const ts = tsKey ? daily[tsKey] : null;
      if (!ts || daily["Error Message"] || daily["Note"]) {
        // 3) As a last resort, show realtime price only (no RSI)
        const exUrl =
          `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${from}&to_currency=${to}&apikey=${apiKey}`;
        const ex = await avFetch(exUrl);

        const block = ex && ex["Realtime Currency Exchange Rate"];
        if (!block) {
          return res.status(500).json({
            error: "AlphaVantage failed (rate limit or invalid key).",
            details: daily?.Note || daily?.["Error Message"] || ex?.Note || ex?.["Error Message"] || "unknown",
          });
        }

        price = Number(block["5. Exchange Rate"]);
        change = null;
        rsi = null;
      } else {
        const picked = pickLatestTwoFromTimeSeries(ts);
        if (!picked) throw new Error("Not enough daily candles to compute change/RSI");

        price = picked.latestClose;
        change = Math.round((picked.latestClose - picked.prevClose) * 1000) / 1000;

        const closesNewestFirst = picked.keys.slice(0, 200).map((k) => Number(ts[k]["4. close"]));
        rsi = rsi14(closesNewestFirst);
      }
    }

    // ---- Proxies for your existing logic (optional / placeholders) ----
    // If you want SP/VIX/DXY/TLT "real" too, we'll wire those next.
    // For now: keep them as placeholders so your ENV/DIR logic still runs.
    const sp = 0.3;
    const vix = -0.2;
    const tlt = 0.1;
    const dxy = 0.2;

    return res.status(200).json({
      sp,
      vix,
      tlt,
      dxy,
      rsi: rsi ?? 55,
      usdjpy: {
        price,
        change,
        rsi,
        source: hasIntraday ? `AlphaVantage FX_INTRADAY ${interval}` : "AlphaVantage FX_DAILY / EXCHANGE_RATE fallback",
      },
      ts: Date.now(),
    });
  } catch (e) {
    return res.status(500).json({ error: "API fetch failed", detail: String(e?.message || e) });
  }
}