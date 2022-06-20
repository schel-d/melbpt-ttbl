import { Editor } from "./editor";
import { EditorKeyboardHandler } from "./editor-keyboard-handler";
import { SelectArrowsHandler } from "./keyboard-handlers/select-arrows-handler";
import { TabHandler } from "./keyboard-handlers/tab-handler";

export class EditorKeyboard {
  private _handlers: EditorKeyboardHandler[];

  constructor(editor: Editor) {
    this._handlers = [
      new TabHandler(editor),
      new SelectArrowsHandler(editor)
    ];
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
      handler.handle(char, key, ctrl, alt, shift);
    }
  }
}
