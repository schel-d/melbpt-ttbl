import { Editor } from "./editor";
import { Network } from "./network";
import { setup as setupNewTimetableDialog, show as showNewTimetableDialog } from "./new-timetable-dialog";

const editor = new Editor("editor", "grid", "grid-canvas", "stops", "services");

editor.init();
window.addEventListener("resize", () => editor.windowResized());

const network = new Network();
network.load().then(() => {
  showWelcome();
})

setupNewTimetableDialog();

document.querySelector("#new-timetable-button").addEventListener("click", () => {
  alert("Coming soon!")
  // showNewTimetableDialog(network);
});
document.querySelector("#import-button").addEventListener("click", () => {
  alert("Coming soon!")
  // showNewTimetableDialog(network);
});

function showWelcome() {
  // Clear the editor and hide the loading screen.
  editor.content = [];
  document.querySelector("#status-loading").classList.add("gone");

  // Hide loading screen and enable header buttons for new timetable and import.
  document.querySelector("#status-ready").classList.remove("gone");
  (document.querySelector("#new-timetable-button") as HTMLButtonElement).disabled = false;
  (document.querySelector("#import-button") as HTMLButtonElement).disabled = false;
}
function showEditor() {
  // Todo: Hide the welcome/loading screens, populate the sections in the
  // header. Maybe even enable the "export" button?
}
