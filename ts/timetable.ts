import { validateDOW } from "./dow";
import { linearizeStopIDs as linearizeStops } from "./linearize-stops";
import { Network } from "./network";
import { validateLineID, validateTimetableID } from "./validation";

export class Timetable {
  timetableID: number;
  lineID: number;
  linearizedStops: {
    "up": number[],
    "down": number[]
  }
  sections: TimetableSection[];

  private _dows: string[];

  constructor(timetableID: number, lineID: number, dows: string[],
    network: Network) {

    this.timetableID = validateTimetableID(timetableID);
    this.lineID = validateLineID(lineID, network);
    this._dows = dows;
    this.sections = [];

    // It can be assumed that the down stops are just the up stops, but
    // backwards!
    const linearizedStops = linearizeStops(lineID, network);
    this.linearizedStops = {
      "up": linearizedStops,
      "down": [...linearizedStops].reverse()
    };

    // Create an up and down timetable section for each set of days (a set of
    // days being something like "MTWT___" for Mon-Thu, or "______S" for Sun).
    dows.forEach(d => {
      this.sections.push(
        new TimetableSection("up", d, this.linearizedStops.up));
      this.sections.push(
        new TimetableSection("down", d, this.linearizedStops.down));
    });
  }
  get generalDirs() {
    return ["up", "down"];
  }
  get dows() {
    return [...this._dows];
  }
  getTimetableSection(generalDir: string, dow: string) {
    const section = this.sections.find(s =>
      s.generalDir === generalDir && s.dow === dow);

    if (section != null) {
      return section;
    }

    throw new Error(`Timetable section in generalDir="${generalDir}", ` +
      `dow="${dow}" does not exist`);
  }
}

export class TimetableSection {
  generalDir: string;
  dow: string;
  grid: string[][];
  stops: number[];

  constructor(generalDir: string, dow: string, stops: number[]) {
    this.generalDir = generalDir;
    this.dow = validateDOW(dow);
    this.grid = [];
    this.stops = stops;

    for (let x = 0; x < 10; x++) {
      this.grid[x] = [];
      for (let y = 0; y < 30; y++) {
        this.grid[x][y] = this.generalDir;
      }
    }
  }
}
