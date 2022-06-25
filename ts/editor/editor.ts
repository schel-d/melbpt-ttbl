import { Network } from "../data/network";
import { TimetableSection } from "../data/timetable-section";
import { ValidationResults } from "../data/timetable-validation";
import { clamp } from "../utils";
import { EditorGrid } from "./editor-grid";
import { EditorServices } from "./editor-services";
import { EditorStops } from "./editor-stops";

export class Editor {
  section: TimetableSection | null;
  grid: EditorGrid;
  stops: EditorStops;
  services: EditorServices;

  private _editorDiv: HTMLDivElement;
  private _validationTimeoutID: number | null;

  requestValidation: (() => void) | null;

  constructor(editorID: string, gridID: string, canvasID: string,
    stopsID: string, servicesID: string) {

    this._editorDiv = document.getElementById(editorID) as HTMLDivElement;
    this.grid = new EditorGrid(this, gridID, canvasID);
    this.stops = new EditorStops(stopsID);
    this.services = new EditorServices(servicesID);

    this.section = null;
  }

  init() {
    this.grid.init();

    this._editorDiv.addEventListener("scroll", () => {
      this.grid.resetMouseOver();
      this.grid.draw();
    });

    // Make the scrollwheel cause horizontal scrolling in the editor, not
    // vertical Firefox is 'DOMMouseScroll' and basically everything else is
    // 'mousewheel'
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
      this.section.changed = null;
    }
    this.section = null;
    this.stops.clear();
    this.services.clear();
    this.grid.resetEvents();
    this.grid.draw();
  }

  setSection(section: TimetableSection, network: Network) {
    if (this.section != null) {
      this.section.changed = null;
    }

    this.section = section;
    this.stops.setStops(section.stops.map(s => network.stopName(s)));
    this.services.setServices(this.section.map(s => s.nextDay));

    this.section.changed = () => this.onChanged();
    this.grid.resetEvents();
    this.grid.draw();
  }

  applyValidationOverlay(results: ValidationResults) {
    this.stops.markErrorStops(results.stopErrors.map(e => e != null));
  }

  private onChanged() {
    this.grid.draw();
    this.services.setServices(this.section.map(s => s.nextDay));

    if (this._validationTimeoutID != null) {
      clearTimeout(this._validationTimeoutID);
      this._validationTimeoutID = null;
    }

    this._validationTimeoutID = setTimeout(() => {
      if (this.requestValidation != null) { this.requestValidation(); }
    }, 500);
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

    const delta = clamp(wheelEvent.wheelDelta || -wheelEvent.detail, -1, 1);
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
