import { DuplicatesList, PasteIssuesDialog }
  from "../components/paste-issues-dialog";
import { standardizeTimeString } from "../utils";

// Regex to test if a line in the pasted text is a timetable line.
const timetableRowRegex = /^.+( +(([0-9]{1,2}[:.][0-9]{2}(am|pm|[uda])?)|-))+$/;

// Regex to retrieve and separate the times from a line of timetable (split
// from the stop name).
const timesOnlyRegex = /( +(([0-9]{1,2}[:.][0-9]{2}(am|pm|[uda])?)|-))+$/;

export type Row = { stop: string, times: string[], header: string };
type ClarifiedRows = { [key: number]: string[] | null };

/**
 * Attempts to convert the given pasted text block into usable timetable
 * content.
 * @param text The block of text to parse timetable content from.
 * @param stopNames The names of each stop in the current timetable section.
 * @param pasteIssuesDialog The paste issues dialog controller, used by this
 * function when there are issues to resolve, such as multiple rows for the same
 * stop.
 * @param callback The function to call when the content is ready to be appended
 * to the current timetable section.
 */
export function extractContent(text: string, stopNames: string[],
  pasteIssuesDialog: PasteIssuesDialog,
  callback: (content: string[][], missingRows: string[]) => void) {

  const rows = extractRows(text, stopNames);
  clarifyRows(rows, stopNames, pasteIssuesDialog, (clarifiedRows, missing) => {
    const content = contentify(clarifiedRows);
    callback(content, missing);
  });
}

/**
 * Extracts a list of stops names, and the array of times/dashes associated with
 * each. Note that there may be multiple entries for each stop for V/Line
 * timetables that have both "arr" and "dep" variants.
 * @param text The block of text to parse timetable content from.
 * @param stopNames The names of each stop in the current timetable section.
 */
function extractRows(text: string, stopNames: string[]): Row[] {
  // Convert all text to lowercase for case-insensitive comparisions,
  // standardize dashes, and remove instances of two/more spaces.
  text = text.toLowerCase().replace(/[-–—]/g, "-");

  // For each row in the pasted text...
  const rows = text.split("\n")
    // Remove unnecessary whitespace.
    .map(x => x.replace(/\s+/g, " ").trim())

    // Find the rows that probably have timetable in them.
    .filter(x => timetableRowRegex.test(x))

    // Use the times only regex to split out the stop name from the string.
    // Try to find a matching stop in this timetable section for this row.
    .map(x => {
      // Remove the times from the string, and check if a stop name matches
      // the resulting string (case-insensitive). Also check variations with
      // "dep" and "arr" for V/Line timetables.
      const header = x.split(timesOnlyRegex)[0];
      const stop = stopNames.find(s => matchesStopName(header, s));

      // Return the stop and times, and split the times into an array as well.
      return {
        stop: stop,
        times: x.substring(timesOnlyRegex.exec(x).index).trim().split(" "),
        header: header
      };
    })

    // Finally, remove any rows that did not match a stop on this route.
    .filter(x => x.stop != null);

  return rows;
}

/**
 * Eliminates duplicate rows and outputs the given rows as a one-to-one mapping
 * to their respective stop indices for the final content 2d array. Duplicate
 * rows cause a dialog to show so the user can decide which row to take.
 * @param rows The output of the extractRows() function.
 * @param stopNames The names of each stop in the current timetable section.
 * @param pasteIssuesDialog The paste issues dialog controller, used by this
 * function when there are issues to resolve, such as multiple rows for the same
 * stop.
 * @param callback The function called when the result is ready (required in
 * case a dialog is necessary).
 */
