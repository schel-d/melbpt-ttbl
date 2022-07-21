import { createToast } from "../components/toast";
import { AppContext } from "../app-context";
import { CommandHandler, keyFilter } from "./command-handler";

/**
 * Reponsible for Ctrl+Z, Ctrl+Shift+Z, and Ctrl+Y, which are used to undo or
 * redo the last change that occurred to the current timetable section.
 */
export class UndoHandler extends CommandHandler {
  constructor() {
    // Request Ctrl+Z, Ctrl+Shift+Z, and Ctrl+Y.
    super([
      keyFilter({ key: "KeyZ", ctrl: true, shift: "*" }),
      keyFilter({ key: "KeyY", ctrl: true })
    ]);
  }

  handle(_char: string, key: string, _ctrl: boolean, _alt: boolean,
    shift: boolean, appContext: AppContext) {

    const section = appContext.editor.section;

    // If no section is currently being edited, do nothing.
    if (section == null) { return; }

    // If either Ctrl+Shift+Z or Ctrl+Y is pressed...
    if (key == "KeyY" || shift) {
      // Perform a redo (if possble), and create a toast message either saying
      // what was redone, or that redo was unavailable.
      const actionName = section.redo();
      if (actionName != null) {
        createToast(`Redone: ${actionName}`);
      }
      else {
        createToast("Cannot redo any further");
      }
    }
    else {
      // Otherwise, perform an undo (if possble), and create a toast message
      // either saying what was undone, or that undo was unavailable.
      const actionName = section.undo();
      if (actionName != null) {
        createToast(`Undone: ${actionName}`);
      }
      else {
        createToast("Cannot undo any further");
      }
    }

    // Now the section could be shorter, so make sure the editor isn't scrolled
    // to far to the right.
    appContext.editor.refreshScroll();
  }
}
