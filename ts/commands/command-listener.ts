import { CommandHandler } from "./command-handler";
import { SelectArrowsHandler } from "./select-arrows-handler";
import { AppContext } from "../app-context";
import { TabHandler } from "./tab-handler";
import { extractContent } from "./extract-content";
import { createToast } from "../components/toast";
import { EnterHandler } from "./enter-handler";
import { DeleteHandler } from "./delete-handler";
import { SelectAllHandler } from "./select-all-handler";
import { UndoHandler } from "./undo-handler";
import { AltArrowsHandler } from "./alt-arrows-handler";
import { TextEntryHandler } from "./text-entry-handler";
import { NewServiceHandler } from "./new-service-handler";
import { SpaceHandler } from "./space-handler";
import { NextDayHandler } from "./next-day-handler";
import { Service } from "../data/timetable-service";

/**
 * The controller for all keyboard commands in the webapp, including paste,
 * which is handled somewhat separately.
 */
export class CommandListener {
  private _appContext: AppContext;
  private _handlers: CommandHandler[];

  constructor(appContext: AppContext) {
    this._appContext = appContext;

    // Order is somewhat important here, as the first handler that matches the
    // key pressed will be called (if there are overlapping key filters).
    this._handlers = [
      new SelectArrowsHandler(),
      new TabHandler(),
      new EnterHandler(),
      new DeleteHandler(),
      new SelectAllHandler(),
      new UndoHandler(),
      new AltArrowsHandler(),
      new TextEntryHandler(),
      new NewServiceHandler(),
      new SpaceHandler(),
      new NextDayHandler()
    ];
  }

  /**
   * Handles document `keydown` events, running a command if appropriate, or
   * allowing default behaviour (e.g. Ctrl+Shift+I opening DevTools) otherwise.
   * @param e The event.
   */
  onDocKeyEvent(e: KeyboardEvent) {
    // Do nothing if a dialog is open, as these tend to have inputs, which take
    // priority.
    if (this._appContext.newTimetableDialog.isOpen() ||
      this._appContext.pasteIssuesDialog.isOpen()) { return; }

    // Do nothing if a modifier key is pressed, as commands only run when the
    // non-modifier bit of the keyboard shortcut is pressed.
    const isModifier = e.key == "Control" || e.key == "Meta" ||
      e.key == "Alt" || e.key == "Shift";
    if (isModifier) {
      e.preventDefault();
      return;
    }

    // Otherwise, try running a handler, and if one is run, prevent default
    // behaviour.
    const captured = this.onKey(e.key, e.code, e.ctrlKey || e.metaKey, e.altKey,
      e.shiftKey);
    if (captured) {
      e.preventDefault();
    }
  }

  onPaste(e: ClipboardEvent) {
    // Unfortunately doing paste via the command handlers is impractical
    // and it is instead done via the document "paste" event.

    const section = this._appContext.editor.section;
    const ntd = this._appContext.newTimetableDialog;
    const pid = this._appContext.pasteIssuesDialog;
    const network = this._appContext.network;

    if (section == null || ntd.isOpen() || pid.isOpen()) { return; }

    // If there was no text copied to the clipboard, don't handle it at all.
    const text = e.clipboardData?.getData("text") ?? "";
    if (text.length == 0) { return; }

    e.preventDefault();

    // Try to extract timetable content from the pasted text based on the stop
    // names in this timetable.
    const stopNames = section.stops.map(s => network.stopName(s));
    extractContent(text, stopNames, pid, (newContent, missing) => {
      const numOfStopsFound = stopNames.length - missing.length;
      if (numOfStopsFound <= 1) {
        // If there was basically no usable timetable content in what was
        // pasted, ignore it.
        createToast(`That didn't seem like timetable content.`);
        return;
      }

      // Otherwise add it to the current section.
      section.edit("Paste timetable content", data => {
        data.addServices(newContent.map(x => new Service(x, false)));
      })

      // Display a toast if any stops were not present. This kind of thing may
      // happen often, especially in V/Line timetables, but informs the user
      // just in case they make a mistake coping the full table.
      if (missing.length > 3) {
        createToast(
          `${missing.length} stops were missing from the pasted content.`);
      }
      else if (missing.length != 0) {
        createToast(
          `${missing.join(", ")} ${missing.length == 1 ? "was" : "were"} ` +
          `missing from the pasted content.`);
      }
    });

    // Scroll to show the newly pasted content.
    this._appContext.editor.scrollToEnd();
  }

  /**
   * Called when a keyboard event happens, such that a new key other than a
   * modifier key is pressed. Returns true if a command was run.
   * @param char The string that would be typed if the key that was pressed was
   * pressed while editing a textbox, e.g. "a" for the A key.
   * @param key The string ID representing this key, e.g. "KeyA" for the A key.
   * @param ctrl Whether or not control/command/meta was pressed.
   * @param alt Whether or not alt/option was pressed.
   * @param shift Whether or not shift was pressed.
   */
  private onKey(char: string, key: string, ctrl: boolean, alt: boolean,
    shift: boolean): boolean {

    // Find the first handler that matches the key filter.
    const handler = this._handlers.find(h => h.acceptedFilters.some(f => {
      // Here, null acts as a wildcard, unlike in the keyFilter function.
      if (f.char != null && f.char != char) { return false; }
      if (f.key != null && f.key != key) { return false; }
      if (f.ctrl != null && f.ctrl != ctrl) { return false; }
      if (f.alt != null && f.alt != alt) { return false; }
      if (f.shift != null && f.shift != shift && f.char == null) {
        return false;
      }
      return true;
    }));

    // If there was a matching handler, run it.
    if (handler != null) {
      handler.handle(char, key, ctrl, alt, shift, this._appContext);
      return true;
    }

    // Otherwise return false, so that e.preventDefault() is not called
    // allowing the browser's default behaviour (e.g. Ctrl+Shift+I opening
    // DevTools) to occur.
    return false;
  }
}
