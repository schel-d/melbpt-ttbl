import { AppContext } from "../app-context";
import { CommandHandler, keyFilter } from "./command-handler";

export class DeleteHandler extends CommandHandler {
  constructor() {
    super([
      keyFilter({ key: "Delete", ctrl: "*" })
    ]);
  }

  handle(_char: string, _key: string, ctrl: boolean, _alt: boolean,
    _shift: boolean, appContext: AppContext): void {

    const section = appContext.editor.section;
    const grid = appContext.editor.grid;
    if (section == null || grid.selected == null) { return; }

    const { startX, startY, endX, endY } = grid.selected;

    if (startY == 0 && endY == section.height - 1 && !ctrl) {
      const actionName = startX == endX ? "Delete service" : "Delete services";
      section.edit(actionName, data => {
        data.deleteServices(Math.min(startX, endX), Math.max(startX, endX) + 1);
      });
      grid.clearSelection();
    }
    else {
      section.edit("Delete text", data => {
        data.modifyCells(startX, startY, endX, endY, () => "");
      });
    }
  }
}
