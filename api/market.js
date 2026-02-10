export default async function handler(req, res) {
  try {
    // 🔑 Vercel環境変数からAPIキー取得
    const apikey = process.env.TWELVEDATA_API_KEY;

    if (!apikey) {
      return res.status(500).json({ error: "API key not set" });
    }

    // 📡 USDJPY価格取得
    const r = await fetch(
      `https://api.twelvedata.com/price?symbol=USD/JPY&apikey=${apikey}`
    );

    const j = await r.json();

    if (!j.price) {
      return res.status(500).json({ error: j });
    }

    // 数値変換
    const price = parseFloat(j.price);

    res.status(200).json({
      usdjpy: {
        price: price,
        change: 0,
        rsi: 50
      },
      sp: 0.3,
      vix: -0.2,
      dxy: 0.2
    });

  } catch (e) {
    res.status(500).json({ error: "fetch failed" });
  }
}