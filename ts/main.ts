import { loadNetwork, Network } from "./data/network";
import { CommandListener } from "./commands/command-listener";
import { AppContext } from "./app-context";
import { StatusScreens } from "./components/status-screens";

/**
 * The domain name of a running instance of melbpt-api from which to query for
 * network information (lines and stops).
 */
export const apiDomain = "api.trainquery.com";

/**
 * The name of the second bundled javascript file, created for the validation
 * worker to allow timetable validation to occur off the main thread.
 */
export const validationWorkerScriptName = "validation-worker.js";

/**
 * A singleton object containing the html IDs for each element in the DOM that
 * will be accessed by the script. This provides one central place to update if
 * ID names are changed.
 */
export class HtmlIDs {
  static readonly editor = "editor";
  static readonly editorGrid = "grid";
  static readonly editorGridCanvas = "grid-canvas";
  static readonly editorStops = "stops";
  static readonly editorServices = "services";

  static readonly headerNewTimetableButton = "new-timetable-button";
  // static readonly headerImportButton = "import-button";
  static readonly headerExportButton = "export-button";
  static readonly headerTabs = "tabs";

  static readonly status = "status";
  static readonly statusLoading = "status-loading";
  static readonly statusReady = "status-ready";

  static readonly newTimetableDialog = "new-timetable-dialog";
  static readonly newTimetableCancelButton = "new-timetable-dialog-cancel";
  static readonly newTimetableSubmitButton = "new-timetable-dialog-submit";
  static readonly newTimetableLinesSelect = "new-timetable-dialog-lines";
  static readonly newTimetableWDRsSelect = "new-timetable-dialog-wdrs";
  static readonly newTimetableIdInput = "new-timetable-dialog-id";
  static readonly newTimetableErrorText = "new-timetable-dialog-error";

  static readonly pasteIssuesDialog = "paste-issues-dialog";
  static readonly pasteIssuesCancelButton = "paste-issues-dialog-cancel";
  static readonly pasteIssuesSubmitButton = "paste-issues-dialog-submit";
  static readonly pasteIssuesDuplicates = "paste-issues-dialog-duplicates";

  static readonly footerError = "footer-error";

  /**
   * Returns the HTML ID for a select in the paste issues dialog, which are
   * dynamically created upon opening the dialog, depending on how many are
   * needed, and for which rows.
   * @param rowIndex The row index, which is used to uniquely identify the
   * select in future.
   */
  static pasteIssuesDialogSelect(rowIndex: number): string {
    return `paste-issues-dialog-duplicate-${rowIndex}`;
  }
}

// == ENTRY POINT FOR MAIN THREAD SCRIPT ==
// Todo: make sure loading screen is shown (instead of relying on HTML document
// to be in correct state by default)?
const status = new StatusScreens();

// Load the network information from the API.
loadNetwork(apiDomain).then((network: Network) => {
  // Once loaded, initialize the web app.
  const appContext = new AppContext(network, status);

  // Only now, will we start listening for keyboard events.
  const commandListener = new CommandListener(appContext);
  document.addEventListener("keydown", (e) => commandListener.onDocKeyEvent(e));
  document.addEventListener("paste", (e) => commandListener.onPaste(e));

  // Make sure the editor can respond to window resizes.
  window.addEventListener("resize", () => appContext.editor.resize());

  // Warn the user before leaving if they're editing a timetable so they don't
  // lose their work.
  window.onbeforeunload = () => {
    if (appContext.timetable != null && appContext.timetable.hasContent()) {
      return true;
    }
  };
});
