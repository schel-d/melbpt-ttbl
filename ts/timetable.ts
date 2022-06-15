import { validateDOW } from "./dow";
import { LineNetworkApiV1Schema, Network } from "./network";
import { validateLineID, validateTimetableID } from "./validation";

export class Timetable {
  timetableID: number;
  lineID: number;
  upStopIDs: number[];
  downStopIDs: number[];
  sections: TimetableSection[];

  constructor(timetableID: number, lineID: number, sectionsDOWs: string[],
    network: Network) {

    this.timetableID = validateTimetableID(timetableID);
    this.lineID = validateLineID(lineID, network);
    this.sections = [];

    // Create list of stops on this line. For lines with multiple "up"/"down"
    // directions, the list of stops is combined but order is maintained, for
    // example, a northern group line might return: N. Melb, Flagstaff,
    // Melb Central, Parliament, Sthn Cross, Flinders. A train would not stop in
    // this order, however an up train on northern group would either visit
    // the three underground stops or Southern Cross before Flinders, which is
    // all that matters.
    this.upStopIDs = linearizeStopIDs(lineID, network);
    this.downStopIDs = [...this.upStopIDs].reverse();

    // Create an up and down timetable section for each set of days (a set of
    // days being something like "MTWT___" for Mon-Thu, or "______S" for Sun).
    sectionsDOWs.forEach(d => {
      this.sections.push(new TimetableSection(true, d));
      this.sections.push(new TimetableSection(false, d));
    })
  }
}

export class TimetableSection {
  upDirection: boolean;
  dow: string;
  grid: string[][];

  constructor(upDirection: boolean, dow: string) {
    this.upDirection = upDirection;
    this.dow = validateDOW(dow);
    this.grid = [];
  }
}

function linearizeStopIDs(lineID: number, network: Network): number[] {
  const line = network.lines.find(l => l.id === lineID);
  const upDirections = getUpDirectionIDs(line);

  const stopLists = upDirections.map(d =>
    line.directions.find(x => x.id === d).stops)

  // There is only one direction and therefore only one list of stops to go by,
  // so return it.
  if (stopLists.length == 1) {
    return stopLists[0];
  }

  let currStopList = 0;
  const result = [];

  // While there is still a stop list to query...
  while (stopLists.length > 0) {
    // If the current stop list is empty, then remove it.
    if (stopLists[currStopList].length === 0) {
      stopLists.splice(currStopList, 1);
      currStopList = 0;
      continue;
    }

    // Get the first stop in the list.
    const stop = stopLists[currStopList][0];

    // If another stop list contains this stop, and it is not also the first
    // stop in that other list, then switch focus to that list (because there
    // are stops within it that we should consider first).
    const otherListIndex = stopLists.findIndex((list, index) =>
      index !== currStopList && list.indexOf(stop) >= 1);
    if (otherListIndex !== -1) {
      stopLists[currStopList].splice(0, 1);
      currStopList = otherListIndex;
      continue;
    }

    // If no stops should proceed this one, then add it.
    result.push(stop);

    // Remove the stop from the current list, as well as any others that had it
    // also at the front.
    stopLists.forEach(list => {
      if (list[0] === stop) {
        list.splice(0, 1);
      }
    });
  }

  return result;
}
function getUpDirectionIDs(line: LineNetworkApiV1Schema): string[] {
  const upDirections = [];

  if (line.routeType === "linear") {
    upDirections.push("up");
  }
  else if (line.routeType === "city-loop") {
    upDirections.push("up-direct", "up-via-loop");
  }
  else if (line.routeType === "branch") {
    line.directions.forEach(d => {
      if (d.id.endsWith("-up")) {
        upDirections.push(d.id);
      }
    });
  }
  else {
    throw new Error(`Route types of "${line.routeType}" are not supported.`)
  }

  return upDirections;
}
