import { validateLineID, validateTimetableID } from "../utils";
import { validateDOW } from "./dow";
import { linearizeStopIDs as linearizeStops } from "./linearize-stops";
import { Network } from "./network";

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
  hasContent(): boolean {
    return this.sections.some(s => s.grid.length > 0);
  }
}

export class TimetableSection {
  generalDir: string;
  dow: string;
  grid: string[][];
  stops: number[];

  private _edited: (() => void) | null;
  private _colsAdded: ((startIndex: number, amount: number) => void) | null;
  private _colsDeleted: ((indices: number[]) => void) | null;
  private _colsEdited: ((indices: number[]) => void) | null;
  private _rowsEdited: ((indices: number[]) => void) | null;

  constructor(generalDir: string, dow: string, stops: number[]) {
    this.generalDir = generalDir;
    this.dow = validateDOW(dow);
    this.grid = [];
    this.stops = stops;
  }
  registerListeners(
    edited: () => void,
    colsAdded: (startIndex: number, amount: number) => void,
    colsDeleted: (indices: number[]) => void,
    colsEdited: (indices: number[]) => void,
    rowsEdited: (indices: number[]) => void) {

    this._edited = edited;
    this._colsAdded = colsAdded;
    this._colsDeleted = colsDeleted;
    this._colsEdited = colsEdited;
    this._rowsEdited = rowsEdited;
  }
  clearListeners() {
    this._edited = null;
    this._colsAdded = null;
    this._colsDeleted = null;
    this._colsEdited = null;
    this._rowsEdited = null;
  }

  appendServices(content: string[][]) {
    const priorLength = this.grid.length;
    this.grid.push(...content);
    if (this._edited) { this._edited(); }
    if (this._colsAdded) { this._colsAdded(priorLength, content.length); }
    if (this._rowsEdited) { this._rowsEdited(range(0, this.stops.length)); }
  }

  get width() {
    return this.grid.length;
  }
  get height() {
    return this.stops.length;
  }
}

function range(start: number, end: number) {
  return [...Array(end - start).keys()].map(x => x + start);
};
