export function detectMode(data){

  // 4H 200SMA判定はまだ仮
  // 今は totalScore を基準にする

  let mode = "RANGE";

  if (data.totalScore >= 3 || data.totalScore <= -3){
    mode = "TREND";
  }

  return mode;
}