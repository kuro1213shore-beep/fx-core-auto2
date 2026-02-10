export default async function handler(req, res) {
  try {
    const API_KEY = process.env.TWELVE_API_KEY;

    // ① USDJPY 現在価格取得
    const priceRes = await fetch(
      `https://api.twelvedata.com/price?symbol=USD/JPY&apikey=${API_KEY}`
    );
    const priceData = await priceRes.json();

    // ② RSI取得（1分足）
    const rsiRes = await fetch(
      `https://api.twelvedata.com/rsi?symbol=USD/JPY&interval=1min&time_period=14&series_type=close&apikey=${API_KEY}`
    );
    const rsiData = await rsiRes.json();

    const price = parseFloat(priceData.price);
    const rsi = parseFloat(rsiData.values[0].rsi);

    res.status(200).json({
      usdjpy: {
        price: price,
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