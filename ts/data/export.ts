import { Network } from "./network";
import { Timetable } from "./timetable";
import { validateTimetable } from "./timetable-validation";

export function exportTimetable(timetable: Timetable, network: Network) {
  const sectionResults = validateTimetable(timetable, network);
  const line = network.line(timetable.lineID);

  if (sectionResults.some(r => !r.isValid())) {
    throw new Error("Some timetable sections are invalid");
  }

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
    const possibleDirections = [...new Set(results.directions)];
    for (const directionID of possibleDirections) {
      const direction = line.directions.find(d => d.id === directionID);
      const headers = direction.stops.map(s =>
        `${s.toFixed().padStart(4, "0")} ${kebabify(network.stopName(s))}`);
      const longestHeader = Math.max(...headers.map(h => h.length));
      const lines = headers.map(h => h.padEnd(longestHeader, " "));

      const columns = section.map((s, i) => {
        return {
          service: s,
          nextDayThreshold: results.nextDayThresholds[i]
        }
      }).filter((_s, i) => results.directions[i] === directionID);

      for (const column of columns) {
        for (const y in direction.stops) {
          const stop = direction.stops[y];
          const cell = column.service.times[section.stops.indexOf(stop)];
          const text = (cell === "-" || parseInt(y) < column.nextDayThreshold)
            ? cell
            : ">" + cell;
          lines[y] += " " + text.padEnd(6, " ");
        }
      }


      output += `\n[${directionID}, ${section.dow}]\n${lines.join("\n")}\n`;
    }
  }

  const timetableIDString = timetable.timetableID.toString(36).padStart(2, "0");
  const fileLineName = kebabify(line.name);
  const timetableName = `${timetableIDString}-${fileLineName}.ttbl`;
  download(output, timetableName);
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
