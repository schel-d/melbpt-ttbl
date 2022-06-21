export const DOWPresets = [
  ["MTWT___", "____F__", "_____S_", "______S"],
  ["MTWTF__", "_____S_", "______S"],
  ["MTWTFSS"],
  ["M______", "_TWT___", "____F__", "_____S_", "______S"],
  ["M______", "_TWTF__", "_____S_", "______S"],
  ["M______", "_T_____", "__W____", "___T___", "____F__", "_____S_", "______S"]
]
const DOWNames: { [key: string]: string } = {
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

export function nameDOW(dow: string) {
  if (dow in DOWNames) {
    return DOWNames[dow];
  }
  throw new Error(`Days of week value "${dow}" is invalid or not supported`)
}
export function validateDOW(dow: string) {
  const daysRegex = /^(M|_)(T|_)(W|_)(T|_)(F|_)(S|_)(S|_)$/;
  if (!daysRegex.test(dow)) {
    throw new Error(`Invalid days of week value: "${dow}"`);
  }
  return dow;
}
