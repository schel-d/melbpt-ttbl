import { css } from "./editor-grid-css";
import { Editor } from "./editor";
import { getCanvas, getDiv } from "../dom-utils";
import { HtmlIDs } from "../main";

/**
 * The height of a row in the editor, in px.
 */
export const editorRowSize = 20;

/**
 * The width of a column in the editor, in px.
 */
export const editorColSize = 48;

/**
 * The offset applied to center the text in the cell.
 * Todo: just calculate this at runtime using font metrics too?
 */
const textOffsetY = 14;

/**
 * (x, y) coordinates for a cell.
 */
type CellCoordinates = {
  x: number,
  y: number
};

/**
 * Rectangular coordication for a selection. Note that startX is not necessarily
 * lower than or equal to endX, and likewise for the y-coordinates.
 */
type SelectionCoordinates = {
  startX: number,
  startY: number,
  endX: number,
  endY: number
};

/**
 * Manages the editor grid, including the canvas where the timetable is drawn
 * to.
 */
export class EditorGrid {
  private _editor: Editor;
  private _grid: HTMLDivElement;
  private _canvas: HTMLCanvasElement;
  private _context: CanvasRenderingContext2D;

  private _mouseOver: CellCoordinates | null;
  private _selected: SelectionCoordinates | null;
  private _dragging: boolean;

  private _nextDayThresholds: number[];

  constructor(editor: Editor) {
    this._editor = editor;
    this._grid = getDiv(HtmlIDs.editorGrid);
    this._canvas = getCanvas(HtmlIDs.editorGridCanvas);

    const canvasContext = this._canvas.getContext("2d");
    if (canvasContext == null) {
      throw new Error("This browser doesn't seem to support 2d canvas.");
    }
    this._context = canvasContext;

    this._selected = null;
    this._dragging = false;
    this._mouseOver = null;
    this._nextDayThresholds = [];

    this._canvas.addEventListener("mousedown", (e) => {
      const m = this.relativeCoords(e);
      this._selected = { startX: m.x, startY: m.y, endX: m.x, endY: m.y };
      this._dragging = true;
      this.draw();
    });
    this._canvas.addEventListener("mouseup", (e) => {
      this._dragging = false;

      // Selected should never be null here, but just in case.
      if (this._selected != null) {
        const m = this.relativeCoords(e);
        this._selected.endX = m.x;
        this._selected.endY = m.y;
      }

      this.draw();
    });

    this._canvas.addEventListener("mousemove", (e) => this.onMouseMove(e));
    this._canvas.addEventListener("mouseenter", (e) => this.onMouseMove(e));
    this._canvas.addEventListener("mouseleave", () => {
      this._mouseOver = null;
      this.draw();
    });
  }

  /**
   * Clears the selection and mouse over highlight.
   */
  resetEvents() {
    this._selected = null;
    this._dragging = false;
    this.resetMouseOver();
  }

  /**
   * Clears the mouse over highlight. This exists separately to
   * {@link resetEvents} as sometimes clearing the mouse over is warranted
   * without also clearing the selection.
   */
  resetMouseOver() {
    this._mouseOver = null;
  }

  /**
   * Draws the timetable, the selection, and the mouse over highlight. Must be
   * called any time a change is made to any of those three, or the canvas is
   * scrolled.
   */
  draw() {
    const section = this._editor.section;
    const cols = section?.width ?? 0;
    const rows = section?.height ?? 0;

    const dpiRatio = this.calculateDpiRatio();
    const cells = this.getOnScreenCells(rows, cols);

    // Set the container holding the canvas to the full size (makes the
    // scrollbar work properly)
    this._grid.style.width = editorColSize * cols + "px";
    this._grid.style.height = editorRowSize * rows + "px";

    // Make the canvas big enough to fit only the cells actually on screen
    // Shift the canvas within it's parent so when it's scrolled, it still
    // appears on screen despite its smaller size
    this._canvas.width = editorColSize * cells.width * dpiRatio;
    this._canvas.height = editorRowSize * cells.height * dpiRatio;
    this._canvas.style.width = editorColSize * cells.width + "px";
    this._canvas.style.height = editorRowSize * cells.height + "px";
    this._canvas.style.left = editorColSize * cells.x1 + "px";
    this._canvas.style.top = editorRowSize * cells.y1 + "px";

    // Clear the canvas, and transform the coordinate space to account for the
    // scrolling
    this._context.clearRect(0, 0, this._canvas.width, this._canvas.height);
    this._context.translate(
      -cells.x1 * editorColSize * dpiRatio,
      -cells.y1 * editorRowSize * dpiRatio
    );
    this._context.scale(dpiRatio, dpiRatio);

    if (section == null) { return; }

    // Render a lighter background for every second row
    this._context.fillStyle = css.paper10;
    for (let y = cells.y1; y < cells.y2; y++) {
      if (y % 2 != 0) {
        continue;
      }
      this._context.fillRect(
        cells.x1 * editorColSize,
        y * editorRowSize,
        cells.width * editorColSize,
        editorRowSize
      );
    }

    // Render the text for each cell
    this._context.font = "0.7rem 'Roboto Mono', monospace";
    for (let x = cells.x1; x < cells.x2; x++) {
      const nextDay = this._nextDayThresholds[x] ?? section.height;

      for (let y = cells.y1; y < cells.y2; y++) {
        this._context.fillStyle = y < nextDay ? css.text : css.accent;
        const str = section.cell(x, y);
        const textWidth = this._context.measureText(str).width;
        this._context.fillText(
          str,
          x * editorColSize + (editorColSize - textWidth) / 2,
          y * editorRowSize + textOffsetY
        );
      }
    }

    // Render a highlight on the cell that the mouse is over
    this._context.fillStyle = css.hoverHighlight;
    if (this._mouseOver != null) {
      this._context.fillRect(
        this._mouseOver.x * editorColSize,
        this._mouseOver.y * editorRowSize,
        editorColSize,
        editorRowSize
      );
    }

    // Render a border on the cell that is selected
    this._context.lineWidth = Math.round(1.5 * dpiRatio) / dpiRatio;
    this._context.strokeStyle = css.accent;
    if (this._selected != null) {
      const x1 = Math.min(this._selected.startX, this._selected.endX);
      const w = Math.max(this._selected.startX, this._selected.endX) - x1 + 1;
      const y1 = Math.min(this._selected.startY, this._selected.endY);
      const h = Math.max(this._selected.startY, this._selected.endY) - y1 + 1;
      this._context.strokeRect(
        x1 * editorColSize,
        y1 * editorRowSize,
        w * editorColSize,
        h * editorRowSize
      );
    }
  }

