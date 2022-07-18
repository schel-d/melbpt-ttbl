import { AppContext } from "../app-context";
import { range } from "../utils";
import { CommandHandler, keyFilter } from "./command-handler";

/**
 * Responsible for handling Shift+M, which toggles "next day" mode for the
 * selected service.
 */
export class NextDayHandler extends CommandHandler {
  constructor() {
    // Request Shift+M.
    super([
      keyFilter({ key: "KeyM", shift: true })
    ]);
  }

  handle(_char: string, _key: string, _ctrl: boolean, _alt: boolean,
    _shift: boolean, appContext: AppContext) {

    const section = appContext.editor.section;
    const grid = appContext.editor.grid;

    // If nothing is selected (or no section is loaded), do nothing.
    if (section == null || grid.selected == null) { return; }

    // If there isn't whole columns selected, do nothing.
    const { startX, startY, endX, endY } = grid.selected;
    if (startY != 0 || endY != section.height - 1) { return; }

    // Toggle "next day" mode on the selected services. Where there are multiple
    // selected, the left-most service will be what determines whether they all
    // become on/off, but they will all match regardless.
    const currentVal = section.nextDay(startX);
    section.edit("Toggle next day", data => {
      range(startX, endX + 1).forEach(x => data.setNextDay(x, !currentVal));
    });
  }
}
