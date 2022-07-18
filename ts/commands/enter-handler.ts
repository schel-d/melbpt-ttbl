import { AppContext } from "../app-context";
import { CommandHandler, keyFilter } from "./command-handler";

/**
 * Responsible for handling enter, which simply fills any selected cells that
 * are empty with "-".
 */
export class EnterHandler extends CommandHandler {
  constructor() {
    // Request the Enter key.
    super([
      keyFilter({ key: "Enter" })
    ]);
  }

  handle(_char: string, _key: string, _ctrl: boolean, _alt: boolean,
    _shift: boolean, appContext: AppContext) {

    const section = appContext.editor.section;
    const grid = appContext.editor.grid;

    // If nothing is selected, do nothing.
    if (section == null || grid.selected == null) { return; }

    // Replace any empty selected cells with "-".
    const { startX, startY, endX, endY } = grid.selected;
    section.edit("Fill empty cells", data => {
      data.modifyCells(startX, startY, endX, endY, (x) => x === "" ? "-" : x);
    });
  }
}
