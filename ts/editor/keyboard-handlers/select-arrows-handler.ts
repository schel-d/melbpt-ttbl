import { clamp } from "../../utils";
import { Editor } from "../editor";
import { EditorKeyboardHandler, keyFilter } from "../editor-keyboard-handler";

export class SelectArrowsHandler extends EditorKeyboardHandler {
  constructor(editor: Editor) {
    super(editor, [
      keyFilter({ key: "ArrowUp", ctrl: "*", shift: "*" }),
      keyFilter({ key: "ArrowDown", ctrl: "*", shift: "*" }),
      keyFilter({ key: "ArrowLeft", ctrl: "*", shift: "*" }),
      keyFilter({ key: "ArrowRight", ctrl: "*", shift: "*" })
    ]);
  }

  handle(_char: string, key: string, ctrl: boolean, _alt: boolean,
    shift: boolean): void {

    // If there are no services in the timetable or nothing is selected, do
    // nothing.
    if (this.section.width == 0 || this.grid.selected == null) { return; }

    // Create offset coordinates from the key code.
    let offsetX = 0;
    let offsetY = 0;
    if (key == "ArrowUp") { offsetY = -1; }
    if (key == "ArrowDown") { offsetY = 1; }
    if (key == "ArrowLeft") { offsetX = -1; }
    if (key == "ArrowRight") { offsetX = 1; }

    const { startX, startY, endX, endY } = this.grid.selected;

    // If shift is held, the end select coordinates should change without
    // changing the start coordinates.
    if (shift) {
      const coords = this.coordsFromOffset(endX, endY, offsetX, offsetY, ctrl);
      this.grid.select(startX, startY, coords.x, coords.y);
      return;
    }

    // Otherwise change the selection's start and end cooridinates such that
    // only one cell is selected.
    const coords = this.coordsFromOffset(startX, startY, offsetX, offsetY, ctrl);
    this.grid.select(coords.x, coords.y, coords.x, coords.y);
  }

  private get section() {
    return this._editor.section;
  }
  private get grid() {
    return this._editor.grid;
  }
  private coordsFromOffset(x: number, y: number, offsetX: number,
    offsetY: number, ctrl: boolean): { x: number, y: number } {

    if (ctrl) {
      offsetX *= this.section.width;
      offsetY *= this.section.height;
    }

    return {
      x: clamp(x + offsetX, 0, this.section.width - 1),
      y: clamp(y + offsetY, 0, this.section.height - 1)
    }
  }
}
