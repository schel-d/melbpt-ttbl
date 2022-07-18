import { Network } from "./network";

/**
 * Returns a list of stops on this line, in "up" direction order, taking into
 * account all directions generally in the "up" direction, for example both
 * "up-direct" and "up-via-loop". If a possible list of stops cannot be
 * constructed such that order within each "up" direction is maintained then an
 * error will be thrown.
 *
 * For example, for a northern group line, the function might return:
 * [...] North Melbourne, Southern Cross, Flagstaff, Melbourne Central,
 * Parliament, and finally Flinders Street.
 *
 * Obviously trains on the northern group never stop in this order, however
 * an "up" train either stops at Southern Cross or the three underground
 * stations BEFORE Flinders Street, which is all that matters.
 *
 * The idea is, that no matter which direction the city loop tunnel is running
 * in, the timetable can be edited as the same linear list of stops for all
 * trains with just two timetables (simply "up" and "down").
 *
 * @param lineID The ID of the line.
 * @param network The network object to retrieve line/stop information from.
 */
export function linearizeStopIDs(lineID: number, network: Network): number[] {
  // Create a list of stops for each generally "up" direction.
  const stopLists = getUpStopLists(lineID, network);

  // If there is only one direction and therefore only one list of stops to go
  // by, then return it.
  if (stopLists.length == 1) {
    return stopLists[0];
  }

  let currStopList = 0;
  const result = [];

  // While there is still a stop list to query...
  while (stopLists.length > 0) {
    // If the current stop list is empty, then remove it and work with what's
    // left.
    if (stopLists[currStopList].length === 0) {
      stopLists.splice(currStopList, 1);
      currStopList = 0;
      continue;
    }

    // Get the first stop in the list.
    const stop = stopLists[currStopList][0];

    // If another stop list contains this stop, and it is not also the first
    // stop in that other list, then switch focus to that list (because there
    // are stops within it that we should consider first).
    const otherListIndex = stopLists.findIndex((list, index) =>
      index !== currStopList && list.indexOf(stop) >= 1);
    if (otherListIndex !== -1) {
      stopLists[currStopList].splice(0, 1);
      currStopList = otherListIndex;
      continue;
    }

    // If no stops should proceed this one, then add it.
    result.push(stop);

    // Remove the stop from the current list, as well as any others that had it
    // also at the front.
    stopLists.forEach(list => {
      if (list[0] === stop) {
        list.splice(0, 1);
      }
    });
  }

  // Throws an error if the result is inconsistent with one/more of the
  // directions. The above code can return strangely ordered lists in the event
  // that stops appear in different orders between the various up directions,
  // which should never occur.
  validateLinearizedStops(lineID, network, result);

  return result;
}

/**
 * Returns a list of direction IDs that are in the "up" direction (in a general
 * sense, for example "up" itself, "up-direct", "up-via-loop", "albury-up").
 * @param routeType The route type of the line, e.g. "city-loop".
 * @param directions The directions available in this line.
 */
function getUpDirectionIDs(routeType: string, directions: string[]): string[] {
  if (routeType === "linear") {
    return ["up"];
  }
  else if (routeType === "city-loop") {
    return ["up-direct", "up-via-loop"];
  }
  else if (routeType === "branch") {
    // Direction IDs can be anything on a branch line, but will always end
    // in "-up".
    return directions.filter(d => d.endsWith("-up"));
  }
  throw new Error(`Route types of "${routeType}" are not supported.`);
}

/**
 * Returns a list of lists of stops for each "up" direction.
 * @param lineID The ID of the line to get stops for.
 * @param network The network object to retrieve line/stop information from.
 */
function getUpStopLists(lineID: number, network: Network): number[][] {
  const line = network.lines.find(l => l.id === lineID);
  if (line == null) { throw new Error(`No line with id=${lineID}`); }

  const directionIDs = line.directions.map(d => d.id);
  const upDirections = getUpDirectionIDs(line.routeType, directionIDs);

  const stopLists = upDirections.map(d => {
    const direction = line.directions.find(x => x.id === d);
    if (direction == null) {
      throw new Error(`Expected an up direction called "${d}" on this line`)
    }
    return [...direction.stops];
  });

  return stopLists;
}

/**
 * Throws an error if given apparently linear list of stops does not actually
 * respect the order of each "up" direction in the line.
 * @param lineID The ID of the line.
 * @param network The network object to retrieve line/stop information from.
 * @param linearizedStops The apparently linear list of stops.
 */
function validateLinearizedStops(lineID: number, network: Network,
  linearizedStops: number[]) {

  // Check that for the each of the stop lists in each up direction, that order
  // is maintained.
  const checkStopLists = getUpStopLists(lineID, network);

  for (const stopList of checkStopLists) {
    let index = -1;
    for (const stop of stopList) {
      const resultIndex = linearizedStops.indexOf(stop);
      if (resultIndex == -1 || resultIndex <= index) {
        throw new Error("Cannot find linear order of stops to form the " +
          "\"up\" and \"down\" directions");
      }
      index = resultIndex;
    }
  }
}
