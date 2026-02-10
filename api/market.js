export default async function handler(req, res) {
  try {
    const apiKey = process.env.TWELVEDATA_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "API key missing" });
    }

    const r = await fetch(
      `https://api.twelvedata.com/price?symbol=USD/JPY&apikey=${apiKey}`
    );

    const j = await r.json();

    if (!j.price) {
      return res.status(500).json({ error: "TwelveData error", detail: j });
    }

    res.status(200).json({
      usdjpy: {
        price: parseFloat(j.price),
        change: 0,
        rsi: 50
      },
      sp: 0.3,
      vix: -0.2,
      dxy: 0.2
    });

  } catch (e) {
    res.status(500).json({ error: "fetch failed", detail: e.toString() });
  }
}