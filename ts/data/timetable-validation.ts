import { parseMinuteOfDay, range } from "../utils";
import { Direction, Line, Network } from "./network";
import { Timetable } from "./timetable";
import { TimetableSection } from "./timetable-section";
import { Service } from "./timetable-service";
import { ValidationResults } from "./timetable-validation-results";

/**
 * Validates each section in the timetable and returns an array of validation
 * results objects, one for each section.
 * @param timetable The timetable to validate.
 * @param network The network information to validate against.
 */
export function validateTimetable(timetable: Timetable,
  network: Network): ValidationResults[] {

  return timetable.sections.map(s =>
    validateSection(s, network, timetable.lineID));
}

/**
 * Validates a timetable section, which involves determining if any errors are
 * present, and also provides back a mapping of specific directions and
 * next day thresholds for each service.
 * @param section The timetable section to validate.
 * @param network The network information to validate against.
 * @param lineID The line relevant to this timetable section.
 */
export function validateSection(section: TimetableSection,
  network: Network, lineID: number): ValidationResults {

  const results = new ValidationResults(section.width, section.height);
  checkMissingVals(section, results);
  checkDuplicateServices(section, results);
  serviceSmarts(section, network, lineID, results);

  return results;
}

/**
 * Reports any rows with missing values to the given results object.
 * @param section The section to validate.
 * @param results The results object to report to.
 */
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

/**
 * Reports any duplicated services to the given results object. "Duplicated"
 * meaning the column contents are identical, and both have the same "next day"
 * setting.
 *
 * Todo: maybe duplicated services should be a warning, not an error, however
 * it is extremely unlikely that two identical services would ever run on the
 * same day on any train system in the world... surely...
 * @param section The section to validate.
 * @param results The results object to report to.
 */
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

/**
 * Reports service specific direction and next day thresholds to the given
 * results object.
 * @param section The section to validate.
 * @param network The network object to validate against.
 * @param lineID The line ID of the line relevant to this timetable.
 * @param results The results object to report to.
 */
function serviceSmarts(section: TimetableSection, network: Network,
  lineID: number, results: ValidationResults) {

  const line = network.line(lineID);

  for (const x of range(0, section.width)) {
    const service = section.service(x);

    // Todo: Validating number ranges with regex? Really!? I mean it works...
    // but it feels like a terrible idea anyway...
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
  directions: Direction[]): string | null {

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

/**
 * Returns the icon name that matches the given specific direction, if an icon
 * is deemed appropriate, otherwise null.
 * @param direction The specific direction of the service to get an icon for.
 * @param line The line the service operates on.
 */
function directionIcon(direction: string, line: Line): string | null {
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

/**
 * Determines at what point the service transitions to the next day, "0" if it
 * is entirely on the next day (via the "next day" setting), or the height of
 * the grid if it never crossed to the next day. This function can also return
 * null in the case where the service appears to cross to the next day multiple
 * times. Services cannot span over more than 2 days, and it's more likely that
 * the timetable is incorrect anyhow.
 * @param service The service to determine the threshold on.
 */
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
