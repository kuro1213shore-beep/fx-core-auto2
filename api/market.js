export default async function handler(req, res) {
  try {
    res.status(200).json({
      sp: 0.3,
      vix: -0.2,
      tlt: 0.1,
      dxy: 0.2,
      rsi: 55,
      usdjpy: {
        price: 150.32,
        change: 0.25
      }
    });
  } catch (error) {
    res.status(500).json({ error: "API fetch failed" });
  }
}