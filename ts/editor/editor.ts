import { createToast } from "../components/toast";
import { Network } from "../data/network";
import { runSmarts } from "../data/service-smarts";
import { TimetableSection } from "../data/timetable";
import { EditorGrid } from "./editor-grid";
import { EditorServices } from "./editor-services";
import { EditorStops } from "./editor-stops";

export class Editor {
  section: TimetableSection | null;
  grid: EditorGrid;
  stops: EditorStops;
  services: EditorServices;

  private _editorDiv: HTMLDivElement;

  constructor(editorID: string, gridID: string, canvasID: string,
    stopsID: string, servicesID: string) {

    this._editorDiv = document.getElementById(editorID) as HTMLDivElement;

    this.section = null;
    this.grid = new EditorGrid(this, gridID, canvasID);
    this.stops = new EditorStops(stopsID);
    this.services = new EditorServices(servicesID);
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

    this.stops.stopClicked = (index) => this.onStopClicked(index);
    this.services.serviceClicked = (index) => this.onServiceClicked(index);

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
      (originalIndices) => this.onColsDeleted(originalIndices),
      (indices) => this.onColsEdited(indices),
      (indices) => this.onRowsEdited(indices),
      (actionName) => this.onUndo(actionName));
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
  private onColsDeleted(originalIndices: number[]) {
    this.services.removeServices(originalIndices);
  }
  private onColsEdited(indices: number[]) {
    // Todo: re-validate the columns that changed (only do service-based
    // validation here, stop-based validation occurs in onRowsEdited()).
  }
  private onRowsEdited(indices: number[]) {
    // Todo: re-validate the rows that changed (only do stop-based validation
    // here, service-based validation occurs in onColsEdited()).
  }
  private onUndo(actionName: string) {
    // Todo: re-validate everything just like the section just got set!
    this.services.setServices(this.section.grid.map(s => runSmarts(s)));
    this.grid.draw();
    createToast(`Undone "${actionName}"`);
  }
  private onServiceClicked(index: number) {
    this.grid.select(index, 0, index, this.section.height - 1);
  }
  private onStopClicked(index: number) {
    if (this.section.width == 0) { return; }
    this.grid.select(0, index, this.section.width - 1, index);
  }

  private onScrollWheel(e: Event) {
    e = window.event || e;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const wheelEvent = e as any;

    const delta = Math.max(-1, Math.min(1, wheelEvent.wheelDelta || -wheelEvent.detail));
    this._editorDiv.scrollLeft -= delta * 64;
    e.preventDefault();
  };

  clientSize() {
    return this._editorDiv.getBoundingClientRect();
  }

  scrollPos() {
    return { x: this._editorDiv.scrollLeft, y: this._editorDiv.scrollTop };
  }
}
