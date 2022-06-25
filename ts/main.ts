import { Editor } from "./editor/editor";
import { Header } from "./components/header";
import { Network } from "./data/network";
import { CommandListener } from "./commands/command-listener";
import { StatusScreens } from "./components/status-screens";
import { NewTimetableDialog } from "./components/new-timetable-dialog";
import { PasteIssuesDialog } from "./components/paste-issues-dialog";
import { Timetable } from "./data/timetable";
import { DOWPresets } from "./data/dow";
import { Validator } from "./validator";

export class AppContext {
  network: Network | null;
  timetable: Timetable | null;

  editor: Editor;
  validator: Validator;
  header: Header;
  status: StatusScreens;
  newTimetableDialog: NewTimetableDialog;
  pasteIssuesDialog: PasteIssuesDialog;

  constructor() {
    this.network = null;
    this.timetable = null;

    this.editor = new Editor("editor", "grid", "grid-canvas", "stops",
      "services");

    this.validator = new Validator("validation-worker.js");

    this.header = new Header("new-timetable-button", "import-button",
      "export-button", "tabs", (a, b) => this.tabClicked(a, b));

    this.status = new StatusScreens("status", this.editor, this.header);

    this.newTimetableDialog = new NewTimetableDialog("new-timetable-dialog",
      (a, b, c) => this.newTimetableDialogSubmitted(a, b, c));

    this.pasteIssuesDialog = new PasteIssuesDialog("paste-issues-dialog");
  }
  init(network: Network) {
    this.network = network;

    this.validator.init(this.network);

    this.editor.init();
    this.editor.requestValidation = () => {
      this.validator.requestValidation(this.editor.section);
    }
    window.addEventListener("resize", () => this.editor.resize());

    this.validator.onResults = (results) => {
      const error = results.overallError();
      const footerP = document.querySelector("#footer p");
      if (error == null) {
        footerP.classList.remove("error");
        footerP.textContent = "Valid timetable";
      }
      else {
        footerP.classList.add("error");
        footerP.textContent = error;
      }

      this.editor.applyValidationOverlay(results);
    }

    this.newTimetableDialog.init(this.network);
    this.pasteIssuesDialog.init();

    this.header.newTimetableButton.addEventListener("click", () => {
      const result = this.timetable == null || !this.timetable.hasContent() ||
        confirm("Create a new timetable? This one won't be saved anywhere.");

      if (result) {
        this.newTimetableDialog.show();
      }
    });

    this.status.ready();
  }

  newTimetableDialogSubmitted(lineID: number, dowPresetIndex: number,
    timetableID: string) {

    // Setup the new timetable object.
    const timetableIDNum = parseInt(timetableID, 36);
    const dows = DOWPresets[dowPresetIndex];
    this.timetable = new Timetable(timetableIDNum, lineID, dows, this.network);

    // Update the header buttons and create the tabs for the timetable sections.
    this.status.editing(this.timetable);
    const timetableSection = this.timetable.getTimetableSection(
      this.timetable.generalDirs[0], this.timetable.dows[0]);
    this.status.editingSection(timetableSection, true, this.network);
  }

  tabClicked(generalDir: string, dow: string) {
    const timetableSection = this.timetable.getTimetableSection(generalDir,
      dow);
    this.status.editingSection(timetableSection, false, this.network);
  }
}

const network = new Network();
const appContext = new AppContext();
const commandListener = new CommandListener();

network.load().then(() => {
  appContext.init(network);

  commandListener.init(appContext);
  document.addEventListener("keydown", (e) => commandListener.onDocKeyEvent(e));
  document.addEventListener("paste", (e) => commandListener.onPaste(e));
});
