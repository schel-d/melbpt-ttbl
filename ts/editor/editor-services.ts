export class EditorServices {
  private _servicesDiv: HTMLDivElement;

  serviceClicked: (index: number) => void;

  constructor(servicesID: string) {
    this._servicesDiv = document.getElementById(servicesID) as HTMLDivElement;
  }

  clear() {
    this.setServices([]);
  }
  setServices(nextDay: boolean[]) {
    this._servicesDiv.replaceChildren(...nextDay.map(f => this.makeButton(f)));
  }
  addServices(startIndex: number, nextDay: boolean[]) {
    if (this._servicesDiv.children.length == 0) {
      this.setServices(nextDay);
      return;
    }
    if (startIndex == 0) {
      this._servicesDiv.firstChild.before(...nextDay.map(f => this.makeButton(f)));
      return;
    }

    // nth-child() indices are 1-based and the startIndex is 0-based, however
    // we want the child BEFORE this element (startIndex - 1), so no
    // addition/subtraction need.
    const serviceBefore = this._servicesDiv.querySelector(`.service:nth-child(${startIndex})`);

    if (serviceBefore == null) {
      throw new Error(`Couldn't find a service at index=${startIndex} to ` +
        `insert service buttons after.`);
    }

    serviceBefore.after(...nextDay.map(f => this.makeButton(f)));
  }
  removeServices(indices: number[]) {
    const sortedIndices = [...indices].sort((a, b) => b - a);

    for (const index of sortedIndices) {
      this._servicesDiv.querySelector(`.service:nth-child(${index + 1})`)
        .remove();
    }
  }

  updateService(index: number, nextDay: boolean) {
    const thisService = this._servicesDiv.querySelector(`.service:nth-child(${index + 1})`);
    thisService.replaceWith(this.makeButton(nextDay));
  }

  private makeButton(nextDay: boolean): HTMLButtonElement {
    const service = document.createElement("button");
    service.className = "service";

    if (nextDay) {
      const img = document.createElement("img");
      img.src = "service-icons/next-day.svg";
      img.alt = "Next day";
      service.append(img);
    }

    service.addEventListener("click", () => {
      if (this.serviceClicked != null) {
        const serviceIndex = Array.from(service.parentElement.children)
          .indexOf(service);
        this.serviceClicked(serviceIndex);
      }
    });
    return service;
  }
  clientHeight() {
    return this._servicesDiv.getBoundingClientRect().height
  }
}
