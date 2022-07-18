import { AppContext } from "../app-context";
import { CommandHandler, keyFilter } from "./command-handler";

export class EnterHandler extends CommandHandler {
  constructor() {
    super([
      keyFilter({ key: "Enter" })
    ]);
  }

  handle(_char: string, _key: string, _ctrl: boolean, _alt: boolean,
    _shift: boolean, appContext: AppContext): void {

    const section = appContext.editor.section;
    const grid = appContext.editor.grid;
    if (section == null || grid.selected == null) { return; }

    const { startX, startY, endX, endY } = grid.selected;
    section.edit("Fill empty cells", data => {
      data.modifyCells(startX, startY, endX, endY, (x) => x === "" ? "-" : x);
    });
  }
}
