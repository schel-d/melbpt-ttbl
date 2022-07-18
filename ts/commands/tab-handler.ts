import { TimetableSection } from "../data/timetable-section";
import { EditorGrid } from "../editor/editor-grid";
import { AppContext } from "../app-context";
import { CommandHandler, keyFilter } from "./command-handler";

/**
 * Responsible for the tab key, which selects the current entire column, the
 * next/previous entire column, or the next/previous entire row, depending on
 * context.
 *
 * Todo: reconsider whether tab is the right key for this, because it kinda
 * feels right, but it causes major accessibility issues for people who rely on
 * tab to get around the page. Then again, I doubt anyone other than me will
 * every use this thing so... ¯\_(ツ)_/¯
 */
export class TabHandler extends CommandHandler {
  constructor() {
    // Request Tab and Shift+Tab.
    super([
      keyFilter({ key: "Tab", shift: "*" })
    ]);
  }

  handle(_char: string, _key: string, _ctrl: boolean, _alt: boolean,
    shift: boolean, appContext: AppContext) {

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

  /**
   * Helper function to select the entire column, given just a x-coordinate.
   * @param grid The grid to edit the selection on.
   * @param section The section to retrieve the section's height from.
   * @param x The x-coordinate of the column to select.
   */
  private selectCol(grid: EditorGrid, section: TimetableSection, x: number) {
    grid.select(x, 0, x, section.height - 1);
  }

  /**
   * Helper function to select the entire row, given just a y-coordinate.
   * @param grid The grid to edit the selection on.
   * @param section The section to retrieve the section's width from.
   * @param y The y-coordinate of the row to select.
   */
  private selectRow(grid: EditorGrid, section: TimetableSection, y: number) {
    grid.select(0, y, section.width - 1, y);
  }
}
