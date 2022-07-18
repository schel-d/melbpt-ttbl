import { AppContext } from "../app-context";
import { range } from "../utils";
import { CommandHandler, keyFilter } from "./command-handler";

/**
 * Responsible for handing space, which shifts the selected cells to the right
 * by one, and fills "-" behind them. This is for the situation where the pasted
 * timetable is jagged because sometimes they use empty cells rather than
 * dashes, for whatever reason.
 */
export class SpaceHandler extends CommandHandler {
  constructor() {
    // Request the space key.
    super([
      keyFilter({ key: "Space" })
    ]);
  }

  handle(_char: string, _key: string, _ctrl: boolean, _alt: boolean,
    _shift: boolean, appContext: AppContext) {

    const section = appContext.editor.section;
    const grid = appContext.editor.grid;

    // If there are no services in the timetable or nothing is selected, do
    // nothing.
    if (section == null || section.width == 0 || grid.selectedRange == null) {
      return;
    }

    // Note the right edge of the selection is intentionally ignored during this
    // whole process.
    const { x1, y1, y2 } = grid.selectedRange;

    // Do not shift right unless:
    // 1. Every cell on the left edge of the selection has a value
    // 2. No cells to the left of the selection are empty
    // 3. Every selected row has an empty cell ahead of it to shift into
    const validSituationToShiftRight = range(y1, y2 + 1).every(y =>
      section.cell(x1, y) != "" &&
      range(0, x1).every(x => section.cell(x, y) != "") &&
      range(x1 + 1, section.width).some(x => section.cell(x, y) == "")
    );
    if (!validSituationToShiftRight) { return; }

    section.edit("Fill timetable gap", data => {
      // For each row in the selection...
      range(y1, y2 + 1).forEach(y => {
        // Find the index of the first empty cell in this row. Every cell
        // between the left edge of the selection and this empty cell will be
        // shifted to the right.
        const x2 = section.map(service => service.times[y])
          .findIndex(c => c == "");

        // Replace cells from right to left with the cell before it.
        for (let x = x2 - 1; x >= x1; x--) {
          data.replaceCell(x + 1, y, section.cell(x, y));
        }

        // Insert a "-" on the left side of the selection for this row.
        data.replaceCell(x1, y, "-");
      })
    });

    // Move the selection cursor to the right by one cell.
    grid.select(x1 + 1, y1, x1 + 1, y2);
  }
}