  /**
   * Returns the coordinates of the cell this mouse event occurred in.
   * @param e The mouse event.
   */
  relativeCoords(e: MouseEvent): CellCoordinates {
    const bounds = this._grid.getBoundingClientRect();
    const x = e.clientX - bounds.left;
    const y = e.clientY - bounds.top;
    return {
      x: Math.floor(x / editorColSize),
      y: Math.floor(y / editorRowSize),
    };
  };

  /**
   * Called when a mouse move event occurs. Handles dragging and the mouse over
   * highlight.
   * @param e The event.
   */
  private onMouseMove(e: MouseEvent) {
    this._mouseOver = this.relativeCoords(e);
    if (this._dragging) {
      if (e.buttons != 1) {
        this._dragging = false;
      }
      else if (this._selected != null) {
        this._selected.endX = this._mouseOver.x;
        this._selected.endY = this._mouseOver.y;
      }
    }
    this.draw();
  };

  /**
   * Uses `devicePixelRatio` and `backingStorePixelRatio` to scale the timetable
   * appropriately for high DPI displays.
   * @returns
   */
  private calculateDpiRatio() {
    const dpr = window.devicePixelRatio || 1;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const bsr = (this._context as any).backingStorePixelRatio || 1;
    return dpr / bsr;
  };

  /**
   * Returns the coordinates of the cells that are on screen, given the size
   * of the timetable section.
   * @param rows The number of rows in the timetable section.
   * @param cols The number of columns in the timetable section.
   */
  private getOnScreenCells(rows: number, cols: number) {
    const editorSize = this._editor.clientSize();
    const editorScroll = this._editor.scrollPos();
    const gridWidth = editorSize.width - this._editor.stops.clientWidth();
    const gridHeight = editorSize.height - this._editor.services.clientHeight();

    const y1 = Math.max(0, Math.floor(editorScroll.y / editorRowSize));
    const y2 = Math.min(rows, y1 + Math.ceil(gridHeight / editorRowSize) + 1);
    const height = y2 - y1;
    const x1 = Math.max(0, Math.floor(editorScroll.x / editorColSize));
    const x2 = Math.min(cols, x1 + Math.ceil(gridWidth / editorColSize) + 1);
    const width = x2 - x1;
    return { x1: x1, x2: x2, y1: y1, y2: y2, width: width, height: height };
  };

  /**
   * Returns the coordinates of the selection, or null if nothing is selected.
   */
  get selected(): SelectionCoordinates | null {
    if (this._selected == null) {
      return null;
    }
    return { ...this._selected };
  }

  /**
   * Returns the coordinates of the selection, using (x1, y1, x2, y2) notation,
   * or null if nothing is selected. In these results `x1 <= x2` and `y1 <= y2`.
   */
  get selectedRange() {
    if (this._selected == null) {
      return null;
    }
    return {
      x1: Math.min(this._selected.startX, this._selected.endX),
      y1: Math.min(this._selected.startY, this._selected.endY),
      x2: Math.max(this._selected.startX, this._selected.endX),
      y2: Math.max(this._selected.startY, this._selected.endY)
    };
  }

  /**
   * Selects a certain area in the timetable section.
   * @param startX The start x-coordinate.
   * @param startY The start y-coordinate.
   * @param endX The end x-coordinate (for multi-cell selection).
   * @param endY The end y-coordinate (for multi-cell selection).
   */
  select(startX: number, startY: number, endX?: number, endY?: number) {
    this._selected = {
      startX: startX,
      startY: startY,
      endX: endX ?? startX,
      endY: endY ?? startY
    };
    this.draw();
  }

  /**
   * Clears the selection.
   */
  clearSelection() {
    this._selected = null;
    this.draw();
  }

  /**
   * Upon timetable validation, the next day thresholds can be provided to show
   * a blue tint on the times that cross into the next day.
   * @param val The array of next day threshold values.
   */
  setNextDayThresholds(val: number[]) {
    this._nextDayThresholds = val;
    this.draw();
  }
}
