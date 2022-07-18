import { TimetableSection } from "../data/timetable-section";
import { AppContext } from "../app-context";
import { clamp } from "../utils";
import { CommandHandler, keyFilter } from "./command-handler";

// Imported purely for the @link below, otherwise VSCode doesn't do it properly.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { AltArrowsHandler } from "./alt-arrows-handler";

/**
 * Responsible for the arrow keys, including where ctrl or shift is pressed (not
 * alt though, that's the {@link AltArrowsHandler}'s job). These modify the
 * current selection coordinates.
 */
export class SelectArrowsHandler extends CommandHandler {
  constructor() {
    // Request all the arrows keys, regardless of whether ctrl or shift are
    // pressed. Note that alt is not requested.
    super([
      keyFilter({ key: "ArrowUp", ctrl: "*", shift: "*" }),
      keyFilter({ key: "ArrowDown", ctrl: "*", shift: "*" }),
      keyFilter({ key: "ArrowLeft", ctrl: "*", shift: "*" }),
      keyFilter({ key: "ArrowRight", ctrl: "*", shift: "*" })
    ]);
  }

  handle(_char: string, key: string, ctrl: boolean, _alt: boolean,
    shift: boolean, appContext: AppContext) {

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

  /**
   * Returns the coordinates with the offsets added. If {@link ctrl} is true,
   * the coordinates jump to the end. The {@link section} is given so these
   * coordinates can be clamped to the size of the section.
   * @param section The timetable section to retrieve the width and height from.
   * @param x The current x coordinate.
   * @param y The current y coordinate.
   * @param offsetX The amount to add to the x coordinate. May be negative.
   * @param offsetY The amount to add to the y coordinate. May be negative.
   * @param ctrl Whether or not ctrl is pressed (causes a jump to the end).
   */
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
