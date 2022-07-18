import { AppContext } from "../app-context";
import { CommandHandler, keyFilter } from "./command-handler";

/**
 * Responsible for handling the delete key, which clears text from the selected
 * cells, and if whole columns are selected, deletes them entirely (which can be
 * overridden by holding Ctrl).
 */
export class DeleteHandler extends CommandHandler {
  constructor() {
    // Request Delete and Ctrl+Delete.
    super([
      keyFilter({ key: "Delete", ctrl: "*" })
    ]);
  }

  handle(_char: string, _key: string, ctrl: boolean, _alt: boolean,
    _shift: boolean, appContext: AppContext) {

    const section = appContext.editor.section;
    const grid = appContext.editor.grid;

    // Do nothing if nothing is selected.
    if (section == null || grid.selected == null) { return; }

    const { startX, startY, endX, endY } = grid.selected;

    // If whole columns are selected (and Ctrl is not pressed)...
    if (startY == 0 && endY == section.height - 1 && !ctrl) {
      const actionName = startX == endX ? "Delete service" : "Delete services";

      // Delete all the selected services.
      section.edit(actionName, data => {
        data.deleteServices(Math.min(startX, endX), Math.max(startX, endX) + 1);
      });

      // Everything that was selected is now gone, so clear the selection.
      grid.clearSelection();
    }
    else {
      // Otherwise, just clear the text from every selected cell.
      section.edit("Delete text", data => {
        data.modifyCells(startX, startY, endX, endY, () => "");
      });
    }
  }
}
