import { clamp } from "../utils";
import { Editor } from "./editor";

export function handleArrowKeys(editor: Editor, xOffset: number, yOffset: number,
  ctrl: boolean, shift: boolean) {

  if (editor.grid.selected == null || editor.section.width == 0) {
    return;
  }
  let { startX, startY, endX, endY } = editor.grid.selected;
  if (shift) {
    if (ctrl) {
      if (xOffset > 0) { endX = editor.section.width - 1; }
      if (xOffset < 0) { endX = 0; }
      if (yOffset > 0) { endY = editor.section.height - 1; }
      if (yOffset < 0) { endY = 0; }
    }
    else {
      endX = clamp(endX + xOffset, 0, editor.section.width - 1);
      endY = clamp(endY + yOffset, 0, editor.section.height - 1);
    }
  }
  else {
    if (ctrl) {
      if (xOffset > 0) { startX = editor.section.width - 1; }
      if (xOffset < 0) { startX = 0; }
      if (yOffset > 0) { startY = editor.section.height - 1; }
      if (yOffset < 0) { startY = 0; }
    }
    else {
      startX = clamp(startX + xOffset, 0, editor.section.width - 1);
      startY = clamp(startY + yOffset, 0, editor.section.height - 1);
    }
    endX = startX;
    endY = startY;
  }
  editor.grid.select(startX, startY, endX, endY);
}
