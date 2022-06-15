import { Network } from "./network";

export type NewTimetableDialogCallback =
  (lineID: number, days: string, timetableID: string) => void

export class NewTimetableDialog {
  // Typescript does not have up to date dialog type information, so this is
  // needed to be able to call showModal().
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private dialog: any;

  private cancelButton: HTMLButtonElement;
  private submitButton: HTMLButtonElement;
  private linesSelect: HTMLSelectElement;
  private daysSelect: HTMLSelectElement;
  private idFieldID: HTMLInputElement;

  private submitted: NewTimetableDialogCallback;

  constructor(htmlID: string, submitted: NewTimetableDialogCallback) {

    this.dialog = document.querySelector(`#${htmlID}`);
    this.cancelButton = document.querySelector(`#${htmlID}-cancel`);
    this.submitButton = document.querySelector(`#${htmlID}-submit`);
    this.linesSelect = document.querySelector(`#${htmlID}-lines`);
    this.daysSelect = document.querySelector(`#${htmlID}-days`);
    this.idFieldID = document.querySelector(`#${htmlID}-id`);

    this.submitted = submitted;
  }
  init(network: Network) {
    // Sort lines by name alphabetical order, and add an option for each to the
    // lines select.
    const lines = [...network.lines]
      .sort((a, b) => a.name.localeCompare(b.name));
    lines.map(line => {
      const option = new Option(line.name, line.id.toString());
      this.linesSelect.appendChild(option);
    })

    // Close the dialog if the close button is clicked. Note that pressing ESC
    // also closes the dialog, so it cannot be assumed this will run.
    this.cancelButton.addEventListener("click", () => {
      this.dialog.close();
    });

    // Retrieve the values, run the callback, and close the dialog when the
    // submit button is pressed. If any error occurs, display the error and do
    // not close the dialog.
    this.submitButton.addEventListener("click", () => {
      const lineIDStr = this.linesSelect.value;
      const days = this.daysSelect.value;
      const timetableID = this.idFieldID.value;
      const lineIDNum = parseInt(lineIDStr);

      try {
        this.submitted(lineIDNum, days, timetableID)
        this.dialog.close();
      }
      catch {
        // todo: handle invalid input
      }
    });
  }
  show() {
    this.dialog.showModal();
  }
}
