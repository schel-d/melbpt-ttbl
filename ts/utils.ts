import { Network } from "./data/network";

/**
 * Throws errors if the provided timetable ID is not a number, or is out of the
 * allowable range for two base-36 digits. If the ID is valid, it is returned.
 * This does NOT check whether that ID is already taken.
 * @param timetableID The timetable ID to check.
 */
export function validateTimetableID(timetableID: number): number {
  const max = 36 * 36 - 1
  if (isNaN(timetableID)) {
    throw new Error(`No timetable ID given`);
  }
  if (timetableID > max || timetableID < 0) {
    throw new Error(`Timetable ID must be 0-${max} to fit within two base-36 ` +
      `digits (given ${timetableID})`);
  }
  return timetableID;
}

/**
 * Throws an error if there is no line with that line ID. Otherwise, returns the
 * line ID.
 * @param lineID The line ID to check against the network information.
 * @param network The network object that should have information for this line.
 */
export function validateLineID(lineID: number, network: Network): number {
  if (!network.lines.some(l => l.id === lineID)) {
    throw new Error(`There is no line with id=${lineID}`);
  }
  return lineID;
}

/**
 * Returns {@link x}, unless it is outside the range of {@link a} and {@link b}.
 * If it is, either {@link a} or {@link b} is returned, depending on which is
 * closest to x. {@link a} is not required to be lower than {@link b}.
 * @param x The input value.
 * @param a One of the two range boundaries (doesn't have to be the lower one).
 * @param b The other of the two range boundaries (doesn't have to be the upper
 * one).
 */
export function clamp(x: number, a: number, b: number): number {
  const min = Math.min(a, b);
  const max = Math.max(a, b);
  return Math.min(Math.max(x, min), max);
}

/**
 * Returns an array of numbers from start (inclusive) to end (exclusive), going
 * up by one at a time. Useful for iterating through numbers in a loop or lambda
 * function. E.g. `range(2, 6)` gives `[2, 3, 4, 5]`.
 * @param start The starting number (inclusive).
 * @param end The ending number (exclusive).
 */
export function range(start: number, end: number): number[] {
  return [...Array(end - start).keys()].map(x => x + start);
}

/**
 * Returns an array that contains {@link something} repeated a certain
 * {@link amount} of times.
 * @param something The value to appear several times in the array.
 * @param amount The number of times to include said value.
 */
export function repeat<T>(something: T, amount: number): T[] {
  const array = [];
  for (let i = 0; i < amount; i++) {
    array.push(something);
  }
  return array;
}

/**
 * Returns the number of minutes from midnight a time of day has occured, after
 * parsing it from a 24-hour formatted string. Throws an error if the string is
 * not a valid 24-hour time string. E.g. input `"00:01"` returns `1`, and input
 * `"23:59"` returns `1439`.
 * @param str The 24-hour formatted string.
 */
export function parseMinuteOfDay(str: string): number {
  const components = str.split(":");
  const hours = parseInt(components[0]);
  const minutes = parseInt(components[1]);
  if (isNaN(hours) || isNaN(minutes) || hours < 0 || minutes < 0
    || hours > 23 || minutes > 59) {
    throw new Error(`"${str}" is not a valid time of day`);
  }
  return hours * 60 + minutes;
}

/**
 * Returns the input string as a standard format 24-hour time. Examples of valid
 * input are "21:08" or "1:29pm". Returns null if the format is unrecognized.
 * @param str The input string.
 */
export function standardizeTimeString(str: string): string | null {
  // Matches either 12-hour or 24-hour string, e.g. "21:08" or "1:29pm". Returns
  // null if the input string doesn't match.
  const timeRegex = /^[0-9]{1,2}:[0-9]{2}(am|pm)?$/g;
  if (!timeRegex.test(str)) { return null; }

  // Extracts the numeric components from the string (stripping "am"/"pm" from
  // off the end of the minutes if present).
  const components = str.split(":");
  let hours = parseInt(components[0]);
  const minutes = parseInt(components[1].replace("am", "").replace("pm", ""));

  // If this is a 12 hour string, ensure 12 becomes 0, and add 12 hours to the
  // 24-hour representation if "pm" is present. This has the side-effect of
  // allowing "13:28am" and outputting "01:28", but that's probably ok?
  if (str.endsWith("am") || str.endsWith("pm")) {
    hours = hours % 12;
    if (str.endsWith("pm")) {
      hours += 12;
    }
  }

  // Ensure the hours and minutes are within allowable ranges.
  if (hours < 0 || hours >= 24 || minutes < 0 || minutes >= 60) {
    return null;
  }

  // Output the 24-hour formatted string, padding zeros if necessary.
  return `${hours.toFixed().padStart(2, "0")}:` +
    `${minutes.toFixed().padStart(2, "0")}`;
}

/**
 * Returns the error message (retrieved from the unknown type), or "Something
 * went wrong" if the provided {@link ex} is not an error type.
 * @param ex Ideally the error type, but otherwise anything.
 */
export function getErrorMessage(ex: unknown): string {
  if (!(ex instanceof Error)) {
    return "Something went wrong";
  }
  return ex.message;
}
