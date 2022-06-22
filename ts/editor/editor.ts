import { createToast } from "../components/toast";
import { Network } from "../data/network";
import { runSmarts } from "../data/service-smarts";
import { TimetableSection } from "../data/timetable";
import { ValidationEngine } from "../data/validation-engine";
import { range } from "../utils";
import { EditorGrid } from "./editor-grid";
import { EditorServices } from "./editor-services";
import { EditorStops } from "./editor-stops";

export class Editor {
  section: TimetableSection | null;
  validationEngine: ValidationEngine | null;
  grid: EditorGrid;
  stops: EditorStops;
  services: EditorServices;

  private _editorDiv: HTMLDivElement;

  errorChanged: ((error: string | null) => void) | null;

  constructor(editorID: string, gridID: string, canvasID: string,
    stopsID: string, servicesID: string) {

    this._editorDiv = document.getElementById(editorID) as HTMLDivElement;
    this.grid = new EditorGrid(this, gridID, canvasID);
    this.stops = new EditorStops(stopsID);
    this.services = new EditorServices(servicesID);

    this.section = null;
    this.validationEngine = null;
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
    this.validationEngine = null;
    this.stops.clear();
    this.services.clear();
    this.grid.resetEvents();
    this.grid.draw();
  }

  setSection(section: TimetableSection, network: Network) {
    if (this.section != null) {
      this.section.clearListeners();
    }

    // Stage 1: create the buttons
    this.section = section;
    this.stops.setStops(section.stops.map(s => network.stopName(s)));
    this.services.setServices(section.grid.map(s => runSmarts(s)));

    // Stage 2: Apply validation markings to buttons
    this.validationEngine = new ValidationEngine(section);
    this.stops.markErrorStops(this.validationEngine.stopErrors.map(e => e != null));
    if (this.errorChanged) { this.errorChanged(this.validationEngine.errorMessage()); }

    this.section.registerListeners(
      () => this.onEdited(),
      (startIndex, amount) => this.onColsAdded(startIndex, amount),
      (originalIndices) => this.onColsDeleted(originalIndices),
      (indices) => this.onColsEdited(indices),
      (indices) => this.onRowsEdited(indices),
      (actionName, type) => this.onReplace(actionName, type));
    this.grid.resetEvents();
    this.grid.draw();
  }

  private onEdited() {
    this.grid.draw();
  }
  private onColsAdded(startIndex: number, amount: number) {
    this.validationEngine.revalidateServices(range(startIndex, startIndex + amount));
    if (this.errorChanged) { this.errorChanged(this.validationEngine.errorMessage()); }

    // Todo: use the results from the validation engine.
    const newServices = this.section.grid.slice(startIndex,
      startIndex + amount);
    this.services.addServices(startIndex, newServices.map(s => runSmarts(s)));
  }
  private onColsDeleted(originalIndices: number[]) {
    this.validationEngine.removeServices(originalIndices);
    if (this.errorChanged) { this.errorChanged(this.validationEngine.errorMessage()); }

    this.services.removeServices(originalIndices);
  }
  private onColsEdited(indices: number[]) {
    this.validationEngine.revalidateServices(indices);
    if (this.errorChanged) { this.errorChanged(this.validationEngine.errorMessage()); }

    // Todo: use the results from the validation engine.
    indices.forEach(s => this.services.updateService(s, runSmarts(this.section.grid[s])));
  }
  private onRowsEdited(indices: number[]) {
    this.validationEngine.revalidateStops(indices);
    if (this.errorChanged) { this.errorChanged(this.validationEngine.errorMessage()); }

    this.stops.markErrorStops(this.validationEngine.stopErrors.map(e => e != null));

    // Todo: use the results from the validation engine to mark the broken
    // stops in red or something.
  }
  private onReplace(actionName: string, type: "undo" | "redo") {
    // Replace the validation engine object because the whole grid just changed
    // and we can't really track how it changed, so just start fresh.
    this.validationEngine = new ValidationEngine(this.section);
    if (this.errorChanged) { this.errorChanged(this.validationEngine.errorMessage()); }
    this.stops.markErrorStops(this.validationEngine.stopErrors.map(e => e != null));

    // Todo: use the results from the validation engine.
    this.services.setServices(this.section.grid.map(s => runSmarts(s)));
    this.grid.draw();

    if (type == "undo") {
      createToast(`Undone "${actionName}"`);
    }
    else if (type == "redo") {
      createToast(`Redone "${actionName}"`);
    }
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
