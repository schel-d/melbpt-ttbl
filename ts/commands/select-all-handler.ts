import { AppContext } from "../main";
import { CommandHandler, keyFilter } from "./command-handler";

export class SelectAllHandler extends CommandHandler {
  constructor() {
    super([
      keyFilter({ key: "KeyA", ctrl: true })
    ]);
  }

  handle(_char: string, _key: string, _ctrl: boolean, _alt: boolean,
    _shift: boolean, appContext: AppContext): void {

    const section = appContext.editor.section;
    const grid = appContext.editor.grid;
    if (section == null || section.width == 0) { return; }

    grid.select(0, 0, section.width - 1, section.height - 1);
  }
}
