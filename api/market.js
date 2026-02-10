export default async function handler(req, res) {

  const API_KEY = process.env.TWELVEDATA_API_KEY;

  try {

    // ===== USDJPY 取得 =====
    const usdRes = await fetch(
      `https://api.twelvedata.com/time_series?symbol=USD/JPY&interval=5min&outputsize=100&apikey=${API_KEY}`
    );
    const usdData = await usdRes.json();

    const prices = usdData.values.map(v => parseFloat(v.close)).reverse();
    const latestPrice = prices[prices.length - 1];
    const prevPrice = prices[prices.length - 2];
    const change = ((latestPrice - prevPrice) / prevPrice) * 100;

    // ===== RSI計算 =====
    function calculateRSI(prices, period = 14) {
      let gains = 0;
      let losses = 0;

      for (let i = prices.length - period; i < prices.length - 1; i++) {
        let diff = prices[i + 1] - prices[i];
        if (diff > 0) gains += diff;
        else losses -= diff;
      }

      let avgGain = gains / period;
      let avgLoss = losses / period;
      let rs = avgGain / avgLoss;

      return 100 - (100 / (1 + rs));
    }

    const rsi = calculateRSI(prices);

    // ===== US10Y 金利取得 =====
    const yieldRes = await fetch(
      `https://api.twelvedata.com/quote?symbol=US10Y&apikey=${API_KEY}`
    );
    const yieldData = await yieldRes.json();

    const us10y = parseFloat(yieldData.percent_change);

    // ===== ダミー指数（あとで本物に変えられる） =====
    const sp = 0;
    const vix = 0;
    const dxy = 0;

    res.status(200).json({
      usdjpy: {
        price: latestPrice,
        change: change,
        rsi: rsi
      },
      us10y: us10y,
      sp: sp,
      vix: vix,
      dxy: dxy
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "API error" });
  }
}