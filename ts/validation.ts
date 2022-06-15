import { Network } from "./network";

export function validateTimetableID(timetableID: number) {
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

export function validateLineID(lineID: number, network: Network) {
  if (network.lines.every(l => l.id !== lineID)) {
    throw new Error(`There is no line with id=${lineID}`);
  }
  return lineID;
}
