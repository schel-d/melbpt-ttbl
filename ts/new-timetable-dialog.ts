import { Network } from "./network";

export type NewTimetableDialogCallback =
  (lineID: number, days: string, timetableID: string) => void

export class NewTimetableDialog {
  // Typescript does not have up to date dialog type information, so this is
  // needed to be able to call showModal().
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private _dialog: any;

  private _cancelButton: HTMLButtonElement;
  private _submitButton: HTMLButtonElement;
  private _linesSelect: HTMLSelectElement;
  private _daysSelect: HTMLSelectElement;
  private _idFieldID: HTMLInputElement;

  private submitted: NewTimetableDialogCallback;

  constructor(htmlID: string, submitted: NewTimetableDialogCallback) {

    this._dialog = document.querySelector(`#${htmlID}`);
    this._cancelButton = document.querySelector(`#${htmlID}-cancel`);
    this._submitButton = document.querySelector(`#${htmlID}-submit`);
    this._linesSelect = document.querySelector(`#${htmlID}-lines`);
    this._daysSelect = document.querySelector(`#${htmlID}-days`);
    this._idFieldID = document.querySelector(`#${htmlID}-id`);

    this.submitted = submitted;
  }
  init(network: Network) {
    // Sort lines by name alphabetical order, and add an option for each to the
    // lines select.
    const lines = [...network.lines]
      .sort((a, b) => a.name.localeCompare(b.name));
    lines.map(line => {
      const option = new Option(line.name, line.id.toString());
      this._linesSelect.appendChild(option);
    })

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
      const days = this._daysSelect.value;
      const timetableID = this._idFieldID.value;
      const lineIDNum = parseInt(lineIDStr);

      try {
        this.submitted(lineIDNum, days, timetableID)
        this._dialog.close();
      }
      catch {
        // todo: handle invalid input
      }
    });
  }
  show() {
    this._dialog.showModal();
  }
}
