import { Editor } from "./editor";
import { Header } from "./header";
import { Network } from "./network";
import { Timetable, TimetableSection } from "./timetable";

export class StatusScreens {
  private _status: HTMLDivElement;
  private _statusLoading: HTMLDivElement;
  private _statusReady: HTMLDivElement;
  private _editor: Editor;
  private _header: Header;

  constructor(htmlID: string, editor: Editor, header: Header) {
    this._status = document.getElementById(htmlID) as HTMLDivElement;
    this._statusLoading =
      document.getElementById(`${htmlID}-loading`) as HTMLDivElement;
    this._statusReady =
      document.getElementById(`${htmlID}-ready`) as HTMLDivElement;
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
    this._header.clearTabs();

    this._editor.clear();
    window.onbeforeunload = null;
  }
  ready() {
    this._status.classList.remove("gone");
    this._statusLoading.classList.add("gone");
    this._statusReady.classList.remove("gone");

    this._header.newTimetableButtonEnabled = true;
    this._header.importButtonEnabled = true;
    this._header.exportButtonEnabled = false;
    this._header.clearTabs();

    this._editor.clear();
    window.onbeforeunload = null;
  }
  editing(timetable: Timetable) {
    this._status.classList.add("gone");

    this._header.newTimetableButtonEnabled = true;
    this._header.importButtonEnabled = true;
    this._header.exportButtonEnabled = true;
    this._header.createTabs(timetable.generalDirs, timetable.dows);

    window.onbeforeunload = () => {
      if (timetable.hasContent()) {
        return true;
      }
    };
  }
  editingSection(section: TimetableSection, selectTab: boolean,
    network: Network) {

    if (selectTab) {
      this._header.selectTab(section.generalDir, section.dow);
    }

    this._editor.setSection(section, network);
  }
}
