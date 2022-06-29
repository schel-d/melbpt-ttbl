import { parseMinuteOfDay, range, repeat } from "../utils";
import { Direction, Line, Network } from "./network";
import { Timetable } from "./timetable";
import { Service } from "./timetable-data";
import { TimetableSection } from "./timetable-section";

export function validateTimetable(timetable: Timetable,
  network: Network): ValidationResults[] {

  return timetable.sections.map(s =>
    validateSection(s, network, timetable.lineID));
}
export function validateSection(section: TimetableSection,
  network: Network, lineID: number): ValidationResults {

  const results = new ValidationResults(section.width, section.height);
  checkMissingVals(section, results);
  checkDuplicateServices(section, results);
  serviceSmarts(section, network, lineID, results);

  return results;
}
function checkMissingVals(section: TimetableSection,
  results: ValidationResults) {

  // Todo: Maybe the stop could be responsible for all invalid values, not just
  // missing ones?
  for (const y of range(0, section.height)) {
    if (range(0, section.width).some(x => section.cell(x, y) == "")) {
      results.reportStopError(y, "Stop has missing values");
    }
  }
}
function checkDuplicateServices(section: TimetableSection,
  results: ValidationResults) {

  for (const x1 of range(0, section.width)) {
    const possibleDuplicate = section.service(x1);
    for (const x2 of range(0, x1)) {
      const original = section.service(x2);
      if (possibleDuplicate.nextDay == original.nextDay &&
        possibleDuplicate.times.every((t, index) =>
          t == original.times[index])) {

        results.reportServiceError(x1, "Duplicated service");
      }
    }
  }
}
function serviceSmarts(section: TimetableSection, network: Network,
  lineID: number, results: ValidationResults) {

  const line = network.line(lineID);

  for (const x of range(0, section.width)) {
    const service = section.service(x);

    // Todo: Validating number ranges with regex? Really!? Should really be
    // letting luxon deal with this...
    const timesRegex = /^((2[0-3]|[01][0-9]):[0-5][0-9]|-)$/;

    if (service.times.every(t => t == "" || timesRegex.test(t))) {
      if (service.times.some(t => t == "")) {
        // If the service is incomplete, don't continue any further, but also
        // don't report an error, because the stops will already show errors for
        // empty cells.
        continue;
      }

      const direction = matchDirection(section.stops, service, line.directions);
      if (direction == null) {
        results.reportServiceError(x, "Service direction unrecognized");
      }
      else {
        results.reportServiceDirection(x, direction,
          directionIcon(direction, line));

        const threshold = nextDayThreshold(service);
        if (threshold == null) {
          results.reportServiceError(x,
            "Time travel required (service spans too many days)");
        }
        else {
          results.reportNextDayThreshold(x, threshold);
        }
      }
    }
    else {
      results.reportServiceError(x, "Cells contain invalid values");
    }
  }
}
/**
 * Returns the (specific) direction this service runs in, by matching it to one
 * of the available options for this line in the network object. If nothing
 * matches, returns null. Assumes the service is correctly formatted (only
 * contains times or dashes, nothing else).
 * @param stops The array of stop IDs from the section.
 * @param service The service column from the timetable section.
 * @param directions The list of directions for the line for this timetable, as
 * retrieved from network.directionsForLine(lineID).
 */
function matchDirection(stops: number[], service: Service,
  directions: Direction[]): string {

  // Build a list of all the stops that aren't dashes on this service.
  const servicedStops = stops.filter((_s, index) =>
    service.times[index] != "-");

  if (servicedStops.length < 2) {
    return null;
  }

  // Get the directions that include every stop this service stops at, in the
  // correct order.
  const matchingDirections = directions.filter(d => {
    // Return the stops on this direction that are present in this service.
    const stopsOnThisService = d.stops.filter(s => servicedStops.includes(s));
    // If the returned array perfectly matches the service stops (none are
    // missing and the order is identical), then this direction is a match.
    return stopsOnThisService.every((x, index) => servicedStops[index] === x);
  });

  if (matchingDirections.length == 0) {
    // If there aren't any, return null.
    return null;
  }
  else {
    // If there are some, return the one with the fewest stops. This ensures
    // things like direct directions are preferred over their "Via City Loop"
    // counterparts for example.
    return matchingDirections.sort((a, b) =>
      a.stops.length - b.stops.length)[0].id;
  }
}

