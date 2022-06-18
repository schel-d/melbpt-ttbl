import { DOWPresets } from "./dow";
import { Editor } from "./editor/editor";
import { Header } from "./header";
import { Network } from "./network";
import { NewTimetableDialog } from "./new-timetable-dialog";
import { StatusScreens } from "./status-screens";
import { extractContent } from "./extract-content";
import { Timetable, TimetableSection } from "./timetable";
import { PasteIssuesDialog } from "./paste-issues-dialog";
import { createToast } from "./toast";

let timetable: Timetable | null = null;
let timetableSection: TimetableSection | null = null;

// Initialize the editor.
const editor = new Editor("editor", "grid", "grid-canvas", "stops", "services");
editor.init();
window.addEventListener("resize", () => editor.resize());
document.addEventListener("paste", (e) => {
  if (timetableSection != null) {
    onPaste(e.clipboardData.getData("text"));
    e.preventDefault();
  }
});

// Initialize the header and status screens, and ensuring the loading screen is
// displaying correctly (should be default in markup anyway - that way it shows
// before the script is loaded too).
const header = new Header("new-timetable-button", "import-button",
  "export-button", "tabs", tabClicked);
const status = new StatusScreens("status", editor, header);
status.loading();

// Initialize the new timetable dialog.
const newTimetableDialog = new NewTimetableDialog("new-timetable-dialog",
  newTimetableDialogSubmitted);

// Initialize the paste issues dialog.
const pasteIssuesDialog = new PasteIssuesDialog("paste-issues-dialog");
pasteIssuesDialog.init();

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
  const result = timetable == null || !timetable.hasContent() ||
    confirm("Create a new timetable? This one won't be saved anywhere.");

  if (result) {
    newTimetableDialog.show();
  }
});

function newTimetableDialogSubmitted(lineID: number, dowPresetIndex: number,
  timetableID: string) {

  // Setup the new timetable object.
  const timetableIDNum = parseInt(timetableID, 36);
  const dows = DOWPresets[dowPresetIndex];
  timetable = new Timetable(timetableIDNum, lineID, dows, network);

  // Update the header buttons and create the tabs for the timetable sections.
  status.editing(timetable);
  timetableSection = timetable.getTimetableSection(timetable.generalDirs[0],
    timetable.dows[0]);
  status.editingSection(timetableSection, true, network);
}

function tabClicked(generalDir: string, dow: string) {
  timetableSection = timetable.getTimetableSection(generalDir, dow);
  status.editingSection(timetableSection, false, network);
}

function onPaste(text: string) {
  // Try to extract timetable content from the pasted text based on the stop
  // names in this timetable.
  const stopNames = timetableSection.stops.map(s => network.stopName(s));
  extractContent(text, stopNames, pasteIssuesDialog, (newContent, missing) => {
    const numOfStopsFound = stopNames.length - missing.length;
    if (numOfStopsFound <= 1) {
      // If there was basically no usable timetable content in what was pasted,
      // mostly ignore it.
      createToast(`That didn't seem like timetable content.`);
      return;
    }

    // Otherwise add it to the editor.
    editor.paste(newContent);

    // Display a toast if any stops were not present. This kind of thing may
    // happen often, especially in V/Line timetables, but informs the user just
    // in case they make a mistake coping the full table.
    if (missing.length > 3) {
      createToast(`${missing.length} stops were missing from pasted content.`);
    }
    else if (missing.length != 0) {
      createToast(`${missing.join(", ")} ${missing.length == 1 ? "was" : "were"} missing from the pasted content.`);
    }
  });
}
