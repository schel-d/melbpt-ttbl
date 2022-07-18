import { nameWDR } from "../data/week-day-range";
import { getButton, getDiv } from "../dom-utils";
import { HtmlIDs } from "../main";

export type HeaderTabCallback = (direction: string, wdr: string) => void;

const generalDirNames: { [key: string]: string } = {
  "up": "Up",
  "down": "Down"
};

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

  ready() {
    this._newButton.disabled = false;
    // this._importButton.disabled = false;
    this._exportButton.disabled = true;

    this.tabs.replaceChildren();
  }

  editing(generalDirs: string[], wdrs: string[], tabCallback: HeaderTabCallback) {
    this._newButton.disabled = false;
    // this._importButton.disabled = false;
    this._exportButton.disabled = false;

    this.tabs.replaceChildren(
      ...generalDirs.map(d => createTabGroup(d, wdrs, tabCallback))
    );
  }

  selectTab(generalDir: string, wdr: string) {
    const radioSelector = `#tab-group-${generalDir} input[value="${wdr}"]`;
    const radio = document.querySelector(radioSelector) as HTMLInputElement;
    radio.checked = true;
  }
}

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
