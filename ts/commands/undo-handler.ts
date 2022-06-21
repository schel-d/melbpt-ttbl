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
      const success = section.redo();
      if (!success) {
        createToast("Cannot redo any further");
      }
    }
    else {
      const success = section.undo();
      if (!success) {
        createToast("Cannot undo any further");
      }
    }
  }
}
