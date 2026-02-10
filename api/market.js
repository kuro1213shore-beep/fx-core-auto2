export default async function handler(req, res) {
  try {
    const out = {
      updatedAt: new Date().toISOString(),
      usdjpy: {},
      spPct: null,
      vixPct: null,
      tltPct: null,
      dxyPct: null,
    };

    // --- TradingView scanner fetch ---
    async function tvScan(market, symbol, columns) {
      const url = `https://scanner.tradingview.com/${market}/scan`;
      const body = {
        symbols: { tickers: [symbol], query: { types: [] } },
        columns,
      };
      const r = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!r.ok) throw new Error(`TV scan failed ${symbol}: ${r.status}`);
      const j = await r.json();
      const row = j?.data?.[0]?.d;
      return row || null;
    }

    // USDJPY: price + change% + RSI (TradingView has RSI columns sometimes not stable)
    // We compute RSI ourselves using 15m closes from TV chart endpoint is blocked often.
    // So: use scanner close + change + request a short history via TwelveData if available.
    // To keep it "できる範囲の自動化": 
    // - price/change: TradingView
    // - RSI: TwelveData if key exists, otherwise fallback "null"

    // 1) price/change from TV
    const usd = await tvScan("forex", "FX:USDJPY", ["close", "change"]);
    if (usd) {
      out.usdjpy.price = usd[0];
      out.usdjpy.changePct = usd[1];
      out.usdjpy.source = "tradingview";
    }

    // 2) SPX/VIX/TLT/DXY %change from TV
    const sp = await tvScan("america", "SP:SPX", ["change"]);
    const vix = await tvScan("america", "CBOE:VIX", ["change"]);
    const tlt = await tvScan("america", "NASDAQ:TLT", ["change"]);
    const dxy = await tvScan("america", "ICEUS:DXY", columns);

    out.spPct = sp ? sp[0] : null;
    out.vixPct = vix ? vix[0] : null;
    out.tltPct = tlt ? tlt[0] : null;
    out.dxyPct = dxy ? dxy[0] : null;

    // 3) RSI via TwelveData (optional)
    // Set env var on Vercel: TWELVEDATA_KEY
    const key = process.env.TWELVEDATA_KEY;

    if (key) {
      // RSI needs a series of closes.
      // We'll fetch 15min closes (compact) and compute RSI(14).
      const tdUrl =
        `https://api.twelvedata.com/time_series?symbol=USD/JPY&interval=15min&outputsize=200&format=JSON&apikey=${encodeURIComponent(key)}`;
      const r = await fetch(tdUrl, { method: "GET" });
      const j = await r.json();

      const values = j?.values;
      if (Array.isArray(values) && values.length >= 20) {
        // values are newest-first. reverse to oldest-first
        const closes = values
          .slice()
          .reverse()
          .map(v => Number(v.close))
          .filter(n => Number.isFinite(n));

        const rsi = calcRSI(closes, 14);
        if (Number.isFinite(rsi)) {
          out.usdjpy.rsi = rsi;
          out.usdjpy.source = "twelvedata+rsi";
        }
      }
    }

    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json(out);
  } catch (e) {
    return res.status(500).json({ error: String(e?.message || e) });
  }
}

// Wilder RSI
function calcRSI(closes, period = 14) {
  if (!Array.isArray(closes) || closes.length < period + 1) return null;

  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff >= 0) gains += diff;
    else losses += -diff;
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  // Continue smoothing to the end
  for (let i = period + 1; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    const gain = diff > 0 ? diff : 0;
    const loss = diff < 0 ? -diff : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
  }

  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}