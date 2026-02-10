export default async function handler(req, res) {
  try {
    // USDJPY取得
    const fxRes = await fetch("https://api.frankfurter.app/latest?from=USD&to=JPY");
    const fxData = await fxRes.json();

    const usdPrice = fxData.rates.JPY;

    res.status(200).json({
      sp: 0.3,
      vix: -0.2,
      dxy: 0.2,
      rsi: 55,
      usdjpy: {
        price: usdPrice,
        change: 0 // 無料APIは変動値ないから今は固定
      }
    });

  } catch (error) {
    res.status(500).json({ error: "API fetch failed" });
  }
}