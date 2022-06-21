import { CommandHandler } from "./command-handler";
import { SelectArrowsHandler } from "./select-arrows-handler";
import { AppContext } from "../main";
import { TabHandler } from "./tab-handler";
import { extractContent } from "./extract-content";
import { createToast } from "../components/toast";
import { EnterHandler } from "./enter-handler";

export class CommandListener {
  private _appContext: AppContext;
  private _handlers: CommandHandler[];

  constructor() {
    this._handlers = [
      new SelectArrowsHandler(),
      new TabHandler(),
      new EnterHandler()
    ];
  }
  init(appContext: AppContext) {
    this._appContext = appContext;
  }

  onKey(char: string, key: string, ctrl: boolean, alt: boolean,
    shift: boolean) {

    const handler = this._handlers.find(h => h.acceptedFilters.some(f => {
      if (f.char != undefined && f.char != char) { return false; }
      if (f.key != undefined && f.key != key) { return false; }
      if (f.ctrl != undefined && f.ctrl != ctrl) { return false; }
      if (f.alt != undefined && f.alt != alt) { return false; }
      if (f.shift != undefined && f.shift != shift) { return false; }
      return true;
    }));

    if (handler != null) {
      handler.handle(char, key, ctrl, alt, shift, this._appContext);
    }
  }

  onDocKeyEvent(e: KeyboardEvent) {
    // Unfortunately doing paste via the command handlers is impractical
    // and it is instead done via the document "paste" event. Therefore we
    // cannot call e.preventDefault() for Ctrl+V.
    if (e.code == "KeyV" && (e.ctrlKey || e.metaKey)) { return; }

    if (this._appContext.newTimetableDialog.isOpen() ||
      this._appContext.pasteIssuesDialog.isOpen()) { return; }

    e.preventDefault();

    if (e.key == "Control" || e.key == "Meta" || e.key == "Alt" ||
      e.key == "Shift") { return; }

    this.onKey(e.key, e.code, e.ctrlKey || e.metaKey, e.altKey, e.shiftKey);
  }

  onPaste(e: ClipboardEvent) {
    // Unfortunately doing paste via the command handlers is impractical
    // and it is instead done via the document "paste" event.

    const section = this._appContext.editor.section;
    const ntd = this._appContext.newTimetableDialog;
    const pid = this._appContext.pasteIssuesDialog;
    const network = this._appContext.network;

    if (section == null || ntd.isOpen() || pid.isOpen()) { return; }

    const text = e.clipboardData.getData("text");
    e.preventDefault();

    // Try to extract timetable content from the pasted text based on the stop
    // names in this timetable.
    const stopNames = section.stops.map(s => network.stopName(s));
    extractContent(text, stopNames, pid, (newContent, missing) => {
      const numOfStopsFound = stopNames.length - missing.length;
      if (numOfStopsFound <= 1) {
        // If there was basically no usable timetable content in what was pasted,
        // mostly ignore it.
        createToast(`That didn't seem like timetable content.`);
        return;
      }

      // Otherwise add it to the current section.
      section.watchAppend("Paste timetable content", (log) => {
        log.appendServices(newContent);
      })

      // Display a toast if any stops were not present. This kind of thing may
      // happen often, especially in V/Line timetables, but informs the user just
      // in case they make a mistake coping the full table.
      if (missing.length > 3) {
        createToast(`${missing.length} stops were missing from pasted content.`);
      }
      else if (missing.length != 0) {
        createToast(
          `${missing.join(", ")} ${missing.length == 1 ? "was" : "were"} ` +
          `missing from the pasted content.`);
      }
    });
  }
}
