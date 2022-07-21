import { Network } from "../data/network";
import { TimetableSection } from "../data/timetable-section";
import { ValidationResults } from "../data/timetable-validation-results";
import { getHtmlOther } from "../dom-utils";
import { HtmlIDs } from "../main";
import { clamp } from "../utils";
import { EditorGrid, editorColSize } from "./editor-grid";
import { EditorServices } from "./editor-services";
import { EditorStops } from "./editor-stops";

/**
 * Manages the entire editor section of the DOM, and tracks with section is
 * currently being edited.
 */
export class Editor {
  section: TimetableSection | null;
  grid: EditorGrid;
  stops: EditorStops;
  services: EditorServices;

  private _editorDiv: HTMLDivElement;

  private _validationTimeoutID: number | null;
  private _validationRequestCallback: (section: TimetableSection) => void;

  constructor(validationRequestCallback: (section: TimetableSection) => void) {
    this.section = null;
    this.grid = new EditorGrid(this);
    this.stops = new EditorStops();
    this.services = new EditorServices();

    this._editorDiv = getHtmlOther(HtmlIDs.editor) as HTMLDivElement;
    this._validationTimeoutID = null;

    this._validationRequestCallback = validationRequestCallback;

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

  /**
   * Called when the window is resized. Allows the grid canvas to redraw itself.
   */
  resize() {
    this.grid.resetMouseOver();
    this.grid.draw();
  }

  /**
   * Clears the entire editor. Called when a timetable is unloaded?
   */
  clear() {
    if (this.section != null) {
      this.section.changed = null;
    }
    this.section = null;
    this.stops.clear();
    this.services.clear();
    this.grid.resetEvents();
    this.grid.setNextDayThresholds([]);
    this.grid.draw();
  }

  /**
   * Sets a section to be edited.
   * @param section The timetable section to edit.
   * @param network The network object to retrieve stop names from.
   */
  setSection(section: TimetableSection, network: Network) {
    if (this.section != null) {
      this.section.changed = null;
    }

    this.section = section;
    this.stops.setStops(section.stops.map(s => network.stopName(s)));
    this.services.setServices(this.section.map(s => s.nextDay));

    this._editorDiv.scrollLeft = 0;

    this.section.changed = () => this.onChanged();
    this.grid.resetEvents();
    this.grid.draw();

    this._validationRequestCallback(section);
  }

  /**
   * Makes the validation results visible on the timetable section itself.
   * @param results The validation results.
   */
  applyValidationOverlay(results: ValidationResults) {
    const section = this.section;
    if (section == null) { return; }

    this.stops.markErrorStops(results.stopErrors.map(e => e != null));
    this.services.markErrorServices(results.serviceErrors.map(e => e != null));
    this.services.markServiceDirectionIcons(results.directionsIcons);
    this.grid.setNextDayThresholds(results.nextDayThresholds.map(x =>
      x == null ? section.height : x));
  }

  /**
   * Called when any edit is made to the timetable section. Redraws the grid,
   * updates the service buttons, and requests the section to be validated if
   * no further changes occur within 500ms.
   * @returns
   */
  private onChanged() {
    // Section changed event came from this.section, so this should never be an
    // issue.
    if (this.section == null) { return; }

    this.grid.draw();
    this.services.setServices(this.section.map(s => s.nextDay));

    if (this._validationTimeoutID != null) {
      clearTimeout(this._validationTimeoutID);
      this._validationTimeoutID = null;
    }

    this._validationTimeoutID = setTimeout(() => {
      if (this.section == null) { return; }
      this._validationRequestCallback(this.section);
    }, 500);
  }

  /**
   * Called when a service button is clicked. Selects the column.
   * @param index The x-coordinate of the service.
   */
  private onServiceClicked(index: number) {
    if (this.section == null) { return; }
    this.grid.select(index, 0, index, this.section.height - 1);
  }

  /**
   * Called when a stop button is clicked. Selects the row.
   * @param index The y-coordinate of the stop.
   */
  private onStopClicked(index: number) {
    if (this.section == null || this.section.width == 0) { return; }
    this.grid.select(0, index, this.section.width - 1, index);
  }

  /**
   * Called when a scroll event occurs. Scrolls the editor sideways, rather than
   * vertically.
   * @param e The scroll event.
   */
  private onScrollWheel(e: Event) {
    e = window.event || e;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const wheelEvent = e as any;

    const delta = clamp(wheelEvent.wheelDelta || -wheelEvent.detail, -1, 1);
    this._editorDiv.scrollLeft -= delta * 64;
    e.preventDefault();
  };

  /**
   * Returns the size of the entire editor grid. Used to calculate the space
   * available to the editor grid.
   */
  clientSize() {
    return this._editorDiv.getBoundingClientRect();
  }

  /**
   * Returns the scroll coordinates (in px) of the editor.
   */
  scrollPos() {
    return { x: this._editorDiv.scrollLeft, y: this._editorDiv.scrollTop };
  }

  /**
   * Scrolls as far to the right as possible. Used when new content is pasted.
   */
  scrollToEnd() {
    const maxWidth = (this.section?.width ?? 0) * editorColSize;
    this._editorDiv.scrollLeft = maxWidth;
  }

  /**
   * Force the editor to make sure it isn't scrolled too far to the right.
   * Avoids a visual glitch when deleting a lot of services.
   */
  refreshScroll() {
    const maxWidth = (this.section?.width ?? 0) * editorColSize;
    this._editorDiv.scrollLeft = Math.min(this._editorDiv.scrollLeft, maxWidth);
  }
}
