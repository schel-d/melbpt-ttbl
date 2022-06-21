import { DOWPresets, nameDOW } from "../data/dow";
import { Network } from "../data/network";

export type NewTimetableDialogCallback =
  (lineID: number, dowPresetIndex: number, timetableID: string) => void

export class NewTimetableDialog {
  // Typescript does not have up to date dialog type information, so this is
  // needed to be able to call showModal().
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private _dialog: any;

  private _cancelButton: HTMLButtonElement;
  private _submitButton: HTMLButtonElement;
  private _linesSelect: HTMLSelectElement;
  private _dowsSelect: HTMLSelectElement;
  private _idInput: HTMLInputElement;
  private _errorText: HTMLParagraphElement;

  private submitted: NewTimetableDialogCallback;

  constructor(htmlID: string, submitted: NewTimetableDialogCallback) {
    this._dialog = document.getElementById(htmlID);
    this._cancelButton =
      document.getElementById(`${htmlID}-cancel`) as HTMLButtonElement;
    this._submitButton =
      document.getElementById(`${htmlID}-submit`) as HTMLButtonElement;
    this._linesSelect =
      document.getElementById(`${htmlID}-lines`) as HTMLSelectElement;
    this._dowsSelect =
      document.getElementById(`${htmlID}-dows`) as HTMLSelectElement;
    this._idInput =
      document.getElementById(`${htmlID}-id`) as HTMLInputElement;
    this._errorText =
      document.getElementById(`${htmlID}-error`) as HTMLParagraphElement;

    this.submitted = submitted;
  }

  init(network: Network) {
    // Sort lines by name alphabetical order, and add an option for each to the
    // lines select.
    const lines = [...network.lines]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(line => new Option(line.name, line.id.toString()));
    this._linesSelect.replaceChildren(...lines);

    // Add each DOW (days of week) present to the select. They are referenced by
    // index.
    const dows = DOWPresets.map((preset, index) => new Option(
      preset.map(d => nameDOW(d)).join(", "),
      index.toString()))
    this._dowsSelect.replaceChildren(...dows);

    // Close the dialog if the close button is clicked. Note that pressing ESC
    // also closes the dialog, so it cannot be assumed this will run.
    this._cancelButton.addEventListener("click", () => {
      this._dialog.close();
    });

    // Retrieve the values, run the callback, and close the dialog when the
    // submit button is pressed. If any error occurs, display the error and do
    // not close the dialog.
    this._submitButton.addEventListener("click", () => {
      const lineIDStr = this._linesSelect.value;
      const dowPresetIndexStr = this._dowsSelect.value;
      const timetableID = this._idInput.value;

      const lineIDNum = parseInt(lineIDStr);
      const dowPresetIndex = parseInt(dowPresetIndexStr);

      try {
        this.submitted(lineIDNum, dowPresetIndex, timetableID)
        this._dialog.close();
        this._errorText.textContent = "";
      }
      catch (ex) {
        this._errorText.textContent = ex.message;
      }
    });
  }

  show() {
    this._dialog.showModal();
    this._errorText.textContent = "";
  }

  isOpen() {
    return this._dialog.open == true;
  }
}
