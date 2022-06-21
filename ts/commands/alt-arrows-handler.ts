import { AppContext } from "../main";
import { range } from "../utils";
import { CommandHandler, keyFilter } from "./command-handler";

export class AltArrowsHandler extends CommandHandler {
  constructor() {
    super([
      keyFilter({ key: "ArrowLeft", alt: true }),
      keyFilter({ key: "ArrowRight", alt: true })
    ]);
  }

  handle(_char: string, key: string, _ctrl: boolean, _alt: boolean,
    _shift: boolean, appContext: AppContext): void {

    const section = appContext.editor.section;
    const grid = appContext.editor.grid;

    // If there are no services in the timetable or nothing is selected, do
    // nothing.
    if (section == null || section.width == 0 || grid.selected == null) {
      return;
    }

    const { x1, y1, x2, y2 } = grid.selectedRange;

    if (y1 != 0 || y2 != section.height - 1) { return; }

    if (key == "ArrowLeft" && x1 > 0) {
      const actionName = x1 == x2 ? "Shift service left" :
        "Shift services left";
      section.watchModify(actionName, log => {
        const leftService = section.grid[x1 - 1];
        for (const x of range(x1, x2 + 1)) {
          log.replaceService(x - 1, section.grid[x]);
        }
        log.replaceService(x2, leftService);
      });
      grid.select(x1 - 1, 0, x2 - 1, section.height - 1);
    }
    if (key == "ArrowRight" && x2 < section.width - 1) {
      const actionName = x1 == x2 ? "Shift service right" :
        "Shift services right";
      section.watchModify(actionName, log => {
        const rightService = section.grid[x2 + 1];
        for (const x of range(x1, x2 + 1)) {
          log.replaceService(x + 1, section.grid[x]);
        }
        log.replaceService(x1, rightService);
      });
      grid.select(x1 + 1, 0, x2 + 1, section.height - 1);
    }
  }
}
