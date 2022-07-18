import { Direction, Network } from "./network";
import { Timetable } from "./timetable";
import { TimetableSection } from "./timetable-section";
import { validateTimetable } from "./timetable-validation";
import { ValidationResults } from "./timetable-validation-results";

/**
 * Triggers the browser to download a .ttbl file with the contents of the
 * provided timetable object.
 * @param timetable The timetable to export to file.
 * @param network The network object for accessing stop names and to process
 * validation against.
 */
export function exportTimetable(timetable: Timetable, network: Network) {
  const sectionResults = validateTimetable(timetable, network);
  const line = network.line(timetable.lineID);

  // Refuse the export the timetable if any section is invalid.
  if (sectionResults.some(r => !r.isValid())) {
    throw new Error("Some timetable sections are invalid");
  }

  // Write the timetable header to the file. Timetables are exported as "main"
  // type timetables, and can be edited manually for other situations. Timetable
  // IDs are exported in decimal despite being entered into the dialog as
  // base-36 numbers.
  let output = "";
  output += `[timetable]\n` +
    `version: 2\n` +
    `created: ${todayISOString()}\n` +
    `id: ${timetable.timetableID.toFixed()}\n` +
    `line: ${line.id.toFixed()}\n` +
    `type: main\n` +
    `begins: *\n` +
    `ends: *\n`;

  for (const i in timetable.sections) {
    const section = timetable.sections[i];
    const results = sectionResults[i];

    // Find every unique specific direction in this timetable section (there can
    // be multiple, e.g. "up-direct" and "up-via-loop" because the sections are
    // the linearized stops).
    const possibleDirections = [...new Set(results.directions)];

    // For each specific direction in this section (possibleDirections set only
    // contains directions with services in it, don't worry!)...
    for (const directionID of possibleDirections) {
      const direction = line.directions.find(d => d.id === directionID);

      // This should never happen, since the possible directions come from
      // choosing one for each service from the list of direction on this line.
      if (direction == null) {
        throw new Error(`Validation assumed some services ran in direction ` +
          `"${directionID}" which is impossible for this line.`);
      }

      // Generate the section and append it to the file.
      output += writeSection(direction, section, network, results);
    }
  }

  // Choose the default file name, e.g. "00-sandringham.ttbl";
  const timetableIDString = timetable.timetableID.toString(36).padStart(2, "0");
  const fileLineName = kebabify(line.name);
  const timetableName = `${timetableIDString}-${fileLineName}.ttbl`;

  // Trigger the browser to download the file.
  download(output, timetableName);
}

/**
 * Converts the timetable section to text, for services running in the given
 * direction only (e.g. if "up-direct" is passed "up-via-loop" services will be
 * ignored).
 * @param direction Direction info, crucially, the stops in this direction.
 * @param section The timetable section to pull services from.
 * @param network The network object, used to name stops.
 * @param results The validation results, used to match services to the given
 * direction and find next day thresholds.
 */
function writeSection(direction: Direction, section: TimetableSection,
  network: Network, results: ValidationResults): string {

  // Create the start of each line (row) with a 4 digit stop number and stop
  // name in kebab case, e.g. "0104 flinders-street".
  const headers = direction.stops.map(s =>
    `${s.toFixed().padStart(4, "0")} ${kebabify(network.stopName(s))}`);

  // Pad each header to be equal in length, so each service in the exported
  // timetable file is nicely aligned.
  const longestHeader = Math.max(...headers.map(h => h.length));
  const lines = headers.map(h => h.padEnd(longestHeader, " "));

  // Couple each service with it's next day threshold from the validation
  // results.
  let columns = section.map((s, i) => {
    const threshold = results.nextDayThresholds[i]
    if (threshold == null) {
      throw new Error(`Validation failed to calculate next day thresholds ` +
        `for some services.`);
    }
    return { service: s, nextDayThreshold: threshold };
  });

  // Filter to find the services running in this direction as detected in
  // the validation results.
  columns = columns.filter((_s, i) => results.directions[i] === direction.id);

  // For each service...
  for (const column of columns) {
    // For each row in this section...
    for (const y in direction.stops) {
      // Find the corresponding cell in the section.
      const stop = direction.stops[y];
      const cell = column.service.times[section.stops.indexOf(stop)];

      // If this time falls on the next day, prefix it with a ">" symbol.
      const text = (cell === "-" || parseInt(y) < column.nextDayThreshold)
        ? cell
        : ">" + cell;

      // Add the text to the line for this stop, using consistant padding to
      // ensure a nicely aligned table of values.
      lines[y] += " " + text.padEnd(6, " ");
    }
  }

  return `\n[${direction.id}, ${section.wdr}]\n${lines.join("\n")}\n`;
}

/**
 * Triggers a file to be downloaded by creating a fake anchor tag and clicking
 * it. Apparently in 2022 this is still the only way to do this!?
 * @param content A text that should be in the file.
 * @param filename The default name to give the file once downloaded.
 */
function download(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);

  anchor.click();

  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
};

/**
 * Convert the input string to kebab case. Spaces become dashes, and any non
 * alphanumeric characters become underscores.
 * @param str The string to kebabify.
 */
function kebabify(str: string) {
  return str.toLowerCase().replace(/\s+/g, "-").replace(/[^0-9a-z-]/g, "_");
}

/**
 * Returns the current date in ISO8601 format (just the date, not the time),
 * e.g. "2022-06-29".
 */
function todayISOString(): string {
  return new Date(Date.now()).toISOString().split("T")[0];
}
