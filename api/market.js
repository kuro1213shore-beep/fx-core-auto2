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

    async function tvScan(market, symbol){
      const url = `https://scanner.tradingview.com/${market}/scan`;

      const body = {
        symbols:{ tickers:[symbol], query:{ types:[] }},
        columns:["close","change"]
      };

      const r = await fetch(url,{
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body:JSON.stringify(body)
      });

      if(!r.ok) return null;
      const j = await r.json();
      return j?.data?.[0]?.d || null;
    }

    // ===== USDJPY realtime =====
    const usd = await tvScan("forex","FX:USDJPY");
    if(usd){
      out.usdjpy.price = usd[0];
      out.usdjpy.changePct = usd[1];
    }

    // ===== SP / VIX / TLT / DXY =====
    const sp  = await tvScan("america","SP:SPX");
    const vix = await tvScan("america","CBOE:VIX");
    const tlt = await tvScan("america","NASDAQ:TLT");
    const dxy = await tvScan("america","TVC:DXY");

    out.spPct  = sp  ? sp[1]  : null;
    out.vixPct = vix ? vix[1] : null;
    out.tltPct = tlt ? tlt[1] : null;
    out.dxyPct = dxy ? dxy[1] : null;

    // ===== TwelveData（RSI + 4H SMA200）=====
    const key = process.env.TWELVEDATA_API_KEY;

    if(key){

      // ----- RSI -----
      const rsiUrl =
        `https://api.twelvedata.com/time_series?symbol=USD/JPY&interval=15min&outputsize=100&apikey=${key}`;

      const rsiRes = await fetch(rsiUrl);
      const rsiJson = await rsiRes.json();

      if(Array.isArray(rsiJson.values)){
        const closes = rsiJson.values
          .slice().reverse()
          .map(v=>Number(v.close))
          .filter(n=>Number.isFinite(n));

        const rsi = calcRSI(closes,14);
        if(Number.isFinite(rsi)){
          out.usdjpy.rsi = rsi;
        }
      }

      // ----- 4H SMA200 -----
      const smaUrl =
        `https://api.twelvedata.com/time_series?symbol=USD/JPY&interval=4h&outputsize=250&apikey=${key}`;

      const smaRes = await fetch(smaUrl);
      const smaJson = await smaRes.json();

      if(Array.isArray(smaJson.values)){
        const closes = smaJson.values
          .slice().reverse()
          .map(v=>Number(v.close))
          .filter(n=>Number.isFinite(n));

        const sma200 = calcSMA(closes,200);
        const price = closes[closes.length-1];

        if(Number.isFinite(sma200) && Number.isFinite(price)){

          if(price > sma200 * 1.002){
            out.usdjpy.marketMode = "UPTREND";
          }
          else if(price < sma200 * 0.998){
            out.usdjpy.marketMode = "DOWNTREND";
          }
          else{
            out.usdjpy.marketMode = "RANGE";
          }
        }
      }
    }

    res.setHeader("Cache-Control","no-store");
    return res.status(200).json(out);

  }catch(e){
    return res.status(500).json({error:e.message});
  }
}

// ===== RSI =====
function calcRSI(closes,period=14){
  if(closes.length<=period) return null;

  let gains=0,losses=0;

  for(let i=1;i<=period;i++){
    const diff=closes[i]-closes[i-1];
    if(diff>=0) gains+=diff;
    else losses+=-diff;
  }

  let avgGain=gains/period;
  let avgLoss=losses/period;

  for(let i=period+1;i<closes.length;i++){
    const diff=closes[i]-closes[i-1];
    const gain=diff>0?diff:0;
    const loss=diff<0?-diff:0;

    avgGain=(avgGain*(period-1)+gain)/period;
    avgLoss=(avgLoss*(period-1)+loss)/period;
  }

  if(avgLoss===0) return 100;
  const rs=avgGain/avgLoss;
  return 100-(100/(1+rs));
}

// ===== SMA =====
function calcSMA(closes,period){
  if(closes.length<period) return null;
  const slice=closes.slice(-period);
  const sum=slice.reduce((a,b)=>a+b,0);
  return sum/period;
}