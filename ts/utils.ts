import { Network } from "./data/network";

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

export function validateLineID(lineID: number, network: Network): number {
  if (network.lines.every(l => l.id !== lineID)) {
    throw new Error(`There is no line with id=${lineID}`);
  }
  return lineID;
}

export function clamp(x: number, a: number, b: number): number {
  const min = Math.min(a, b);
  const max = Math.max(a, b);
  return Math.min(Math.max(x, min), max);
}

export function range(start: number, end: number): number[] {
  return [...Array(end - start).keys()].map(x => x + start);
}
export function repeat<T>(something: T, amount: number): T[] {
  const array = [];
  for (let i = 0; i < amount; i++) {
    array.push(something);
  }
  return array;
}

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
 * @param str
 */
export function standardizeTimeString(str: string): string | null {
  const timeRegex = /^[0-9]{1,2}:[0-9]{2}(am|pm)?$/g;
  if (!timeRegex.test(str)) { return null; }

  const components = str.split(":");
  let hours = parseInt(components[0]);
  const minutes = parseInt(components[1].replace("am", "").replace("pm", ""));
  if (str.endsWith("am") || str.endsWith("pm")) {
    hours = hours % 12;
    if (str.endsWith("pm")) {
      hours += 12;
    }
  }

  if (hours < 0 || hours >= 24 || minutes < 0 || minutes >= 60) {
    return null;
  }
  return `${hours.toFixed().padStart(2, "0")}:` +
    `${minutes.toFixed().padStart(2, "0")}`;
}
