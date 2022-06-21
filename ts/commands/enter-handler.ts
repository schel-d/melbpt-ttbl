import { AppContext } from "../main";
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
    appContext.editor.section.watchModify("Fill empty cells", log => {
      log.modifyCells(startX, startY, endX, endY, (x) => x === "" ? "-" : x);
    });
  }
}
