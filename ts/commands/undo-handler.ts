import { createToast } from "../components/toast";
import { AppContext } from "../main";
import { CommandHandler, keyFilter } from "./command-handler";

export class UndoHandler extends CommandHandler {
  constructor() {
    super([
      keyFilter({ key: "KeyZ", ctrl: true })
    ]);
  }

  handle(_char: string, _key: string, _ctrl: boolean, _alt: boolean,
    _shift: boolean, appContext: AppContext): void {

    const section = appContext.editor.section;
    const success = section.undo();

    if (!success) {
      createToast("Cannot undo any further");
    }
  }
}
