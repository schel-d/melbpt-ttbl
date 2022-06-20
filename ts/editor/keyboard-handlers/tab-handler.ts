import { Editor } from "../editor";
import { EditorKeyboardHandler, keyFilter } from "../editor-keyboard-handler";

export class TabHandler extends EditorKeyboardHandler {
  constructor(editor: Editor) {
    super(editor, [
      keyFilter({ key: "Tab", shift: "*" })
    ]);
  }

  handle(_char: string, _key: string, _ctrl: boolean, _alt: boolean,
    shift: boolean): void {

    // If there are no services in the timetable, do nothing.
    if (this.section.width == 0) { return; }

    // If nothing is selected, select the first row (or last if shifting).
    if (this.grid.selected == null) {
      if (shift) { this.selectCol(this.section.width - 1); }
      else { this.selectCol(0); }
      return;
    }

    const { startX, startY, endX, endY } = this.grid.selected;

    // If a whole column (service) is already selected, then select the next one
    // (or previous if shifting).
    if (startY == 0 && endY == this.section.height - 1) {
      if (shift) {
        this.selectCol((startX - 1 + this.section.width) % this.section.width);
      }
      else {
        this.selectCol((startX + 1) % this.section.width);
      }
      return;
    }

    // If a whole row (stop) is already selected, then select the next one (or
    // previous if shifting).
    if (startX == 0 && endX == this.section.width - 1) {
      if (shift) {
        this.selectRow((startY - 1 + this.section.height) % this.section.height);
      }
      else {
        this.selectRow((startY + 1) % this.section.height);
      }
      return;
    }

    // If something is selected, but its not a whole row or column, then select
    // the column where the selected started.
    this.selectCol(startX);
  }

  private selectCol(x: number) {
    this.grid.select(x, 0, x, this.section.height - 1);
  }
  private selectRow(y: number) {
    this.grid.select(0, y, this.section.width - 1, y);
  }
  private get section() {
    return this._editor.section;
  }
  private get grid() {
    return this._editor.grid;
  }
}
