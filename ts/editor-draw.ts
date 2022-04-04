import { Editor } from "./editor";
import { css } from "./css";
import $ from "jquery";

export const ROW_SIZE = 20;
export const COL_SIZE = 48;
const TEXT_OFFSET_X = 7;
const TEXT_OFFSET_Y = 14;

export function editorDraw(editor: Editor) {
  const canvas = editor.html.canvas;
  const context = editor.html.context;
  const content = editor.content;

  const cols = content.length;
  const rows = content[0].length;
  if (content.some((c) => c.length !== rows)) {
    throw "Grid is jagged (some columns have more rows than others)";
  }

  const dpiRatio = calculateDpiRatio(context);
  const cells = getOnScreenCells(editor, rows, cols);

  // Set the container holding the canvas to the full size (makes the scrollbar
  // work properly)
  $(editor.html.grid).css("width", COL_SIZE * cols + "px");
  $(editor.html.grid).css("height", ROW_SIZE * rows + "px");

  // Make the canvas big enough to fit only the cells actually on screen
  // Shift the canvas within it's parent so when it's scrolled, it still appears
  // on screen despite its smaller size
  canvas.width = COL_SIZE * cells.width * dpiRatio;
  canvas.height = ROW_SIZE * cells.height * dpiRatio;
  canvas.style.width = COL_SIZE * cells.width + "px";
  canvas.style.height = ROW_SIZE * cells.height + "px";
  canvas.style.left = COL_SIZE * cells.x1 + "px";
  canvas.style.top = ROW_SIZE * cells.y1 + "px";

  // Clear the canvas, and transform the coordinate space to account for the
  // scrolling
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.translate(
    -cells.x1 * COL_SIZE * dpiRatio,
    -cells.y1 * ROW_SIZE * dpiRatio
  );
  context.scale(dpiRatio, dpiRatio);

  // Render a lighter background for every second row
  context.fillStyle = css.level1;
  for (let y = cells.y1; y < cells.y2; y++) {
    if (y % 2 != 0) {
      continue;
    }
    context.fillRect(
      cells.x1 * COL_SIZE,
      y * ROW_SIZE,
      cells.width * COL_SIZE,
      ROW_SIZE
    );
  }

  // Render the text for each cell
  context.font = "0.7rem 'Roboto Mono', monospace";
  context.fillStyle = css.text;
  for (let x = cells.x1; x < cells.x2; x++) {
    for (let y = cells.y1; y < cells.y2; y++) {
      const str = content[x][y];
      context.fillText(
        str,
        x * COL_SIZE + TEXT_OFFSET_X,
        y * ROW_SIZE + TEXT_OFFSET_Y
      );
    }
  }

  // Render a highlight on the cell that the mouse is over
  context.fillStyle = css.hoverHighlight;
  const mouseOver = editor.events.mouseOver;
  if (mouseOver != null) {
    context.fillRect(
      mouseOver.x * COL_SIZE,
      mouseOver.y * ROW_SIZE,
      COL_SIZE,
      ROW_SIZE
    );
  }

  // Render a border on the cell that is selected
  context.lineWidth = Math.round(1.5 * dpiRatio) / dpiRatio;
  context.strokeStyle = css.accent;
  const selected = editor.events.selected;
  if (selected != null) {
    const x1 = Math.min(selected.startX, selected.endX);
    const w = Math.max(selected.startX, selected.endX) - x1 + 1;
    const y1 = Math.min(selected.startY, selected.endY);
    const h = Math.max(selected.startY, selected.endY) - y1 + 1;
    context.strokeRect(
      x1 * COL_SIZE,
      y1 * ROW_SIZE,
      w * COL_SIZE,
      h * ROW_SIZE
    );
  }
};

function getOnScreenCells(editor: Editor, rows: number, cols: number) {
  const editorSize = editor.html.editor.getBoundingClientRect();
  const gridScreenX = editor.html.stops.getBoundingClientRect().width;
  const gridScreenY = editor.html.services.getBoundingClientRect().height;
  const gridWidth = editorSize.width - gridScreenX;
  const gridHeight = editorSize.height - gridScreenY;

  const editorJQuery = $(editor.html.editor);
  const scrollX = editorJQuery.scrollLeft();
  const scrollY = editorJQuery.scrollTop();

  const startRow = Math.max(0, Math.floor(scrollY / ROW_SIZE));
  const endRow = Math.min(rows, startRow + Math.ceil(gridHeight / ROW_SIZE) + 1);
  const rowsHigh = endRow - startRow;
  const startCol = Math.max(0, Math.floor(scrollX / COL_SIZE));
  const endCol = Math.min(cols, startCol + Math.ceil(gridWidth / COL_SIZE) + 1);
  const colsWide = endCol - startCol;

  return {
    x1: startCol,
    x2: endCol,
    y1: startRow,
    y2: endRow,
    width: colsWide,
    height: rowsHigh,
  };
};

function calculateDpiRatio(gridCanvas2d: CanvasRenderingContext2D) {
  const dpr = window.devicePixelRatio || 1;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bsr = (gridCanvas2d as any).backingStorePixelRatio || 1;

  return dpr / bsr;
};
