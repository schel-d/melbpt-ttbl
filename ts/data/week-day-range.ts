/**
 * A list of lists of week day ranges. One list (from this list) is chosen to
 * become the different sections of the timetable, e.g. for Metro timetables it
 * is typically Mon-Thu, Fri, Sat, Sun (so `WDRPresets[0]`), while for V/Line
 * timetables it is typically Mon-Fri, Sat, Sun (so `WDRPresets[1]`), but others
 * are available just in case.
 */
export const WDRPresets = [
  ["MTWT___", "____F__", "_____S_", "______S"],
  ["MTWTF__", "_____S_", "______S"],
  ["MTWTFSS"],
  ["M______", "_TWT___", "____F__", "_____S_", "______S"],
  ["M______", "_TWTF__", "_____S_", "______S"],
  ["M______", "_T_____", "__W____", "___T___", "____F__", "_____S_", "______S"]
]

/**
 * Human-friendly names for each of the week day ranges in collection above.
 */
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

/**
 * Returns the human-friendly name for the given week day range. Throws an error
 * if the input is invalid or not a recognised option with a predefined name.
 * @param wdr The week day range.
 */
export function nameWDR(wdr: string): string {
  if (wdr in WDRNames) {
    return WDRNames[wdr];
  }
  throw new Error(`Week day range value "${wdr}" is invalid or not supported`)
}

/**
 * Throws an error if the given string is not a valid week day range.
 * @param wdr The week day range string to validate.
 */
export function validateWDR(wdr: string) {
  const daysRegex = /^(M|_)(T|_)(W|_)(T|_)(F|_)(S|_)(S|_)$/;
  if (!daysRegex.test(wdr)) {
    throw new Error(`Invalid week day range value: "${wdr}"`);
  }
  return wdr;
}
