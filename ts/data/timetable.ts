import { range, validateLineID, validateTimetableID } from "../utils";
import { validateDOW } from "./dow";
import { linearizeStopIDs as linearizeStops } from "./linearize-stops";
import { Network } from "./network";
import { SectionAppendLog, SectionDeleteLog, SectionEditLog, SectionModifyLog } from "./section-edit-log";

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

export type Service = { times: string[], nextDay: boolean }

export class TimetableSection {
  generalDir: string;
  dow: string;
  grid: Service[];
  stops: number[];
  undoFrames: SectionEditLog[];
  redoFrames: SectionEditLog[];

  private _edited: (() => void) | null;
  private _colsAdded: ((startIndex: number, amount: number) => void) | null;
  private _colsDeleted: ((indices: number[]) => void) | null;
  private _colsEdited: ((indices: number[]) => void) | null;
  private _rowsEdited: ((indices: number[]) => void) | null;
  private _replace: ((actionName: string, type: "undo" | "redo") => void) | null;

  constructor(generalDir: string, dow: string, stops: number[]) {
    this.generalDir = generalDir;
    this.dow = validateDOW(dow);
    this.grid = [];
    this.stops = stops;
    this.undoFrames = [];
    this.redoFrames = [];
  }
  registerListeners(
    edited: () => void,
    colsAdded: (startIndex: number, amount: number) => void,
    colsDeleted: (originalIndices: number[]) => void,
    colsEdited: (indices: number[]) => void,
    rowsEdited: (indices: number[]) => void,
    replace: (actionName: string, type: "undo" | "redo") => void) {

    this._edited = edited;
    this._colsAdded = colsAdded;
    this._colsDeleted = colsDeleted;
    this._colsEdited = colsEdited;
    this._rowsEdited = rowsEdited;
    this._replace = replace;
  }
  clearListeners() {
    this._edited = null;
    this._colsAdded = null;
    this._colsDeleted = null;
    this._colsEdited = null;
    this._rowsEdited = null;
    this._replace = null;
  }

  watchAppend(actionName: string, func: (log: SectionAppendLog) => void) {
    const log = new SectionAppendLog(this.grid, actionName);
    func(log);
    this.grid = log.grid;
    this.pushUndoFrame(log);

    if (this._edited) { this._edited(); }
    if (this._colsAdded) { this._colsAdded(log.startIndex, log.amount); }
    if (this._rowsEdited) { this._rowsEdited(range(0, this.stops.length)); }
  }
  watchDelete(actionName: string, func: (log: SectionDeleteLog) => void) {
    const log = new SectionDeleteLog(this.grid, actionName);
    func(log);
    this.grid = log.grid;
    this.pushUndoFrame(log);

    if (this._edited) { this._edited(); }
    if (this._colsDeleted) { this._colsDeleted(log.originalIndices); }
    if (this._rowsEdited) { this._rowsEdited(range(0, this.stops.length)); }
  }
  watchModify(actionName: string, func: (log: SectionModifyLog) => void) {
    const log = new SectionModifyLog(this.grid, actionName);
    func(log);
    this.grid = log.grid;
    this.pushUndoFrame(log);

    if (this._edited) { this._edited(); }
    if (this._colsEdited) { this._colsEdited(log.colsEdited); }
    if (this._rowsEdited) { this._rowsEdited(log.rowsEdited); }
  }

  pushUndoFrame(undoFrame: SectionEditLog) {
    this.undoFrames.push(undoFrame);
    while (this.undoFrames.length > 10) {
      this.undoFrames.shift();
    }
    this.redoFrames = [];
  }
  undo(): boolean {
    const undoFrame = this.undoFrames.pop();
    if (undoFrame == null) { return false; }

    this.redoFrames.push(undoFrame);

    this.grid = undoFrame.undoGrid;
    if (this._replace) { this._replace(undoFrame.actionName, "undo"); }
    return true;
  }
  redo(): boolean {
    const redoFrame = this.redoFrames.pop();
    if (redoFrame == null) { return false; }

    this.undoFrames.push(redoFrame);

    this.grid = redoFrame.grid;
    if (this._replace) { this._replace(redoFrame.actionName, "redo"); }
    return true;
  }

  get width() {
    return this.grid.length;
  }
  get height() {
    return this.stops.length;
  }
}
