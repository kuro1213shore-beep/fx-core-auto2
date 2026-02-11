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
      columns: ["close","change","RSI"]
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

    // ===== USDJPY price =====
    const usd = await tvScan("forex", "FX:USDJPY");
　　if (usd) {
       out.usdjpy.price = usd[0];
       out.usdjpy.changePct = usd[1];
      out.usdjpy.rsi = usd[2];
      
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

    // ===== 4H 200SMA 判定 =====
    const key = process.env.TWELVEDATA_API_KEY;

    if (key) {
      const tdUrl =
        `https://api.twelvedata.com/time_series?symbol=USD/JPY&interval=4h&outputsize=250&apikey=${key}`;

      const r = await fetch(tdUrl);
      const j = await r.json();

      if (Array.isArray(j.values)) {
        const closes = j.values
          .slice()
          .reverse()
          .map(v => Number(v.close))
          .filter(n => Number.isFinite(n));

        if (closes.length >= 200) {
          const sma200 =
            closes.slice(-200).reduce((a, b) => a + b, 0) / 200;

          const price = closes[closes.length - 1];

          if (price > sma200 * 1.002) {
            out.usdjpy.marketMode = "UPTREND";
          }
          else if (price < sma200 * 0.998) {
            out.usdjpy.marketMode = "DOWNTREND";
          }
          else {
            out.usdjpy.marketMode = "RANGE";
          }
        }
      }
    }

    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json(out);

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}