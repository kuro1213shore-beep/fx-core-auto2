export default async function handler(req, res) {
  try {

    // USDJPY取得
    const fxRes = await fetch(
      "https://api.exchangerate.host/latest?base=USD&symbols=JPY"
    );

    const fxData = await fxRes.json();

    const price = fxData.rates.JPY;

    // ダミーで前日差分風（簡易）
    const change = (Math.random() - 0.5) * 0.5;

    // ---- 他指標（簡易ダミー） ----
    const sp = Math.random();
    const vix = Math.random() - 0.5;
    const dxy = Math.random() - 0.5;

    // ---- RSIリアル計算（簡易） ----
    const rsi = calculateRSI(price);

    res.status(200).json({
      sp,
      vix,
      dxy,
      rsi,
      usdjpy: {
        price,
        change
      }
    });

  } catch (error) {
    res.status(500).json({ error: "API fetch failed" });
  }
}

// ---- 簡易RSI計算 ----
let prices = [];

function calculateRSI(currentPrice) {
  prices.push(currentPrice);

  if (prices.length > 15) {
    prices.shift();
  }

  if (prices.length < 14) return 50;

  let gains = 0;
  let losses = 0;

  for (let i = 1; i < prices.length; i++) {
    const diff = prices[i] - prices[i - 1];
    if (diff > 0) gains += diff;
    else losses -= diff;
  }

  const avgGain = gains / 14;
  const avgLoss = losses / 14;

  if (avgLoss === 0) return 100;

  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}