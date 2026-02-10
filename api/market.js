export default async function handler(req, res) {
  try {
    const apikey = process.env.TWELVEDATA_API_KEY;

    if (!apikey) {
      return res.status(500).json({ error: "API key not set" });
    }

    // 価格取得
    const priceRes = await fetch(
      `https://api.twelvedata.com/price?symbol=USD/JPY&apikey=${apikey}`
    );
    const priceData = await priceRes.json();

    if (!priceData.price) {
      return res.status(500).json({ error: "Price fetch failed" });
    }

    // 15分足データ取得（RSI用）
    const rsiRes = await fetch(
      `https://api.twelvedata.com/time_series?symbol=USD/JPY&interval=15min&outputsize=100&apikey=${apikey}`
    );
    const rsiData = await rsiRes.json();

    if (!rsiData.values) {
      return res.status(500).json({ error: "RSI data fetch failed" });
    }

    const closes = rsiData.values
      .map(c => parseFloat(c.close))
      .reverse();

    const rsi = calculateRSI(closes, 14);

    res.status(200).json({
      usdjpy: {
        price: parseFloat(priceData.price),
        change: 0,
        rsi: rsi
      },
      sp: 0.3,
      vix: -0.2,
      dxy: 0.2
    });

  } catch (e) {
    res.status(500).json({ error: "fetch failed" });
  }
}

function calculateRSI(closes, period) {
  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff >= 0) gains += diff;
    else losses -= diff;
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  for (let i = period + 1; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];

    if (diff >= 0) {
      avgGain = (avgGain * (period - 1) + diff) / period;
      avgLoss = (avgLoss * (period - 1)) / period;
    } else {
      avgGain = (avgGain * (period - 1)) / period;
      avgLoss = (avgLoss * (period - 1) - diff) / period;
    }
  }

  const rs = avgGain / avgLoss;
  return parseFloat((100 - 100 / (1 + rs)).toFixed(2));
}