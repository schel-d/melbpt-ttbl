import { Editor } from "./editor/editor";
import { Header } from "./components/header";
import { Network } from "./data/network";
import { StatusScreens } from "./components/status-screens";
import { NewTimetableDialog } from "./components/new-timetable-dialog";
import { PasteIssuesDialog } from "./components/paste-issues-dialog";
import { Timetable } from "./data/timetable";
import { WDRPresets } from "./data/week-day-range";
import { Validator } from "./validator";
import { exportTimetable } from "./data/export";
import { TimetableSection } from "./data/timetable-section";
import { ValidationResults } from "./data/timetable-validation";
import { getErrorMessage } from "./utils";
import { getParagraph } from "./dom-utils";
import { HtmlIDs } from "./main";

/**
 * Responsible for initializing and managing high-level interactions between the
 * various systems of the webapp, including during the time where no timetable
 * is loaded.
 */
export class AppContext {
  network: Network;
  timetable: Timetable | null;

  status: StatusScreens;

  validator: Validator;
  editor: Editor;
  header: Header;
  newTimetableDialog: NewTimetableDialog;
  pasteIssuesDialog: PasteIssuesDialog;

  /**
   * Creates the object, and initializes the various systems of the webapp.
   * Object should be created once the network is downloaded, ready to await
   * the command to create a new timetable or import one.
   * @param network The network object.
   * @param status The controller for the status screens, currently showing
   * "loading", but about to show "ready".
   */
  constructor(network: Network, status: StatusScreens) {
    this.network = network;
    this.timetable = null;

    this.status = status;

    this.validator = new Validator(network, (a) => this.onValidatorResults(a));
    this.editor = new Editor((a) => this.onValidationRequest(a));
    this.header = new Header(
      () => this.onNewButtonClicked(),
      () => this.onImportButtonClicked(),
      () => this.onExportButtonClicked()
    );
    this.newTimetableDialog = new NewTimetableDialog(network);
    this.pasteIssuesDialog = new PasteIssuesDialog();

    // Hide the loading screen, and enable the new/import buttons.
    this.status.ready();
    this.header.ready();
    this.editor.clear();
  }

  /**
   * Called when the "New Timetable" button is clicked. Shows the new timetable
   * dialog.
   */
  private onNewButtonClicked() {
    const result = this.timetable == null || !this.timetable.hasContent() ||
      confirm("Create a new timetable? This one won't be saved anywhere.");

    if (result) {
      this.newTimetableDialog.show((a, b, c) => this.onNTDSubmitted(a, b, c));
    }
  }

  /**
   * Called when the "Import" button is clicked. Initiates the import process,
   * and once a timetable is parsed, sets the UI ready to edit.
   */
  private onImportButtonClicked() {
    alert("Importing timetables is not implemented yet.");

    // openImportDialog(this.network, (timetable) => {
    //   this.editTimetable(timetable);
    // });
  }

  /**
   * Called when the "Export" button is clicked. Triggers the browser to
   * download a .ttbl file with the contents of the current timetable object
   * unless there is a validation error, in which case an alert is shown.
   */
  private onExportButtonClicked() {
    try {
      // The export button should never be enabled when the timetable is null.
      if (this.timetable == null) {
        throw new Error("Timetable is null, nothing to export.");
      }

      exportTimetable(this.timetable, this.network);
    }
    catch (ex) {
      alert(`Error: ${getErrorMessage(ex)}`);
    }
  }

  /**
   * Called when the new timetable dialog is submitted. Creates a new timetable
   * with the selected options, and sets the UI ready to edit.
   * @param lineID The line chosen in the dialog.
   * @param wdrPresetIndex The week day range present chosen in the dialog.
   * @param timetableID The timetable ID chosen in the dialog.
   */
  private onNTDSubmitted(lineID: number, wdrPresetIndex: number, timetableID: string) {
    const timetableIDNum = parseInt(timetableID, 36);
    const wdrs = WDRPresets[wdrPresetIndex];

    const timetable = new Timetable(timetableIDNum, lineID, wdrs, this.network);
    this.editTimetable(timetable);
  }

  /**
   * Hides the ready status screen, creates the section tabs in the header, and
   * loads the first section into the editor. Should be called for a new
   * timetable or an imported one.
   * @param timetable The timetable to begin editing.
   */
  private editTimetable(timetable: Timetable) {
    this.timetable = timetable;

    // Update the header buttons and create the tabs for the timetable sections.
    const tabCallback = (generalDir: string, wdr: string) => {
      const section = timetable.getTimetableSection(generalDir, wdr);
      this.editor.setSection(section, this.network);
    }
    this.header.editing(timetable.generalDirs, timetable.wdrs, tabCallback);
    this.status.editing();

    // Start editing the timetable, opening the first section by default.
    const section = timetable.getFirstSection();
    this.editor.setSection(section, this.network);
    this.header.selectTab(section.generalDir, section.wdr);
  }

  /**
   * Called when the editor decides it wants to revalidate the current timetable
   * section. Passes the timetable to the validation worker.
   * @param section The timetable section to validate.
   */
  private onValidationRequest(section: TimetableSection) {
    if (this.timetable == null) { return; }
    this.validator.requestValidation(section, this.timetable.lineID);
  }

  /**
   * Called when the validation worker responds to the request for validation
   * with the results. Shows an error message (if there is one) in the footer,
   * and passes the results back to the editor so it can show red markings.
   * @param results The results of the validation.
   */
  private onValidatorResults(results: ValidationResults) {
    const footerP = getParagraph(HtmlIDs.footerError);

    const error = results.overallError();
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
}
