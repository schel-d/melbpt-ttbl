import { validateDOW } from "./dow";
import { Service, TimetableData } from "./timetable-data";

export class TimetableSection {
  generalDir: string;
  dow: string;
  stops: number[];
  undoFrames: { actionName: string, before: TimetableData }[];
  redoFrames: { actionName: string, after: TimetableData }[];

  private _data: TimetableData;

  changed: (() => void) | null;

  constructor(generalDir: string, dow: string, stops: number[]) {
    this.generalDir = generalDir;
    this.dow = validateDOW(dow);
    this._data = new TimetableData();
    this.stops = stops;
    this.undoFrames = [];
    this.redoFrames = [];
  }

  edit(actionName: string, func: (data: TimetableData) => void) {
    this.undoFrames.push({ actionName: actionName, before: this._data });
    while (this.undoFrames.length > 10) {
      this.undoFrames.shift();
    }
    this.redoFrames = [];

    const newData = this._data.clone();
    func(newData);
    this._data = newData;

    if (this.changed) { this.changed(); }
  }

  undo(): string {
    const undoFrame = this.undoFrames.pop();
    if (undoFrame == null) { return null; }

    this.redoFrames.push({
      actionName: undoFrame.actionName,
      after: this._data
    });

    this._data = undoFrame.before;
    if (this.changed) { this.changed(); }
    return undoFrame.actionName;
  }
  redo(): string {
    const redoFrame = this.redoFrames.pop();
    if (redoFrame == null) { return null; }

    this.undoFrames.push({
      actionName: redoFrame.actionName,
      before: this._data
    });

    this._data = redoFrame.after;
    if (this.changed) { this.changed(); }
    return redoFrame.actionName;
  }

  cell(x: number, y: number): string {
    return this._data.cell(x, y);
  }
  service(x: number): Service {
    return this._data.service(x);
  }
  nextDay(x: number): boolean {
    return this._data.nextDay(x);
  }
  map<T>(func: (service: Service) => T): T[] {
    return this._data.map(func);
  }

  toJSON() {
    return {
      generalDir: this.generalDir,
      dow: this.dow,
      stops: this.stops,
      data: this._data.toJSON()
    };
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromJSON(json: any): TimetableSection {
    const section = new TimetableSection(json.generalDir, json.dow, json.stops);
    section._data = TimetableData.fromJSON(json.data);
    return section;
  }

  get width() {
    return this._data.width;
  }
  get height() {
    return this.stops.length;
  }
}
