import { AppContext } from "../app-context";
import { range } from "../utils";
import { CommandHandler, keyFilter } from "./command-handler";

export class NextDayHandler extends CommandHandler {
  constructor() {
    super([
      keyFilter({ key: "KeyM", shift: true })
    ]);
  }

  handle(_char: string, _key: string, _ctrl: boolean, _alt: boolean,
    _shift: boolean, appContext: AppContext): void {

    const section = appContext.editor.section;
    const grid = appContext.editor.grid;
    if (section == null || grid.selected == null) { return; }

    const { startX, startY, endX, endY } = grid.selected;
    if (startY != 0 || endY != section.height - 1) { return; }

    const currentVal = section.nextDay(startX);

    section.edit("Toggle next day", data => {
      range(startX, endX + 1).forEach(x => data.setNextDay(x, !currentVal));
    });
  }
}
