import { validateLineID, validateTimetableID } from "../utils";
import { linearizeStopIDs as linearizeStops } from "./linearize-stops";
import { Network } from "./network";
import { TimetableSection } from "./timetable-section";

export class Timetable {
  timetableID: number;
  lineID: number;
  linearizedStops: {
    "up": number[],
    "down": number[]
  }
  sections: TimetableSection[];

  private _wdrs: string[];

  constructor(timetableID: number, lineID: number, wdrs: string[],
    network: Network) {

    this.timetableID = validateTimetableID(timetableID);
    this.lineID = validateLineID(lineID, network);
    this._wdrs = wdrs;
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
    wdrs.forEach(d => {
      this.sections.push(
        new TimetableSection("up", d, this.linearizedStops.up));
      this.sections.push(
        new TimetableSection("down", d, this.linearizedStops.down));
    });
  }
  get generalDirs() {
    return ["up", "down"];
  }
  get wdrs() {
    return [...this._wdrs];
  }
  getTimetableSection(generalDir: string, wdr: string) {
    const section = this.sections.find(s =>
      s.generalDir === generalDir && s.wdr === wdr);

    if (section != null) {
      return section;
    }

    throw new Error(`Timetable section in generalDir="${generalDir}", ` +
      `wdr="${wdr}" does not exist`);
  }
  getFirstSection() {
    return this.getTimetableSection(this.generalDirs[0], this.wdrs[0]);
  }
  hasContent(): boolean {
    return this.sections.some(s => s.width != 0);
  }
}
