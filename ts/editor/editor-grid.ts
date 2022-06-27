import { css } from "./editor-grid-css";
import { Editor } from "./editor";

export const ROW_SIZE = 20;
export const COL_SIZE = 48;
const TEXT_OFFSET_Y = 14;

export class EditorGrid {
  private _editor: Editor;
  private _grid: HTMLDivElement;
  private _canvas: HTMLCanvasElement;
  private _context: CanvasRenderingContext2D;

  private _mouseOver: { x: number, y: number } | null;
  private _selected: { startX: number, startY: number, endX: number, endY: number } | null;
  private _dragging: boolean;

  private _nextDayThresholds: number[];

  constructor(editor: Editor, gridID: string, canvasID: string) {
    this._editor = editor;
    this._grid = document.getElementById(gridID) as HTMLDivElement;
    this._canvas = document.getElementById(canvasID) as HTMLCanvasElement;
    this._context = this._canvas.getContext("2d");
    this.resetEvents();
  }

  resetEvents() {
    this._selected = null;
    this._dragging = false;
    this.resetMouseOver();
  }

  resetMouseOver() {
    this._mouseOver = null;
  }

  init() {
    this._canvas.addEventListener("mousedown", (e) => {
      const m = this.relativeCoords(e);
      this._selected = { startX: m.x, startY: m.y, endX: m.x, endY: m.y };
      this._dragging = true;
      this.draw();
    });
    this._canvas.addEventListener("mouseup", (e) => {
      const m = this.relativeCoords(e);
      this._selected.endX = m.x;
      this._selected.endY = m.y;
      this._dragging = false;
      this.draw();
    });

    this._canvas.addEventListener("mousemove", (e) => this.onMouseMove(e));
    this._canvas.addEventListener("mouseenter", (e) => this.onMouseMove(e));
    this._canvas.addEventListener("mouseleave", () => {
      this._mouseOver = null;
      this.draw();
    });
  }

  draw() {
    const section = this._editor.section;
    const cols = section?.width ?? 0;
    const rows = section?.height ?? 0;

    const dpiRatio = this.calculateDpiRatio();
    const cells = this.getOnScreenCells(rows, cols);

    // Set the container holding the canvas to the full size (makes the
    // scrollbar work properly)
    this._grid.style.width = COL_SIZE * cols + "px";
    this._grid.style.height = ROW_SIZE * rows + "px";

    // Make the canvas big enough to fit only the cells actually on screen
    // Shift the canvas within it's parent so when it's scrolled, it still
    // appears on screen despite its smaller size
    this._canvas.width = COL_SIZE * cells.width * dpiRatio;
    this._canvas.height = ROW_SIZE * cells.height * dpiRatio;
    this._canvas.style.width = COL_SIZE * cells.width + "px";
    this._canvas.style.height = ROW_SIZE * cells.height + "px";
    this._canvas.style.left = COL_SIZE * cells.x1 + "px";
    this._canvas.style.top = ROW_SIZE * cells.y1 + "px";

    // Clear the canvas, and transform the coordinate space to account for the
    // scrolling
    this._context.clearRect(0, 0, this._canvas.width, this._canvas.height);
    this._context.translate(
      -cells.x1 * COL_SIZE * dpiRatio,
      -cells.y1 * ROW_SIZE * dpiRatio
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
        cells.x1 * COL_SIZE,
        y * ROW_SIZE,
        cells.width * COL_SIZE,
        ROW_SIZE
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
          x * COL_SIZE + (COL_SIZE - textWidth) / 2,
          y * ROW_SIZE + TEXT_OFFSET_Y
        );
      }
    }

    // Render a highlight on the cell that the mouse is over
    this._context.fillStyle = css.hoverHighlight;
    if (this._mouseOver != null) {
      this._context.fillRect(
        this._mouseOver.x * COL_SIZE,
        this._mouseOver.y * ROW_SIZE,
        COL_SIZE,
        ROW_SIZE
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
        x1 * COL_SIZE,
        y1 * ROW_SIZE,
        w * COL_SIZE,
        h * ROW_SIZE
      );
    }
  }

  relativeCoords(e: MouseEvent) {
    const bounds = this._grid.getBoundingClientRect();
    const x = e.clientX - bounds.left;
    const y = e.clientY - bounds.top;
    return {
      x: Math.floor(x / COL_SIZE),
      y: Math.floor(y / ROW_SIZE),
    };
  };

  onMouseMove(e: MouseEvent) {
    this._mouseOver = this.relativeCoords(e);
    if (this._dragging) {
      if (e.buttons != 1) {
        this._dragging = false;
      }
      else {
        this._selected.endX = this._mouseOver.x;
        this._selected.endY = this._mouseOver.y;
      }
    }
    this.draw();
  };

  calculateDpiRatio() {
    const dpr = window.devicePixelRatio || 1;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const bsr = (this._context as any).backingStorePixelRatio || 1;
    return dpr / bsr;
  };

  getOnScreenCells(rows: number, cols: number) {
    const editorSize = this._editor.clientSize();
    const editorScroll = this._editor.scrollPos();
    const gridWidth = editorSize.width - this._editor.stops.clientWidth();
    const gridHeight = editorSize.height - this._editor.services.clientHeight();

    const y1 = Math.max(0, Math.floor(editorScroll.y / ROW_SIZE));
    const y2 = Math.min(rows, y1 + Math.ceil(gridHeight / ROW_SIZE) + 1);
    const height = y2 - y1;
    const x1 = Math.max(0, Math.floor(editorScroll.x / COL_SIZE));
    const x2 = Math.min(cols, x1 + Math.ceil(gridWidth / COL_SIZE) + 1);
    const width = x2 - x1;
    return { x1: x1, x2: x2, y1: y1, y2: y2, width: width, height: height };
  };

  get selected() {
    if (this._selected == null) {
      return null;
    }
    return { ...this._selected };
  }
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
  select(startX: number, startY: number, endX?: number, endY?: number) {
    this._selected = {
      startX: startX,
      startY: startY,
      endX: endX ?? startX,
      endY: endY ?? startY
    };
    this.draw();
  }
  clearSelection() {
    this._selected = null;
    this.draw();
  }

  setNextDayThresholds(val: number[]) {
    this._nextDayThresholds = val;
    this.draw();
  }
}
