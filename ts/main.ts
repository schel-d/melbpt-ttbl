import { Editor } from "./editor";
import { Network } from "./network";
import { setup as setupNewTimetableDialog, /*show as showNewTimetableDialog*/ } from "./new-timetable-dialog";

// Todo: Fix bug causing layout before CSS is loaded, especially apparent when
// using throttled connections without caching in DevTools.

const editor = new Editor("editor", "grid", "grid-canvas", "stops", "services");
editor.init();
window.addEventListener("resize", () => editor.windowResized());

const network = new Network();
network.load().then(() => {
  showWelcome();
});

setupNewTimetableDialog();

document.querySelector("#new-timetable-button").addEventListener("click", () => {
  alert("Coming soon!");
  // showNewTimetableDialog(network);
});
document.querySelector("#import-button").addEventListener("click", () => {
  alert("Coming soon!");
});

function showWelcome() {
  // Clear the editor and hide the loading screen.
  editor.content = [];
  document.querySelector("#status-loading").classList.add("gone");

  // Hide loading screen and enable header buttons for new timetable and import.
  document.querySelector("#status").classList.remove("gone");
  document.querySelector("#status-ready").classList.remove("gone");
  (document.querySelector("#new-timetable-button") as HTMLButtonElement).disabled = false;
  (document.querySelector("#import-button") as HTMLButtonElement).disabled = false;
}
function showEditor() {
  // Todo: Hide the welcome/loading screens, populate the sections in the
  // header. Maybe even enable the "export" button?
  document.querySelector("#status-loading").classList.add("gone");
  document.querySelector("#status-ready").classList.add("gone");
  document.querySelector("#status").classList.add("gone");
  (document.querySelector("#new-timetable-button") as HTMLButtonElement).disabled = false;
  (document.querySelector("#import-button") as HTMLButtonElement).disabled = false;
  (document.querySelector("#export-button") as HTMLButtonElement).disabled = false;

  const content: string[][] = [];
  for (let x = 0; x < 50; x++) {
    content[x] = [];
    for (let y = 0; y < 30; y++) {
      content[x][y] = "00:00";
    }
  }
  editor.content = content;
}
