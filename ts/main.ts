import { DOWPresets } from "./dow";
import { Editor } from "./editor";
import { Header } from "./header";
import { Network } from "./network";
import { NewTimetableDialog } from "./new-timetable-dialog";
import { StatusScreens } from "./status-screens";
import { extractContent } from "./extract-content";
import { Timetable, TimetableSection } from "./timetable";
import { PasteIssuesDialog } from "./paste-issues-dialog";

let timetable: Timetable | null = null;
let timetableSection: TimetableSection | null = null;

// Initialize the editor.
const editor = new Editor("editor", "grid", "grid-canvas", "stops", "services");
editor.init();
window.addEventListener("resize", () => editor.windowResized());
document.addEventListener("paste", (e) => {
  onPaste(e.clipboardData.getData("text"));
  e.preventDefault();
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
  // <TEMPORARY>
  newTimetableDialogSubmitted(6, 0, "0");
  onPaste("BAIRNSDALE dep 04.27 06.14 12.54 15.15 18.06 06.14 12.54 16.53 07.34 12.54 16.53\nLindenow Turn Off 04.42 – – 15.30 – – – – – 13.09 –\nStratford 05.07 06.51 13.32 15.55 18.44 06.51 13.32 17.31 08.11 13.34 17.31\nSALE arr 05.27 07.07 13.47 16.15 18.59 07.07 13.47 17.46 08.27 13.54 17.46\nChange Service TRAIN\nSALE dep 05.27 07.08 08.17 09.22 13.48 16.15 19.00 07.08 13.48 15.22 17.47 08.28 14.09 17.47\nSale (1) 05.32 – 08.22 09.27 – 16.20 – – – 15.32 – – – –\nWurruk 05.37 – 08.27 09.32 – 16.25 – – – 15.37 – – – –\nRosedale 05.52 – 08.42 09.47 – 16.40 – – – 15.50 – – – –\nRosedale Station 07.26 – – 14.07 – 19.19 07.26 14.07 – 18.06 08.46 14.27 18.06\nTraralgon Plaza – – 09.12 – – – – – – – – – – –\nTRARALGON arr 06.17 07.44 09.07 10.12 14.25 17.05 19.36 07.44 14.25 16.12 18.23 09.04 14.45 18.23\nChange Service TRAIN TRAIN TRAIN TRAIN TRAIN\nTRARALGON dep 06.32 07.46 09.22 10.27 14.27 17.20 19.38 07.46 14.27 17.25 18.25 09.06 14.47 18.25\nMorwell 06.40 07.56 09.30 10.35 14.35 17.28 19.46 07.56 14.35 17.33 18.33 09.16 14.55 18.33\nMoe 06.49 08.07 09.39 10.44 14.44 17.41 20.01 08.07 14.45 17.43 18.43 09.27 15.05 18.43\nTrafalgar – – 09.45 10.50 14.50 17.48 20.07 – 14.50 17.49 18.49 – 15.10 18.49\nYarragon – – 09.51 10.56 14.56 17.54 20.13 – 14.56 17.55 18.55 – 15.16 18.55\nWarragul 07.04 08.26 10.04 11.04 15.04 18.02 20.21 08.26 15.04 18.03 19.03 09.46 15.24 19.03\nDrouin 07.10 08.33 10.10 11.10 15.10 18.08 20.27 08.33 15.10 18.09 19.09 09.53 15.30 19.09\nLongwarry – – 10.16 11.16 15.16 18.15 20.34 – 15.16 18.16 19.16 – 15.36 19.16\nBunyip – – 10.20 11.20 15.20 18.19 20.38 – 15.20 18.20 19.20 – 15.40 19.20\nGarfield 07.20 08.44 10.23 11.23 15.23 18.22 20.41 08.44 15.23 18.23 19.23 10.04 15.43 19.23\nTynong – – 10.27 11.27 – 18.26 20.45 – 15.27 18.27 19.27 – 15.47 19.27\nNar Nar Goon – – 10.31 11.31 15.29 18.30 20.49 – 15.31 18.31 19.31 – 15.51 19.31\nPakenham 07.33 09.00 10.41 11.41 15.39 18.42 21.01 09.00 15.41 18.41 19.41 10.20 16.01 19.41\nDandenong 07.55d 09.20d 10.59d 11.59d 15.57d 19.00d 21.20d 09.20d 15.59d 18.59d 20.00d 10.40d 16.19d 20.00d\nClayton 08.10d – 11.11d 12.11d 16.09d 19.12d – – 16.11d 19.11d – – 16.31d –\nCaulfield 08.26d 09.46d 11.25d 12.25d 16.24d 19.26d 21.46d 09.40d 16.25d 19.25d 20.25d 11.06d 16.45d 20.25d\nRichmond 08.36d 09.56d 11.35d 12.35d 16.34d 19.35d 21.55d 09.50d 16.35d 19.34d 20.34d 11.16d 16.55d 20.34d\nFlinders Street 08.42d 10.01d 11.41d 12.41d 16.39d 19.40d 22.00d 09.55d 16.41d 19.39d 20.39d 11.21d 17.01d 20.39d\nSOUTHERN CROSS arr 08.47 10.06 11.45 12.45 16.44 19.48 22.05 10.00 16.45 19.44 20.44 11.26 17.05 20.44");
  return;
  // </TEMPORARY>

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
  const stopNames = timetableSection.stops.map(s => network.stopName(s));
  extractContent(text, stopNames, pasteIssuesDialog, (newContent, missing) => {
    // Todo: show toast for missing stops
    console.log(missing);

    editor.addContent(newContent);
  });
}
