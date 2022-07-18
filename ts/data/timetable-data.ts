import { z } from "zod";
import { Service, ServiceJson } from "./timetable-service";

/**
 * Represents a grid of services, such as that found in each timetable section.
 */
export class TimetableData {
  private _services: Service[];

  constructor(services: Service[] = []) {
    this._services = services.map(s => s.clone());
  }

  /**
   * Returns the contents of the cell at the given coordinates.
   * @param x The x-coordinate.
   * @param y The y-coordinate.
   */
  cell(x: number, y: number): string {
    return this._services[x].times[y];
  }

  /**
   * Returns the entire service at the given x-coordinate.
   * @param x The x-coordinate.
   */
  service(x: number): Service {
    return this._services[x].clone();
  }

  /**
   * Returns true if the service at the given x-coordinate is in "next day"
   * mode.
   * @param x The x-coordinate.
   */
  nextDay(x: number): boolean {
    return this._services[x].nextDay;
  }

  /**
   * Runs a function on (a clone of) each service.
   * @param func The function to run.
   */
  map<T>(func: (service: Service, index: number) => T): T[] {
    return this._services.map((s, index) => func(s.clone(), index));
  }

  /**
   * Returns a list of services based on a predicate.
   * @param func The predicate.
   */
  filter(func: (service: Service, index: number) => boolean): Service[] {
    return this._services.map(s => s.clone()).filter((s, i) => func(s, i));
  }

  /**
   * Inserts services into the grid at a given index (leave empty to push to
   * the end).
   * @param services The services to add.
   * @param index The index to add the service before (becomes this service's
   * index).
   */
  addServices(services: Service[], index?: number) {
    if (index == null) {
      this._services.push(...services.map(s => s.clone()));
    }
    else {
      this._services.splice(index, 0, ...services.map(s => s.clone()));
    }
  }

  /**
   * Removes service from the grid.
   * @param start The start index (inclusive) to remove services from.
   * @param end The end index (exclusive) to remove services from.
   */
  deleteServices(start: number, end?: number) {
    if (end == null) {
      this._services.splice(start, 1);
    }
    else {
      this._services.splice(start, end - start);
    }
  }

  /**
   * Replaces a service at a given index with another.
   * @param service The service to replace it with.
   * @param index The index of the existing service to be replaced.
   */
  replaceService(service: Service, index: number) {
    this._services[index] = service.clone();
  }

  /**
   * Sets the contents of a cell to the given value.
   * @param x The x-coordinate.
   * @param y The y-coordinate.
   * @param val The new contents of the cell.
   */
  replaceCell(x: number, y: number, val: string) {
    this._services[x].times[y] = val;
  }

  /**
   * Applies a function to the contents of the cell with the given coordinates.
   * @param x The x-coordinate.
   * @param y The y-coordinate.
   * @param func The function to apply.
   */
  modifyCell(x: number, y: number, func: (cell: string) => string) {
    this._services[x].times[y] = func(this._services[x].times[y]);
  }

  /**
   * Applies a function to the contents of a range of cells within the given
   * coordinates.
   * @param x1 The lower x-coordinate (inclusive).
   * @param y1 The lower y-coordinate (inclusive).
   * @param x2 The upper x-coordinate (inclusive).
   * @param y2 The upper y-coordinate (inclusive).
   * @param func The function to apply.
   */
  modifyCells(x1: number, y1: number, x2: number, y2: number,
    func: (cell: string, x: number, y: number) => string) {
    for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
      for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
        this._services[x].times[y] = func(this._services[x].times[y], x, y);
      }
    }
  }

  /**
   * Sets a particular service's "next day" mode.
   * @param x The x-coordinate of the service to modify.
   * @param nextDay The new value of this service's next day mode.
   */
  setNextDay(x: number, nextDay: boolean) {
    this._services[x].nextDay = nextDay;
  }

  /**
   * Clones this entire timetable data object.
   */
  clone() {
    return new TimetableData(this._services);
  }

  /**
   * Returns the width of the grid (the number of services).
   */
  get width() {
    return this._services.length;
  }

  /**
   * Converts the grid to JSON, primarily so it can be passed to the validation
   * worker.
   */
  toJSON(): TimetableDataJson {
    return {
      services: this._services.map(x => x.toJSON())
    };
  }

  /**
   * Parses the timetable data from JSON, primarily for validation worker
   * purposes.
   * @param json The json object to parse from.
   */
  static fromJSON(json: unknown) {
    const parsedJson = TimetableDataJson.parse(json);
    return new TimetableData(parsedJson.services.map((x: ServiceJson) =>
      Service.fromJSON(x)
    ));
  }
}

/**
 * The Zod schema for parsing timetable data from JSON.
 */
export const TimetableDataJson = z.object({
  services: ServiceJson.array()
});

/**
 * The typescript type representing timetable data as JSON.
 */
export type TimetableDataJson = z.infer<typeof TimetableDataJson>;
