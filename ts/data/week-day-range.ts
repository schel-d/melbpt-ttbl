export const WDRPresets = [
  ["MTWT___", "____F__", "_____S_", "______S"],
  ["MTWTF__", "_____S_", "______S"],
  ["MTWTFSS"],
  ["M______", "_TWT___", "____F__", "_____S_", "______S"],
  ["M______", "_TWTF__", "_____S_", "______S"],
  ["M______", "_T_____", "__W____", "___T___", "____F__", "_____S_", "______S"]
]
const WDRNames: { [key: string]: string } = {
  "M______": "Mon",
  "_T_____": "Tue",
  "__W____": "Wed",
  "___T___": "Thu",
  "____F__": "Fri",
  "_____S_": "Sat",
  "______S": "Sun",
  "MTWT___": "Mon-Thu",
  "MTWTF__": "Mon-Fri",
  "MTWTFSS": "Mon-Sun",
  "_TWT___": "Tue-Thu",
  "_TWTF__": "Tue-Fri",
}

export function nameWDR(wdr: string) {
  if (wdr in WDRNames) {
    return WDRNames[wdr];
  }
  throw new Error(`Week day range value "${wdr}" is invalid or not supported`)
}
export function validateWDR(wdr: string) {
  const daysRegex = /^(M|_)(T|_)(W|_)(T|_)(F|_)(S|_)(S|_)$/;
  if (!daysRegex.test(wdr)) {
    throw new Error(`Invalid week day range value: "${wdr}"`);
  }
  return wdr;
}
