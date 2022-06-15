import { Editor } from "./editor";
import { Header } from "./header";

export class StatusScreens {
  private status: HTMLDivElement;
  private statusLoading: HTMLDivElement;
  private statusReady: HTMLDivElement;
  private editor: Editor;
  private header: Header;

  constructor(htmlID: string, editor: Editor, header: Header) {
    this.status = document.querySelector(`#${htmlID}`);
    this.statusLoading = document.querySelector(`#${htmlID}-loading`);
    this.statusReady = document.querySelector(`#${htmlID}-ready`);
    this.editor = editor;
    this.header = header;
  }
  loading() {
    this.status.classList.remove("gone");
    this.statusLoading.classList.remove("gone");
    this.statusReady.classList.add("gone");

    this.header.newTimetableButtonEnabled = false;
    this.header.importButtonEnabled = false;
    this.header.exportButtonEnabled = false;

    this.editor.content = [];
    window.onbeforeunload = null;
  }
  ready() {
    this.status.classList.remove("gone");
    this.statusLoading.classList.add("gone");
    this.statusReady.classList.remove("gone");

    this.header.newTimetableButtonEnabled = true;
    this.header.importButtonEnabled = true;
    this.header.exportButtonEnabled = false;

    this.editor.content = [];
    window.onbeforeunload = null;
  }
  editing() {
    this.status.classList.add("gone");

    this.header.newTimetableButtonEnabled = true;
    this.header.importButtonEnabled = true;
    this.header.exportButtonEnabled = true;

    window.onbeforeunload = function () {
      return true;
    };
  }
}
