export function calcScore(data){

  if(!data) return { riskScore:0, usdScore:0, totalScore:0 };

  const sp = Number(data.spPct ?? 0);
  const vix = Number(data.vixPct ?? 0);
  const tlt = Number(data.tltPct ?? 0);
  const dxy = Number(data.dxyPct ?? 0);

  // RISK
  const riskScore =
      (sp > 0 ? 1 : -1)
    + (vix < 0 ? 1 : -1)
    + (tlt < 0 ? 1 : -1);

  // USD
  const usdScore = dxy > 0 ? 1 : -1;

  const totalScore = riskScore + usdScore;

  return { riskScore, usdScore, totalScore };
}