import { createToast } from "../components/toast";
import { AppContext } from "../main";
import { CommandHandler, keyFilter } from "./command-handler";

export class UndoHandler extends CommandHandler {
  constructor() {
    super([
      keyFilter({ key: "KeyZ", ctrl: true, shift: "*" }),
      keyFilter({ key: "KeyY", ctrl: true })
    ]);
  }

  handle(_char: string, key: string, _ctrl: boolean, _alt: boolean,
    shift: boolean, appContext: AppContext): void {

    const section = appContext.editor.section;
    if (section == null) { return; }

    if (key == "KeyY" || shift) {
      const actionName = section.redo();
      if (actionName != null) {
        createToast(`Redone: ${actionName}`);
      }
      else {
        createToast("Cannot redo any further");
      }
    }
    else {
      const actionName = section.undo();
      if (actionName != null) {
        createToast(`Undone: ${actionName}`);
      }
      else {
        createToast("Cannot undo any further");
      }
    }
  }
}
