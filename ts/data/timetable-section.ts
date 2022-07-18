import { validateWDR } from "./week-day-range";
import { Service, TimetableData, TimetableDataJson } from "./timetable-data";
import { z } from "zod";

export class TimetableSection {
  generalDir: string;
  wdr: string;
  stops: number[];
  undoFrames: { actionName: string, before: TimetableData }[];
  redoFrames: { actionName: string, after: TimetableData }[];

  private _data: TimetableData;

  changed: (() => void) | null;

  constructor(generalDir: string, wdr: string, stops: number[]) {
    this.generalDir = generalDir;
    this.wdr = validateWDR(wdr);
    this.stops = stops;

    this._data = new TimetableData();
    this.undoFrames = [];
    this.redoFrames = [];
    this.changed = null;
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

  undo(): string | null {
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
  redo(): string | null {
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
  map<T>(func: (service: Service, index: number) => T): T[] {
    return this._data.map(func);
  }
  filter(func: (service: Service, index: number) => boolean): Service[] {
    return this._data.filter(func);
  }

  toJSON(): TimetableSectionJson {
    return {
      generalDir: this.generalDir,
      wdr: this.wdr,
      stops: this.stops,
      data: this._data.toJSON()
    };
  }
  static fromJSON(json: unknown): TimetableSection {
    const parsedJson = TimetableSectionJson.parse(json);
    const section = new TimetableSection(
      parsedJson.generalDir, parsedJson.wdr, parsedJson.stops
    );
    section._data = TimetableData.fromJSON(parsedJson.data);
    return section;
  }

  get width() {
    return this._data.width;
  }
  get height() {
    return this.stops.length;
  }
}

const TimetableSectionJson = z.object({
  generalDir: z.string(),
  wdr: z.string(),
  stops: z.number().array(),
  data: TimetableDataJson
});
export type TimetableSectionJson = z.infer<typeof TimetableSectionJson>;
