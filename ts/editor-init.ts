import { Editor } from "./editor";
import { COL_SIZE, ROW_SIZE } from "./editor-draw";
import $ from "jquery";

export function editorInit(editor: Editor) {
  editor.draw();

  editor.html.canvas.addEventListener("mousedown", (e) => {
    const m = relativeCoords(e, editor);
    editor.events.selected = { startX: m.x, startY: m.y, endX: m.x, endY: m.y };
    editor.events.dragging = true;
    editor.draw();
  });
  editor.html.canvas.addEventListener("mouseup", (e) => {
    const m = relativeCoords(e, editor);
    editor.events.selected.endX = m.x;
    editor.events.selected.endY = m.y;
    editor.events.dragging = false;
    editor.draw();
  });

  editor.html.canvas.addEventListener("mousemove", (e) =>
    canvasMouseMoveEvent(e, editor)
  );
  editor.html.canvas.addEventListener("mouseenter", (e) =>
    canvasMouseMoveEvent(e, editor)
  );
  editor.html.canvas.addEventListener("mouseleave", () => {
    editor.events.mouseOver = null;
    editor.draw();
  });
  $(editor.html.editor).on("scroll", () => {
    editor.events.mouseOver = null;
    editor.draw();
  });

  // Make the scrollwheel cause horizontal scrolling in the editor, not vertical
  // Firefox is 'DOMMouseScroll' and basically everything else is 'mousewheel'
  editor.html.editor.addEventListener(
    "mousewheel",
    (e) => editorScrollEvent(e, editor),
    false
  );
  editor.html.editor.addEventListener(
    "DOMMouseScroll",
    (e) => editorScrollEvent(e, editor),
    false
  );

  document.addEventListener("paste", (e) => {
    const clipboardText = e.clipboardData.getData('text');
    console.log(clipboardText);
    e.preventDefault();
  });
};

function editorScrollEvent(e: Event, editor: Editor) {
  e = window.event || e;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const wheelEvent = e as any;

  const delta = Math.max(-1, Math.min(1, wheelEvent.wheelDelta || -wheelEvent.detail));
  editor.html.editor.scrollLeft -= delta * 64;
  e.preventDefault();
};

function canvasMouseMoveEvent(e: MouseEvent, editor: Editor) {
  editor.events.mouseOver = relativeCoords(e, editor);
  if (editor.events.dragging) {
    if (e.buttons != 1) {
      editor.events.dragging = false;
    } else {
      editor.events.selected.endX = editor.events.mouseOver.x;
      editor.events.selected.endY = editor.events.mouseOver.y;
    }
  }
  editor.draw();
};

function relativeCoords(e: MouseEvent, editor: Editor) {
  const bounds = editor.html.grid.getBoundingClientRect();
  const x = e.clientX - bounds.left;
  const y = e.clientY - bounds.top;
  return {
    x: Math.floor(x / COL_SIZE),
    y: Math.floor(y / ROW_SIZE),
  };
};
