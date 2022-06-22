import { TimetableSection } from "../data/timetable-section";
import { EditorGrid } from "../editor/editor-grid";
import { AppContext } from "../main";
import { CommandHandler, keyFilter } from "./command-handler";

export class TabHandler extends CommandHandler {
  constructor() {
    super([
      keyFilter({ key: "Tab", shift: "*" })
    ]);
  }

  handle(_char: string, _key: string, _ctrl: boolean, _alt: boolean,
    shift: boolean, appContext: AppContext): void {

    const section = appContext.editor.section;
    const grid = appContext.editor.grid;

    // If there are no services in the timetable, do nothing.
    if (section == null || section.width == 0) { return; }

    // If nothing is selected, select the first row (or last if shifting).
    if (grid.selected == null) {
      if (shift) { this.selectCol(grid, section, section.width - 1); }
      else { this.selectCol(grid, section, 0); }
      return;
    }

    const { startX, startY, endX, endY } = grid.selected;

    // If a whole column (service) is already selected, then select the next one
    // (or previous if shifting).
    if (startY == 0 && endY == section.height - 1) {
      if (shift) {
        this.selectCol(grid, section,
          (startX - 1 + section.width) % section.width);
      }
      else {
        this.selectCol(grid, section, (startX + 1) % section.width);
      }
      return;
    }

    // If a whole row (stop) is already selected, then select the next one (or
    // previous if shifting).
    if (startX == 0 && endX == section.width - 1) {
      if (shift) {
        this.selectRow(grid, section,
          (startY - 1 + section.height) % section.height);
      }
      else {
        this.selectRow(grid, section, (startY + 1) % section.height);
      }
      return;
    }

    // If something is selected, but its not a whole row or column, then select
    // the column where the selected started.
    this.selectCol(grid, section, startX);
  }

  private selectCol(grid: EditorGrid, section: TimetableSection, x: number) {
    grid.select(x, 0, x, section.height - 1);
  }
  private selectRow(grid: EditorGrid, section: TimetableSection, y: number) {
    grid.select(0, y, section.width - 1, y);
  }
}
