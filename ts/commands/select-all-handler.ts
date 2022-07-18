import { AppContext } from "../app-context";
import { CommandHandler, keyFilter } from "./command-handler";

/**
 * Responsible for handling Ctrl+A, which selects every cell in the current
 * timetable section.
 */
export class SelectAllHandler extends CommandHandler {
  constructor() {
    // Request Ctrl+A.
    super([
      keyFilter({ key: "KeyA", ctrl: true })
    ]);
  }

  handle(_char: string, _key: string, _ctrl: boolean, _alt: boolean,
    _shift: boolean, appContext: AppContext) {

    const section = appContext.editor.section;
    const grid = appContext.editor.grid;

    // If no section is loaded or nothing is selected, do nothing.
    if (section == null || section.width == 0) { return; }

    // Otherwise, select everything!
    grid.select(0, 0, section.width - 1, section.height - 1);
  }
}
