import { Row } from "../commands/extract-content";
import { getButton, getDiv, getSelect } from "../dom-utils";
import { HtmlIDs } from "../main";

export type PasteIssuesDialogCallback =
  (choices: { rowIndex: number, option: Row }[]) => void

export type Duplicate = {
  stopName: string,
  rowIndex: number,
  options: Row[]
}

export class PasteIssuesDialog {
  // Typescript does not have up to date dialog type information, so this is
  // needed to be able to call showModal().
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private _dialog: any;

  private _cancelButton: HTMLButtonElement;
  private _submitButton: HTMLButtonElement;
  private _duplicatesDiv: HTMLDivElement;

  private submittedCallback: PasteIssuesDialogCallback | null;
  private duplicates: Duplicate[] | null;

  constructor() {
    this._dialog = document.getElementById(HtmlIDs.pasteIssuesDialog);
    this._cancelButton = getButton(HtmlIDs.pasteIssuesCancelButton);
    this._submitButton = getButton(HtmlIDs.pasteIssuesSubmitButton);
    this._duplicatesDiv = getDiv(HtmlIDs.pasteIssuesDuplicates);

    this.submittedCallback = null;
    this.duplicates = null;

    // Close the dialog without calling the callback if the cancel button is
    // clicked. Note that hitting ESC also closes a dialog, so no additional
    // closing functionality can be relied on if put inside this event.
    this._cancelButton.addEventListener("click", () => this._dialog.close());

    this._submitButton.addEventListener("click", () => this.onSubmitClick());
  }

  private onSubmitClick() {
    if (this.duplicates == null || this.submittedCallback == null) { return; }

    // When the user clicks submit, for each duplicated stop, find the chosen
    // option of its dedicated select in the dialog.
    const choices = this.duplicates.map(d => {
      const select = getSelect(HtmlIDs.pasteIssuesDialogSelect(d.rowIndex));
      const option = d.options[parseInt(select.value)];
      return { rowIndex: d.rowIndex, option: option };
    });

    // Call the callback providing the choice back.
    this.submittedCallback(choices);
    this._dialog.close();
  }

  show(duplicates: Duplicate[], submittedCallback: PasteIssuesDialogCallback) {
    // Save the callback and duplicates information for when the submit button
    // is clicked.
    this.duplicates = duplicates;
    this.submittedCallback = submittedCallback;

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
      select.id = HtmlIDs.pasteIssuesDialogSelect(d.rowIndex);
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
}
