import { nameWDR } from "../data/week-day-range";
import { getButton, getDiv } from "../dom-utils";
import { HtmlIDs } from "../main";

/**
 * The callback function called when a timetable section's tab is clicked.
 */
export type HeaderTabCallback = (direction: string, wdr: string) => void;

const generalDirNames: { [key: string]: string } = {
  "up": "Up",
  "down": "Down"
};

/**
 * Responsible for managing the header element, and it's child controls, such as
 * the "New Timetable"/"Export" buttons and tabs for each timetable section.
 */
export class Header {
  private _newButton: HTMLButtonElement;
  // private _importButton: HTMLButtonElement;
  private _exportButton: HTMLButtonElement;
  private tabs: HTMLDivElement;

  constructor(
    newButtonCallback: () => void,
    // importButtonCallback: () => void,
    exportButtonCallback: () => void) {

    this._newButton = getButton(HtmlIDs.headerNewTimetableButton);
    this._newButton.addEventListener("click", () => newButtonCallback());

    // this._importButton = getButton(HtmlIDs.headerImportButton);
    // this._importButton.addEventListener("click", () => importButtonCallback());

    this._exportButton = getButton(HtmlIDs.headerExportButton);
    this._exportButton.addEventListener("click", () => exportButtonCallback());

    this.tabs = getDiv(HtmlIDs.headerTabs);
  }

  /**
   * Enables the "New Timetable" button, among other actions, to set the UI into
   * the correct state for when the network object has finished downloading and
   * the webapp is ready to use, but no timetable is open.
   */
  ready() {
    this._newButton.disabled = false;
    // this._importButton.disabled = false;
    this._exportButton.disabled = true;

    this.tabs.replaceChildren();
  }

  /**
   * Sets up the timetable section tabs, among other actions, to set the UI into
   * the correct state for editing the now loaded/created timetable.
   * @param generalDirs
   * @param wdrs
   * @param tabCallback
   */
  editing(generalDirs: string[], wdrs: string[], tabCallback: HeaderTabCallback) {
    this._newButton.disabled = false;
    // this._importButton.disabled = false;
    this._exportButton.disabled = false;

    this.tabs.replaceChildren(
      ...generalDirs.map(d => createTabGroup(d, wdrs, tabCallback))
    );
  }

  /**
   * Manually set a tab as selected. Used when the timetable is initially loaded
   * to set the first tab's button to appear selected.
   * @param generalDir The general direction of the timetable section that was
   * selected.
   * @param wdr The week day range of the timetable section that was selected.
   */
  selectTab(generalDir: string, wdr: string) {
    const radioSelector = `#tab-group-${generalDir} input[value="${wdr}"]`;
    const radio = document.querySelector(radioSelector) as HTMLInputElement;
    radio.checked = true;
  }
}

/**
 * Helper function to create a group of tabs for a single general direction, to
 * be displayed in the header.
 * @param generalDir The general direction to generate tabs for.
 * @param wdrs The list of week day ranges. One tab will be generated for each.
 * @param tabCallback The function to run when a tab is clicked.
 */
function createTabGroup(
  generalDir: string,
  wdrs: string[],
  tabCallback: HeaderTabCallback): HTMLDivElement {

  const tabGroup = document.createElement("div");
  tabGroup.className = "tab-group";
  tabGroup.id = `tab-group-${generalDir}`;

  // Create the tab group header (the label that says "Up:" or "Down:")
  const header = document.createElement("div");
  header.className = "tab-group-header";

  const headerP = document.createElement("p");
  headerP.textContent = `${generalDirNames[generalDir]}:`;
  header.append(headerP);
  tabGroup.append(header);

  // Create each tab for this direction.
  tabGroup.append(...wdrs.map(d => createTab(generalDir, d, tabCallback)))

  return tabGroup;
}

/**
 * Helper function to create a tab button.
 * @param generalDir The general direction group this tab belongs to (passed to
 * callback).
 * @param wdr The week day range this tab represents.
 * @param tabCallback The function to run when this tabs is clicked.
 */
function createTab(
  generalDir: string,
  wdr: string,
  tabCallback: HeaderTabCallback): HTMLLabelElement {

  const label = document.createElement("label");
  label.className = "tab";

  const input = document.createElement("input");
  input.type = "radio";
  input.name = "tab";
  input.autocomplete = "off";
  input.value = wdr;
  input.addEventListener("click", () => tabCallback(generalDir, wdr));

  const content = document.createElement("div");
  content.className = "tab-content";
  const contentP = document.createElement("p");
  contentP.textContent = nameWDR(wdr);
  content.append(contentP);

  label.append(input, content);
  return label;
}
