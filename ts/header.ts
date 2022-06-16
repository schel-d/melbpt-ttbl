import { nameDOW } from "./dow";

export type HeaderTabCallback = (direction: string, dow: string) => void;

const generalDirNames: { [key: string]: string } = {
  "up": "Up",
  "down": "Down"
};

export class Header {
  newTimetableButton: HTMLButtonElement;
  importButton: HTMLButtonElement;
  exportButton: HTMLButtonElement;
  tabs: HTMLDivElement;
  private _callback: HeaderTabCallback;

  constructor(newTimetableButton: string, importButton: string,
    exportButton: string, tabs: string, callback: HeaderTabCallback) {

    this.newTimetableButton = document.querySelector(`#${newTimetableButton}`);
    this.importButton = document.querySelector(`#${importButton}`);
    this.exportButton = document.querySelector(`#${exportButton}`);
    this.tabs = document.querySelector(`#${tabs}`);
    this._callback = callback;
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

  clearTabs() {
    this.tabs.replaceChildren();
  }
  createTabs(generalDirs: string[], dows: string[]) {
    this.tabs.replaceChildren(...generalDirs.map(d =>
      this.createTabGroup(d, dows)));
  }
  selectTab(generalDir: string, dow: string) {
    const radio = document.querySelector(
      `#tab-group-${generalDir} input[value="${dow}"]`) as HTMLInputElement;

    radio.checked = true;
  }

  private createTabGroup(generalDir: string, dows: string[]): HTMLDivElement {
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
    tabGroup.append(...dows.map(d => {
      const label = document.createElement("label");
      label.className = "tab";

      const input = document.createElement("input");
      input.type = "radio";
      input.name = "tab";
      input.autocomplete = "off";
      input.value = d;
      input.addEventListener("click", () => this._callback(generalDir, d));

      const content = document.createElement("div");
      content.className = "tab-content";
      const contentP = document.createElement("p");
      contentP.textContent = nameDOW(d);
      content.append(contentP);

      label.append(input, content);
      return label;
    }))

    return tabGroup;
  }
}
