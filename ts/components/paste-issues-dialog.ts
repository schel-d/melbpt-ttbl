import { Row } from "../commands/extract-content";

export type PasteIssuesDialogCallback =
  (choices: { rowIndex: number, option: Row }[]) => void

export type DuplicatesList = {
  stopName: string,
  rowIndex: number,
  options: Row[]
}[]

export class PasteIssuesDialog {
  // Typescript does not have up to date dialog type information, so this is
  // needed to be able to call showModal().
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private _dialog: any;

  private _htmlID: string;

  private _cancelButton: HTMLButtonElement;
  private _submitButton: HTMLButtonElement;
  private _duplicatesDiv: HTMLDivElement;

  private submitted: PasteIssuesDialogCallback | null;
  private duplicates: DuplicatesList | null;

  constructor(htmlID: string) {
    this._htmlID = htmlID;
    this._dialog = document.getElementById(htmlID);
    this._cancelButton =
      document.getElementById(`${htmlID}-cancel`) as HTMLButtonElement;
    this._submitButton =
      document.getElementById(`${htmlID}-submit`) as HTMLButtonElement;
    this._duplicatesDiv =
      document.getElementById(`${htmlID}-duplicates`) as HTMLDivElement;
  }

  init() {
    // Close the dialog without calling the callback if the cancel button is
    // clicked. Note that hitting ESC also closes a dialog, so no additional
    // closing functionality can be relied on if put inside this event.
    this._cancelButton.addEventListener("click", () => {
      this._dialog.close();
    });

    // If the user clicks submit...
    this._submitButton.addEventListener("click", () => {
      // For each duplicated stop, find the chosen option of its dedicated
      // select in the dialog.
      const choices = this.duplicates.map(d => {
        const select = document.getElementById(
          this.selectID(d.rowIndex)) as HTMLSelectElement;
        const option = d.options[parseInt(select.value)];
        return { rowIndex: d.rowIndex, option: option };
      });

      // Call the callback providing the choice back.
      this.submitted(choices);
      this._dialog.close();
    });
  }

  show(duplicates: DuplicatesList, submitted: PasteIssuesDialogCallback) {
    // Save the callback and duplicates information for when the submit button
    // is clicked.
    this.duplicates = duplicates;
    this.submitted = submitted;

    // Clear existing UI from last time duplicate rows occurred.
    this._duplicatesDiv.replaceChildren();

    // For each stop with mulitple options...
    duplicates.forEach(d => {
      const title = document.createElement("h2");
      title.textContent = `Multiple rows found for "${d.stopName}"`;

      // Create the wrapper holding the custom styled select... yes it sucks :/
      const selectWrapper = document.createElement("div");
      selectWrapper.className = "select-wrapper";
      const selectHighlight = document.createElement("div");
      selectHighlight.className = "select-highlight";
      const selectArrow = document.createElement("div");
      selectArrow.className = "select-arrow";

      // Use a specific ID for this select so it can be retrieved when the
      // submit button is clicked.
      const select = document.createElement("select");
      select.id = this.selectID(d.rowIndex);
      select.autocomplete = "off";

      // Add each option, and make the "dep" option (if present) the default.
      select.replaceChildren(...d.options.map((o, index) => {
        const defaultOption = o.header.endsWith(" dep");
        return new Option(`Use "${o.header}"`, index.toString(), defaultOption,
          defaultOption);
      }));

      // Add everything for this stop to the DOM.
      selectHighlight.append(selectArrow);
      selectWrapper.append(select, selectHighlight);
      this._duplicatesDiv.append(title, selectWrapper);
    });

    this._dialog.showModal();
  }

  isOpen() {
    return this._dialog.open == true;
  }

  private selectID(rowIndex: number) {
    // Generate an ID for the select for this stop in the timetable. Modularized
    // here because its called both when creating the select, and later
    // retrieving it during the submit event.
    return `${this._htmlID}-duplicate-${rowIndex}`;
  }
}
