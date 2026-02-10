export default async function handler(req, res) {
  try {
    const r = await fetch("https://open.er-api.com/v6/latest/USD");
    const j = await r.json();

    const usdjpy = j.rates.JPY;

    res.status(200).json({
      usdjpy: {
        price: usdjpy,
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