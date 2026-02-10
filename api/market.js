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

    // ===== TradingView Scanner =====
    async function tvScan(market, symbol) {
      const url = `https://scanner.tradingview.com/${market}/scan`;

      const body = {
        symbols: {
          tickers: [symbol],
          query: { types: [] }
        },
        columns: ["close", "change"]
      };

      const r = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!r.ok) return null;

      const j = await r.json();
      return j?.data?.[0]?.d || null;
    }

    // ===== USDJPY =====
    const usd = await tvScan("forex", "FX:USDJPY");
    if (usd) {
      out.usdjpy.price = usd[0];
      out.usdjpy.change = usd[1];
    }

    // ===== SPX / VIX / TLT / DXY =====
    const sp  = await tvScan("america", "SP:SPX");
    const vix = await tvScan("america", "CBOE:VIX");
    const tlt = await tvScan("america", "NASDAQ:TLT");
　　 const dxy = await tvScan("america", "TVC:DXY");

    out.spPct  = sp  ? sp[1]  : null;
    out.vixPct = vix ? vix[1] : null;
    out.tltPct = tlt ? tlt[1] : null;
    out.dxyPct = dxy ? dxy[1] : null;

    // ===== RSI（TwelveDataあれば使用）=====
    const key = process.env.TWELVEDATA_API_KEY;

    if (key) {
      const tdUrl =
        `https://api.twelvedata.com/time_series?symbol=USD/JPY&interval=15min&outputsize=100&apikey=${key}`;

      const r = await fetch(tdUrl);
      const j = await r.json();

      if (Array.isArray(j.values)) {
        const closes = j.values
          .slice()
          .reverse()
          .map(v => Number(v.close))
          .filter(n => Number.isFinite(n));

        const rsi = calcRSI(closes, 14);
        if (Number.isFinite(rsi)) {
          out.usdjpy.rsi = rsi;
        }
      }
    }

    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json(out);

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}


// ===== Wilder RSI =====
function calcRSI(closes, period = 14) {
  if (!Array.isArray(closes) || closes.length <= period) return null;

  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff >= 0) gains += diff;
    else losses += -diff;
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

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