function directionIcon(direction: string, line: Line): string {
  if (line.routeType === "city-loop") {
    return direction.endsWith("-via-loop") ?
      `${line.routeLoopPortal}-via-loop` : `${line.routeLoopPortal}-direct`;
  }
  if (line.routeType === "branch") {
    if (line.directions.length == 2) {
      return direction === line.directions[0].id ? "branch-a" : "branch-b";
    }
  }

  return null;
}

function nextDayThreshold(service: Service): number | null {
  const times = [];
  let fillValue = 0;
  for (let y = 0; y < service.times.length; y++) {
    if (service.times[y] === "-") {
      times.push(fillValue);
    }
    else {
      const mod = parseMinuteOfDay(service.times[y]);
      times.push(mod);
      fillValue = mod;
    }
  }

  const reversals = [];
  for (let y = 1; y < times.length; y++) {
    if (times[y - 1] > times[y]) {
      reversals.push(y);
    }
  }

  if (service.nextDay && reversals.length === 0) { return 0; }
  if (!service.nextDay && reversals.length === 0) { return times.length; }
  if (!service.nextDay && reversals.length === 1) { return reversals[0]; }
  return null;
}


export class ValidationResults {
  stopErrors: (string | null)[];
  serviceErrors: (string | null)[];
  nextDayThresholds: (number | null)[];
  directions: (string | null)[];
  directionsIcons: (string | null)[];

  constructor(width: number, height: number) {
    this.stopErrors = repeat(null, height);
    this.serviceErrors = repeat(null, width);
    this.nextDayThresholds = repeat(null, width);
    this.directions = repeat(null, width);
    this.directionsIcons = repeat(null, width);
  }
  reportStopError(index: number, error: string) {
    this.stopErrors[index] = error;
  }
  reportServiceError(index: number, error: string) {
    this.serviceErrors[index] = error;
  }
  reportServiceDirection(index: number, direction: string, icon: string | null) {
    this.directions[index] = direction;
    this.directionsIcons[index] = icon;
  }
  reportNextDayThreshold(index: number, threshold: number) {
    this.nextDayThresholds[index] = threshold;
  }
  isValid(): boolean {
    return this.stopErrors.every(e => e == null)
      && this.serviceErrors.every(e => e == null)
      && this.directions.every(e => e != null);
  }
  overallError(): string | null {
    let error: string = null;
    if (error == null) { error = this.stopErrors.find(e => e != null); }
    if (error == null) { error = this.serviceErrors.find(e => e != null); }

    if (error == null) { return null; }

    const othersCount = this.stopErrors.filter(e => e != null).length +
      this.serviceErrors.filter(e => e != null).length - 1;

    if (othersCount == 0) { return error; }
    else if (othersCount == 1) { return `${error} + 1 other error`; }
    return `${error} + ${othersCount} other errors`;
  }

  toJSON() {
    return {
      stopErrors: this.stopErrors,
      serviceErrors: this.serviceErrors,
      nextDayThresholds: this.nextDayThresholds,
      directionsIcons: this.directionsIcons
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromJSON(json: any) {
    const results = new ValidationResults(json.serviceErrors.length, json.stopErrors.length);
    results.stopErrors = json.stopErrors;
    results.serviceErrors = json.serviceErrors;
    results.nextDayThresholds = json.nextDayThresholds;
    results.directionsIcons = json.directionsIcons;
    return results;
  }
}
