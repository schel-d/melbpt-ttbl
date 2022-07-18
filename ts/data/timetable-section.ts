import { validateWDR } from "./week-day-range";
import { TimetableData, TimetableDataJson } from "./timetable-data";
import { z } from "zod";
import { Service } from "./timetable-service";

/**
 * A section in the timetable, "section" meaning for example "Up Mon-Fri",
 * "Down Saturday", etc. They are differentiated by a general direction and
 * week day range (e.g. "Tue", or "Mon-Thu").
 */
export class TimetableSection {
  generalDir: string;
  wdr: string;
  stops: number[];
  undoFrames: { actionName: string, before: TimetableData }[];
  redoFrames: { actionName: string, after: TimetableData }[];

  private _data: TimetableData;

  /**
   * Callback called when any change occurs, hence why waiting 500ms before
   * starting validation is a good move.
   */
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

  /**
   * Provides a copy of the data to the given function, where editing can be
   * done. Also retains a copy of the original state of the data for undo steps.
   * @param actionName A description of which edits are being made, for undo
   * feedback, typically worded as a command, e.g. "edit cell" or "delete
   * service".
   * @param func A function to modify the data.
   */
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

  /**
   * Returns the timetable to it's previous state before the last edit, if
   * possible. Returns the name of the action that was undone, or null if undo
   * wasn't possible.
   */
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

  /**
   * Undoes the last undo (of course)! Returns the name of the action that was
   * "redone", or null if redo wasn't possible.
   * @returns
   */
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

  /**
   * Returns the contents of the cell at the given coordinates.
   * @param x The x-coordinate.
   * @param y The y-coordinate.
   */
  cell(x: number, y: number): string {
    return this._data.cell(x, y);
  }

  /**
   * Returns the entire service at the given x-coordinate.
   * @param x The x-coordinate.
   */
  service(x: number): Service {
    return this._data.service(x);
  }

  /**
   * Returns true if the service at the given x-coordinate is in "next day" mode.
   * @param x The x-coordinate.
   */
  nextDay(x: number): boolean {
    return this._data.nextDay(x);
  }

  /**
   * Runs a function on (a clone of) each service.
   * @param func The function to run.
   */
  map<T>(func: (service: Service, index: number) => T): T[] {
    return this._data.map(func);
  }

  /**
   * Returns a list of services based on a predicate.
   * @param func The predicate.
   */
  filter(func: (service: Service, index: number) => boolean): Service[] {
    return this._data.filter(func);
  }

  /**
   * Converts the timetable section to JSON, primarily so it can be passed to
   * the validation worker.
   */
  toJSON(): TimetableSectionJson {
    return {
      generalDir: this.generalDir,
      wdr: this.wdr,
      stops: this.stops,
      data: this._data.toJSON()
    };
  }

  /**
   * Parses the timetable section from JSON, primarily for validation worker
   * purposes.
   * @param json The json object to parse from.
   */
  static fromJSON(json: unknown): TimetableSection {
    const parsedJson = TimetableSectionJson.parse(json);
    const section = new TimetableSection(
      parsedJson.generalDir, parsedJson.wdr, parsedJson.stops
    );
    section._data = TimetableData.fromJSON(parsedJson.data);
    return section;
  }

  /**
   * Returns the width of the grid (the number of services).
   */
  get width() {
    return this._data.width;
  }

  /**
   * Returns the height of the grid (this number of stops).
   */
  get height() {
    return this.stops.length;
  }
}

/**
 * The Zod schema for parsing a timetable section from JSON.
 */
const TimetableSectionJson = z.object({
  generalDir: z.string(),
  wdr: z.string(),
  stops: z.number().array(),
  data: TimetableDataJson
});

/**
 * The typescript type representing a timetable section as JSON.
 */
export type TimetableSectionJson = z.infer<typeof TimetableSectionJson>;
