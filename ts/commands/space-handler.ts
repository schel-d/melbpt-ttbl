import { AppContext } from "../main";
import { range } from "../utils";
import { CommandHandler, keyFilter } from "./command-handler";

export class SpaceHandler extends CommandHandler {
  constructor() {
    super([
      keyFilter({ key: "Space" })
    ]);
  }

  handle(_char: string, _key: string, _ctrl: boolean, _alt: boolean,
    _shift: boolean, appContext: AppContext): void {

    const section = appContext.editor.section;
    const grid = appContext.editor.grid;

    // If there are no services in the timetable or nothing is selected, do
    // nothing.
    if (section == null || section.width == 0 || grid.selected == null) {
      return;
    }

    const { x1, y1, y2 } = grid.selectedRange;

    const validSituationToShiftRight = range(y1, y2 + 1).every(y =>
      section.cell(x1, y) != "" &&
      range(x1 + 1, section.width).some(x => section.cell(x, y) == "")
    );
    if (!validSituationToShiftRight) { return; }

    section.edit("Fill timetable gap", data => {
      range(y1, y2 + 1).forEach(y => {
        const x2 = section.map(service => service.times[y])
          .findIndex(c => c == "");

        for (let x = x2; x >= x1; x--) {
          if (x == x1) {
            data.replaceCell(x, y, "-");
          }
          else {
            data.replaceCell(x, y, section.cell(x - 1, y));
          }
        }
      })
    });

    grid.select(x1 + 1, y1, x1 + 1, y2);
  }
}
