import { range, repeat } from "../utils";
import { Direction, Network } from "./network";
import { Timetable } from "./timetable";
import { Service } from "./timetable-data";
import { TimetableSection } from "./timetable-section";

export function isValidTimetable(timetable: Timetable, network: Network) {
  return timetable.sections.every(s =>
    validateSection(s, network, timetable.lineID).isValid());
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

  const directions = network.directionsForLine(lineID);

  for (const x of range(0, section.width)) {
    const service = section.service(x);

    // Todo: Validating number ranges with regex? Really!? Should really be
    // letting luxon deal with this...
    const timesRegex = /((2[0-3])|([01][0-9]):[0-5][0-9])|-/;

    if (service.times.every(t => t == "" || timesRegex.test(t))) {
      if (service.times.some(t => t == "")) {
        // If the service is incomplete, don't continue any further, but also
        // don't report an error, because the stops will already show errors for
        // empty cells.
        continue;
      }

      const direction = matchDirection(section.stops, service, directions);
      if (direction == null) {
        results.reportServiceError(x, "Service direction unrecognized");
      }
      else {
        results.reportServiceDirection(x, determineDirectionIcon(direction));
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

  // Get the directions that include every stop this service stops at.
  const matchingDirections = directions.filter(d =>
    servicedStops.every(s => d.stops.includes(s)));

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

function determineDirectionIcon(direction: string): string {
  // Todo: yeahhhhhhhhhh noice
  return direction.endsWith("-via-loop") ?
    "richmond-via-loop" : "richmond-direct";
}


export class ValidationResults {
  stopErrors: (string | null)[];
  serviceErrors: (string | null)[];
  nextDayThresholds: number[];
  directionsIcons: (string | null)[];

  constructor(width: number, height: number) {
    this.stopErrors = repeat(null, height);
    this.serviceErrors = repeat(null, width);
    this.nextDayThresholds = repeat(5, width);
    this.directionsIcons = repeat(null, width);
  }
  reportStopError(index: number, error: string) {
    this.stopErrors[index] = error;
  }
  reportServiceError(index: number, error: string) {
    this.serviceErrors[index] = error;
  }
  reportServiceDirection(index: number, directionIcon: string) {
    this.directionsIcons[index] = directionIcon;
  }
  isValid(): boolean {
    return this.stopErrors.every(e => e == null)
      && this.serviceErrors.every(e => e == null);
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
