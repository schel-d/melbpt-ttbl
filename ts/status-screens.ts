import { Editor } from "./editor";
import { Header } from "./header";

export class StatusScreens {
  private _status: HTMLDivElement;
  private _statusLoading: HTMLDivElement;
  private _statusReady: HTMLDivElement;
  private _editor: Editor;
  private _header: Header;

  constructor(htmlID: string, editor: Editor, header: Header) {
    this._status = document.querySelector(`#${htmlID}`);
    this._statusLoading = document.querySelector(`#${htmlID}-loading`);
    this._statusReady = document.querySelector(`#${htmlID}-ready`);
    this._editor = editor;
    this._header = header;
  }
  loading() {
    this._status.classList.remove("gone");
    this._statusLoading.classList.remove("gone");
    this._statusReady.classList.add("gone");

    this._header.newTimetableButtonEnabled = false;
    this._header.importButtonEnabled = false;
    this._header.exportButtonEnabled = false;

    this._editor.content = [];
    window.onbeforeunload = null;
  }
  ready() {
    this._status.classList.remove("gone");
    this._statusLoading.classList.add("gone");
    this._statusReady.classList.remove("gone");

    this._header.newTimetableButtonEnabled = true;
    this._header.importButtonEnabled = true;
    this._header.exportButtonEnabled = false;

    this._editor.content = [];
    window.onbeforeunload = null;
  }
  editing() {
    this._status.classList.add("gone");

    this._header.newTimetableButtonEnabled = true;
    this._header.importButtonEnabled = true;
    this._header.exportButtonEnabled = true;

    window.onbeforeunload = function () {
      return true;
    };
  }
}
