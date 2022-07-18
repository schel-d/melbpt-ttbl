import { AppContext } from "../app-context";
import { CommandHandler, keyFilter } from "./command-handler";

/**
 * Responsible for the 0-9, "-", ":", and backspace keys, which are entered into
 * the selected cell (singular). Note that other text characters, such as A-Z
 * are ignored and could be captured by other command handlers if desired.
 */
export class TextEntryHandler extends CommandHandler {
  constructor() {
    // Request the 0-9, "-", ":", and backspace keys.
    super([
      keyFilter({ char: "0" }),
      keyFilter({ char: "1" }),
      keyFilter({ char: "2" }),
      keyFilter({ char: "3" }),
      keyFilter({ char: "4" }),
      keyFilter({ char: "5" }),
      keyFilter({ char: "6" }),
      keyFilter({ char: "7" }),
      keyFilter({ char: "8" }),
      keyFilter({ char: "9" }),
      keyFilter({ char: "-" }),
      keyFilter({ char: ":" }),
      keyFilter({ key: "Backspace" })
    ]);
  }

  handle(char: string, key: string, _ctrl: boolean, _alt: boolean,
    _shift: boolean, appContext: AppContext) {

    const section = appContext.editor.section;
    const grid = appContext.editor.grid;

    // If nothing is selected, or no section is available, do nothing.
    if (section == null || grid.selected == null) { return; }

    const { startX, startY, endX, endY } = grid.selected;

    // If multiple cells are selected, cancel them, and select just the first
    // one that was selected (depends how the user dragged their mouse or used
    // the arrow keys).
    if (startX != endX || startY != endY) {
      grid.select(startX, startY);
    }

    section.edit("Edit cell", data => {
      // If backspace was pressed, remove the last character if appropriate.
      if (key == "Backspace") {
        data.modifyCell(startX, startY, (x) =>
          x.length == 0 ? x : x.substring(0, x.length - 1));
      }
      else {
        // Otherwise append the character, which is guaranteed to be 0-9, "-",
        // or ":".
        data.modifyCell(startX, startY, (x) => x.length >= 5 ? x : (x + char));
      }
    });
  }
}
