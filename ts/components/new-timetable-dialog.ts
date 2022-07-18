import { WDRPresets, nameWDR } from "../data/week-day-range";
import { Line, Network } from "../data/network";
import { getButton, getInput, getParagraph, getSelect } from "../dom-utils";
import { HtmlIDs } from "../main";
import { getErrorMessage } from "../utils";

/**
 * The callback called when the new timetable dialog is submitted.
 */
export type NewTimetableDialogCallback =
  (lineID: number, wdrPresetIndex: number, timetableID: string) => void

/**
 * Mananges the new timetable dialog, ensuring it is populated correctly and
 * interfacing with the UI to retrieve the user input when it is submitted.
 */
export class NewTimetableDialog {
  // Typescript does not have up to date dialog type information, so this is
  // needed to be able to call showModal().
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private _dialog: any;

  private _cancelButton: HTMLButtonElement;
  private _submitButton: HTMLButtonElement;
  private _linesSelect: HTMLSelectElement;
  private _wdrsSelect: HTMLSelectElement;
  private _idInput: HTMLInputElement;
  private _errorText: HTMLParagraphElement;

  private _submittedCallback: NewTimetableDialogCallback | null;

  constructor(network: Network) {
    this._dialog = document.getElementById(HtmlIDs.newTimetableDialog);

    this._cancelButton = getButton(HtmlIDs.newTimetableCancelButton);
    this._submitButton = getButton(HtmlIDs.newTimetableSubmitButton);
    this._linesSelect = getSelect(HtmlIDs.newTimetableLinesSelect);
    this._wdrsSelect = getSelect(HtmlIDs.newTimetableWDRsSelect);
    this._idInput = getInput(HtmlIDs.newTimetableIdInput);
    this._errorText = getParagraph(HtmlIDs.newTimetableErrorText);

    this._submittedCallback = null;

    this.populateInputs(network);

    // Close the dialog if the close button is clicked. Note that pressing ESC
    // also closes the dialog, so it cannot be assumed this will run.
    this._cancelButton.addEventListener("click", () => this._dialog.close());

    // Retrieve the values, run the callback, and close the dialog when the
    // submit button is pressed. If any error occurs, display the error and do
    // not close the dialog.
    this._submitButton.addEventListener("click", () => this.onSubmitClick());
  }

  /**
   * Shows the new timetable dialog.
   * @param submittedCallback Function to call when it is submitted.
   */
  show(submittedCallback: NewTimetableDialogCallback) {
    this._submittedCallback = submittedCallback;
    this._dialog.showModal();
    this._errorText.textContent = "";
  }

  /**
   * Returns true if the dialog is currently open.
   */
  isOpen(): boolean {
    return this._dialog.open == true;
  }

  /**
   * Sets up the selects with their line names and week day range options in
   * the new timetable dialog.
   * @param network The network object to get lines information from.
   */
  private populateInputs(network: Network) {
    // Sort lines by name alphabetical order, and add an option for each to the
    // lines select.
    const alphabetically = (a: Line, b: Line) => a.name.localeCompare(b.name);
    const toOption = (line: Line) => new Option(line.name, line.id.toString());
    const lineOptions = [...network.lines].sort(alphabetically).map(toOption);
    this._linesSelect.replaceChildren(...lineOptions);

    // Add each week day range preset to the select. They are referenced by
    // index.
    const wdrs = WDRPresets.map((preset, index) =>
      new Option(preset.map(d => nameWDR(d)).join(", "), index.toString())
    );
    this._wdrsSelect.replaceChildren(...wdrs);

    const setIDPlaceholder = (lineID: number) => {
      const line = network.line(lineID);
      this._idInput.placeholder = `${lineID.toString(36)}... (${line.name}` +
        " line)";
    }
    this._linesSelect.addEventListener("change", () => {
      const lineID = parseInt(this._linesSelect.value);
      setIDPlaceholder(lineID);
    });

    setIDPlaceholder(parseInt(this._linesSelect.value));
  }

  /**
   * Runs when the submit button is clicked. Retrieves the user input from DOM
   * and calls the callback given in the {@link show} function.
   */
  private onSubmitClick() {
    const lineIDStr = this._linesSelect.value;
    const wdrPresetIndexStr = this._wdrsSelect.value;
    const timetableID = this._idInput.value;

    const lineIDNum = parseInt(lineIDStr);
    const wdrPresetIndex = parseInt(wdrPresetIndexStr);

    try {
      if (this._submittedCallback != null) {
        this._submittedCallback(lineIDNum, wdrPresetIndex, timetableID)
      }
      this._dialog.close();
      this._errorText.textContent = "";
    }
    catch (ex) {
      this._errorText.textContent = getErrorMessage(ex);
    }
  }
}
