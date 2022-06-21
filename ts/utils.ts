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
