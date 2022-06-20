import { Network } from "../network";
import { runSmarts } from "../service-smarts";
import { TimetableSection } from "../timetable";
import { EditorGrid } from "./editor-grid";
import { EditorKeyboard } from "./editor-keyboard";
import { EditorServices } from "./editor-services";
import { EditorStops } from "./editor-stops";

export class Editor {
  section: TimetableSection | null;
  grid: EditorGrid;
  stops: EditorStops;
  services: EditorServices;

  private _keyboard: EditorKeyboard;
  private _editorDiv: HTMLDivElement;

  constructor(editorID: string, gridID: string, canvasID: string,
    stopsID: string, servicesID: string) {

    this._editorDiv = document.getElementById(editorID) as HTMLDivElement;

    this.section = null;
    this.grid = new EditorGrid(this, gridID, canvasID);
    this.stops = new EditorStops(stopsID);
    this.services = new EditorServices(servicesID);
    this._keyboard = new EditorKeyboard(this);
  }

  init() {
    this.grid.init();

    this._editorDiv.addEventListener("scroll", () => {
      this.grid.resetMouseOver();
      this.grid.draw();
    });

    // Make the scrollwheel cause horizontal scrolling in the editor, not vertical
    // Firefox is 'DOMMouseScroll' and basically everything else is 'mousewheel'
    const scrollEvent = (e: Event) => this.onScrollWheel(e);
    this._editorDiv.addEventListener("mousewheel", scrollEvent, false);
    this._editorDiv.addEventListener("DOMMouseScroll", scrollEvent, false);

    this.grid.draw();
  }

  resize() {
    this.grid.resetMouseOver();
    this.grid.draw();
  }

  clear() {
    if (this.section != null) {
      this.section.clearListeners();
    }

    this.section = null;
    this.stops.clear();
    this.services.clear();
    this.grid.resetEvents();
    this.grid.draw();
  }

  setSection(section: TimetableSection, network: Network) {
    if (this.section != null) {
      this.section.clearListeners();
    }

    this.section = section;
    this.stops.setStops(section.stops.map(s => network.stopName(s)));
    this.services.setServices(section.grid.map(s => runSmarts(s)));

    this.section.registerListeners(
      () => this.onEdited(),
      (startIndex, amount) => this.onColsAdded(startIndex, amount),
      (indices) => this.onColsDeleted(indices),
      (indices) => this.onColsEdited(indices),
      (indices) => this.onRowsEdited(indices));
    this.grid.resetEvents();
    this.grid.draw();
  }

  private onEdited() {
    this.grid.draw();
  }
  private onColsAdded(startIndex: number, amount: number) {
    // Todo: validate the new columns... properly.
    const newServices = this.section.grid.slice(startIndex,
      startIndex + amount);
    this.services.addServices(startIndex, newServices.map(s => runSmarts(s)));
  }
  private onColsDeleted(indices: number[]) {
    // Todo: remove service buttons from the services row for removed columns.
  }
  private onColsEdited(indices: number[]) {
    // Todo: re-validate the columns that changed (only do service-based
    // validation here, stop-based validation occurs in onRowsEdited()).
  }
  private onRowsEdited(indices: number[]) {
    // Todo: re-validate the rows that changed (only do stop-based validation
    // here, service-based validation occurs in onColsEdited()).
  }

  private onScrollWheel(e: Event) {
    e = window.event || e;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const wheelEvent = e as any;

    const delta = Math.max(-1, Math.min(1, wheelEvent.wheelDelta || -wheelEvent.detail));
    this._editorDiv.scrollLeft -= delta * 64;
    e.preventDefault();
  };

  paste(content: string[][]) {
    if (this.section == null) { return; }
    this.section.appendServices(content);
  }

  clientSize() {
    return this._editorDiv.getBoundingClientRect();
  }

  scrollPos() {
    return { x: this._editorDiv.scrollLeft, y: this._editorDiv.scrollTop };
  }

  onKey(char: string, key: string, ctrl: boolean, alt: boolean, shift: boolean) {
    this._keyboard.onKey(char, key, ctrl, alt, shift);
  }
}
