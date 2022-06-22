import { AppContext } from "../main";
import { CommandHandler, keyFilter } from "./command-handler";

export class TextEntryHandler extends CommandHandler {
  constructor() {
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
    _shift: boolean, appContext: AppContext): void {

    const section = appContext.editor.section;
    const grid = appContext.editor.grid;
    if (section == null || grid.selected == null) { return; }

    const { startX, startY, endX, endY } = grid.selected;

    if (startX != endX || startY != endY) {
      grid.select(startX, startY);
    }

    section.edit("Edit cell", data => {
      if (key == "Backspace") {
        data.modifyCell(startX, startY, (x) =>
          x.length == 0 ? x : x.substring(0, x.length - 1));
      }
      else {
        data.modifyCell(startX, startY, (x) => x.length >= 5 ? x : (x + char));
      }
    });
  }
}
