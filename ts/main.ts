import { Editor } from "./editor";
import { Network } from "./network";
import { NewTimetableDialog } from "./new-timetable-dialog";

let timetable: string = null;

// Initialize the editor.
const editor = new Editor("editor", "grid", "grid-canvas", "stops", "services");
editor.init();
window.addEventListener("resize", () => editor.windowResized());

// Intialize the new timetable dialog.
const newTimetableDialog = new NewTimetableDialog("new-timetable-dialog",
  dialogSubmitted);

// Begin downloading the network information from the API.
const network = new Network();
network.load().then(() => {
  // When download is finished, initialize the new timetable dialog and show
  // the welcome screen.
  newTimetableDialog.init(network);
  showWelcome();
});

// Wire up the new timetable button to show the dialog when clicked. The new
// timetable button is disabled until the network is loaded.
const newTimetableButton: HTMLButtonElement =
  document.querySelector("#new-timetable-button")
const importButton: HTMLButtonElement =
  document.querySelector("#import-button");
const exportButton: HTMLButtonElement =
  document.querySelector("#export-button");

const status = document.querySelector("#status");
const statusLoading = document.querySelector("#status-loading");
const statusReady = document.querySelector("#status-ready");

newTimetableButton.addEventListener("click", () => {
  const result = timetable == null || confirm("Create a new timetable? " +
    "The existing one won't be saved anywhere.");

  if (result) {
    newTimetableDialog.show();
  }
});

function showWelcome() {
  // Clear the editor and hide the loading screen.
  editor.content = [];
  statusLoading.classList.add("gone");

  // Hide loading screen and enable header buttons for new timetable and import.
  status.classList.remove("gone");
  statusReady.classList.remove("gone");
  newTimetableButton.disabled = false;
  importButton.disabled = false;

  // Do not ask the user before leaving.
  window.onbeforeunload = null;
}
function dialogSubmitted(lineID: number, days: string, timetableID: string) {
  timetable = "Something!";
  showEditor();
  // throw new Error("Not implemented yet!");
}

function showEditor() {
  // Todo: Hide the welcome/loading screens, populate the sections in the
  // header. Maybe even enable the "export" button?
  statusLoading.classList.add("gone");
  statusReady.classList.add("gone");
  status.classList.add("gone");
  newTimetableButton.disabled = false;
  importButton.disabled = false;
  exportButton.disabled = true;

  const content: string[][] = [];
  for (let x = 0; x < 50; x++) {
    content[x] = [];
    for (let y = 0; y < 30; y++) {
      content[x][y] = "00:00";
    }
  }
  editor.content = content;

  // Ask the user before leaving.
  window.onbeforeunload = function () {
    return true;
  };
}
