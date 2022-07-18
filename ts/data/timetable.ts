import { validateLineID, validateTimetableID } from "../utils";
import { linearizeStopIDs as linearizeStops } from "./linearize-stops";
import { Network } from "./network";
import { TimetableSection } from "./timetable-section";

/**
 * Represents an entire timetable. The object this webapp spends its existence
 * editing. It contains multiple sections, one for each general direction and
 * week day range combination.
 */
export class Timetable {
  timetableID: number;
  lineID: number;
  linearizedStops: { up: number[], down: number[] }
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
      up: linearizedStops,
      down: [...linearizedStops].reverse()
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

  /**
   * Returns the general directions in this timetable, so `["up", "down"]`
   * basically.
   */
  get generalDirs(): string[] {
    return ["up", "down"];
  }

  /**
   * Returns the week day ranges that denote the different sections in the
   * timetable.
   */
  get wdrs(): string[] {
    return [...this._wdrs];
  }

  /**
   * Returns a timetable section, given a general direction and week day range.
   * @param generalDir The general direction this timetable section represents.
   * @param wdr The week day range this timetable section represents.
   */
  getTimetableSection(generalDir: string, wdr: string): TimetableSection {
    const section = this.sections.find(s =>
      s.generalDir === generalDir && s.wdr === wdr);

    if (section != null) {
      return section;
    }

    throw new Error(`Timetable section in generalDir="${generalDir}", ` +
      `wdr="${wdr}" does not exist`);
  }

  /**
   * Returns the first section in the timetable. Used when a new timetable is
   * created/loaded, to load the first section up to edit.
   */
  getFirstSection() {
    return this.getTimetableSection(this.generalDirs[0], this.wdrs[0]);
  }

  /**
   * Returns false if and only if this timetable is entirely blank. Determines
   * whether or not a "are you sure you wanna leave?" prompt is shown.
   */
  hasContent(): boolean {
    return this.sections.some(s => s.width != 0);
  }
}
