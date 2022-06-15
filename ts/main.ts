import { DOWPresets } from "./dow";
import { Editor } from "./editor";
import { Header } from "./header";
import { Network } from "./network";
import { NewTimetableDialog } from "./new-timetable-dialog";
import { StatusScreens } from "./status-screens";
import { Timetable } from "./timetable";

let timetable: Timetable = null;

// Initialize the editor.
const editor = new Editor("editor", "grid", "grid-canvas", "stops", "services");
editor.init();
window.addEventListener("resize", () => editor.windowResized());

// Initialize the new timetable dialog.
const newTimetableDialog = new NewTimetableDialog("new-timetable-dialog",
  dialogSubmitted);

// Initialize the header and status screens, and ensuring the loading screen is
// displaying correctly (should be default in markup anyway - that way it shows
// before the script is loaded too).
const header = new Header("new-timetable-button", "import-button", "export-button");
const status = new StatusScreens("status", editor, header);
status.loading();

// Begin downloading the network information from the API.
const network = new Network();
network.load().then(() => {
  // When download is finished, initialize the new timetable dialog and show
  // the welcome screen.
  newTimetableDialog.init(network);
  status.ready();
});

// Wire up the new timetable button to show the dialog when clicked. The new
// timetable button is disabled until the network is loaded.
header.newTimetableButton.addEventListener("click", () => {
  const result = timetable == null ||
    confirm("Create a new timetable? This one won't be saved anywhere.");

  if (result) {
    newTimetableDialog.show();
  }
});

function dialogSubmitted(lineID: number, dowPresetIndex: number,
  timetableID: string) {

  // Setup the new timetable object.
  const timetableIDNum = parseInt(timetableID, 36);
  const daysArray = DOWPresets[dowPresetIndex];
  timetable = new Timetable(timetableIDNum, lineID, daysArray, network);

  status.editing();

  const content: string[][] = [];
  for (let x = 0; x < 10; x++) {
    content[x] = [];
    for (let y = 0; y < 30; y++) {
      content[x][y] = "00:00";
    }
  }
  editor.content = content;

  // throw new Error("Not implemented yet!");
}
