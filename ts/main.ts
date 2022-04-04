import { Editor } from "./editor";
import $ from "jquery";

const editor = new Editor("editor", "grid", "grid-canvas", "stops", "services");

const content = [];
for (let x = 0; x < 50; x++) {
  content[x] = [];
  for (let y = 0; y < 31; y++) {
    content[x][y] = `${x.toFixed().padStart(2, "0")}:${y.toFixed().padStart(2, "0")}`;
  }
}

editor.content = content;
editor.init();
$(window).on("resize", () => editor.windowResized());
