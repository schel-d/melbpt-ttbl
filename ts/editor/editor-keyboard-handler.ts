import { Editor } from "./editor";

export type KeyFilter = {
  char: string, key: string, ctrl: boolean, alt: boolean, shift: boolean
};

export abstract class EditorKeyboardHandler {
  protected _editor: Editor;
  acceptedFilters: KeyFilter[];

  constructor(editor: Editor, acceptedFilters: KeyFilter[]) {
    this._editor = editor;
    this.acceptedFilters = acceptedFilters;
  }

  abstract handle(char: string, key: string, ctrl: boolean, alt: boolean,
    shift: boolean): void;
}

export function keyFilter(options: {
  char?: string, key?: string, ctrl?: boolean | "*", alt?: boolean | "*",
  shift?: boolean | "*"
}): KeyFilter {

  return {
    char: options.char,
    key: options.key,
    ctrl: options.ctrl == "*" ? null : (options.ctrl ?? false),
    alt: options.alt == "*" ? null : (options.alt ?? false),
    shift: options.shift == "*" ? null : (options.shift ?? false)
  };
}
