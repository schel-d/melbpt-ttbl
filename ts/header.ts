export class Header {
  newTimetableButton: HTMLButtonElement;
  importButton: HTMLButtonElement;
  exportButton: HTMLButtonElement;

  constructor(newTimetableButton: string, importButton: string,
    exportButton: string) {

    this.newTimetableButton = document.querySelector("#" + newTimetableButton);
    this.importButton = document.querySelector("#" + importButton);
    this.exportButton = document.querySelector("#" + exportButton);
  }
  set newTimetableButtonEnabled(value: boolean) {
    this.newTimetableButton.disabled = !value;
  }
  set importButtonEnabled(value: boolean) {
    this.importButton.disabled = !value;
  }
  set exportButtonEnabled(value: boolean) {
    this.exportButton.disabled = !value;
  }
}