function clarifyRows(rows: Row[], stopNames: string[],
  pasteIssuesDialog: PasteIssuesDialog,
  callback: (clarifiedRows: ClarifiedRows, missingRows: string[]) => void) {

  // Keep track of missing rows and duplicates during the next step.
  const missingRows: string[] = [];
  const duplicates: DuplicatesList = [];

  // For each stop in the timetable section...
  const clarifiedRows: ClarifiedRows = {};
  for (let i = 0; i < stopNames.length; i++) {
    const stopName = stopNames[i];
    const rowOptions = rows.filter(r => r.stop === stopName);

    if (rowOptions.length == 1) {
      // If one row from the pasted text relates to this stop, then choose it.
      clarifiedRows[i] = rowOptions[0].times;
    }
    else if (rowOptions.length == 0) {
      // If there's nothing from the pasted text for this stop, then add this
      // stop to the list passed back from extractContent(). This is used to
      // show a toast to the user.
      clarifiedRows[i] = null;
      missingRows.push(stopName);
    }
    else {
      // If there are more than 1, add this to the list of duplicates.
      clarifiedRows[i] = null;
      duplicates.push({
        stopName: stopName,
        rowIndex: i,
        options: rowOptions
      });
    }
  }

  if (duplicates.length > 0) {
    // If there are duplicates, show a dialog that allows the user to choose
    // which row they would like to be entered into the timetable for that stop.
    pasteIssuesDialog.show(duplicates, (choices) => {
      // After applying their choices, return the result via callback.
      // They may hit cancel on the dialog, in which case the callback never
      // runs, therefore cancelling inputting the text.
      // Also return the list of missing stops to show a toast if needed.
      for (const choice of choices) {
        clarifiedRows[choice.rowIndex] = choice.option.times;
      }
      callback(clarifiedRows, missingRows);
    });
  }
  else {
    // If there were no duplicates, return the result via callback (no dialog).
    // Also return the list of missing stops to show a toast if needed.
    callback(clarifiedRows, missingRows);
  }
}

/**
 * Convert the rows into a 2d array of strings like the editor expects.
 * @param rows The rows resulting from the extractRows() function, processed to
 * ensure there are not duplicate/missing rows.
 */
function contentify(rows: ClarifiedRows): string[][] {
  // Get the length of the largest row of times, since we want to create a
  // rectangular 2d array as the result, despite the fact that the given rows
  // are likely jagged.
  const timesCount = Math.max(...Object.keys(rows).map(k => rows[parseInt(k)])
    .filter(x => x != null).map(x => x.length));

  const stopsCount = Object.keys(rows).length;

  const result: string[][] = [];

  for (let y = 0; y < stopsCount; y++) {
    // For each time for this stop...
    for (let x = 0; x < timesCount; x++) {
      // If this service's column in the array hasn't been made yet, make it.
      if (result[x] == null) {
        result[x] = [];
      }

      if (rows[y] == null || rows[y].length <= x) {
        // If there were no times for this stop, or we've run out by this
        // service, then leave it blank (many timetables have dashes missing and
        // are therefore jagged).
        result[x][y] = "";
      }
      else {
        // Otherwise add it to the timetable in 24-hour time.
        result[x][y] = formatTime(rows[y][x]);
      }
    }
  }

  return result;
}

/**
 * Returns true if this row in the pasted text may be a match for this station.
 * This includes checking if the input is a variation of the stop name with
 * a suffix such as "arr" or "dep" as is commonly seen in V/Line timetables.
 * @param input The row header in the pasted text.
 * @param stopName The stop name.
 */
function matchesStopName(input: string, stopName: string) {
  input = input.toLowerCase().trim();
  stopName = stopName.toLowerCase();

  // Matches " dep", " arr", " station", " stn.", " stn", " (1)", " (2)", etc.
  const suffixRegex = /^ (dep|arr|station|stn\.?|\([0-9]+\))$/g;

  return input === stopName || (input.startsWith(stopName)
    && suffixRegex.test(input.substring(stopName.length)));
}

/**
 * Converts the time into a standard 24-hour format, e.g. "14:21" for 2:21pm.
 * Ignores dashes, and any other unknown strings result in "?".
 * @param time The time string to standardize if possible.
 */
function formatTime(time: string) {
  if (time === "-") {
    return "-";
  }

  // Standardize divider and deal with V/Line fragments like "12:31d" to
  // indicate set down only.
  time = time.replace(".", ":").replace(/[ uda]\b/, "");

  // Convert the time string to a 24-hour standard format used in .ttbl files.
  // Anything that didn't match gets the question mark.
  return standardizeTimeString(time) ?? "?";
}
