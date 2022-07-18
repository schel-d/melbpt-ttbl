import { TimetableSection } from "../data/timetable-section";
import { AppContext } from "../app-context";
import { clamp } from "../utils";
import { CommandHandler, keyFilter } from "./command-handler";

export class SelectArrowsHandler extends CommandHandler {
  constructor() {
    super([
      keyFilter({ key: "ArrowUp", ctrl: "*", shift: "*" }),
      keyFilter({ key: "ArrowDown", ctrl: "*", shift: "*" }),
      keyFilter({ key: "ArrowLeft", ctrl: "*", shift: "*" }),
      keyFilter({ key: "ArrowRight", ctrl: "*", shift: "*" })
    ]);
  }

  handle(_char: string, key: string, ctrl: boolean, _alt: boolean,
    shift: boolean, appContext: AppContext): void {

    const section = appContext.editor.section;
    const grid = appContext.editor.grid;

    // If there are no services in the timetable or nothing is selected, do
    // nothing.
    if (section == null || section.width == 0 || grid.selected == null) {
      return;
    }

    // Create offset coordinates from the key code.
    let offsetX = 0;
    let offsetY = 0;
    if (key == "ArrowUp") { offsetY = -1; }
    if (key == "ArrowDown") { offsetY = 1; }
    if (key == "ArrowLeft") { offsetX = -1; }
    if (key == "ArrowRight") { offsetX = 1; }

    const { startX, startY, endX, endY } = grid.selected;

    // If shift is held, the end select coordinates should change without
    // changing the start coordinates.
    if (shift) {
      const coords = this.coordsFromOffset(section, endX, endY, offsetX,
        offsetY, ctrl);
      grid.select(startX, startY, coords.x, coords.y);
      return;
    }

    // Otherwise change the selection's start and end cooridinates such that
    // only one cell is selected.
    const coords = this.coordsFromOffset(section, startX, startY, offsetX,
      offsetY, ctrl);
    grid.select(coords.x, coords.y, coords.x, coords.y);
  }

  private coordsFromOffset(section: TimetableSection, x: number, y: number,
    offsetX: number, offsetY: number, ctrl: boolean): { x: number, y: number } {

    if (ctrl) {
      offsetX *= section.width;
      offsetY *= section.height;
    }

    return {
      x: clamp(x + offsetX, 0, section.width - 1),
      y: clamp(y + offsetY, 0, section.height - 1)
    }
  }
}
