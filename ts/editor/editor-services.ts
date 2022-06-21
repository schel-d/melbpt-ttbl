import { ServiceInfo } from "../data/service-smarts";

export class EditorServices {
  private _servicesDiv: HTMLDivElement;

  serviceClicked: (index: number) => void;

  constructor(servicesID: string) {
    this._servicesDiv = document.getElementById(servicesID) as HTMLDivElement;
  }

  clear() {
    this.setServices([]);
  }
  setServices(services: ServiceInfo[]) {
    this._servicesDiv.replaceChildren(...services.map(s =>
      this.createServiceButton(s)));
  }
  addServices(startIndex: number, services: ServiceInfo[]) {
    if (startIndex == 0) {
      this.setServices(services);
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

    serviceBefore.after(...services.map(s =>
      this.createServiceButton(s)));
  }
  removeServices(indices: number[]) {
    const sortedIndices = [...indices].sort((a, b) => b - a);

    for (const index of sortedIndices) {
      this._servicesDiv.querySelector(`.service:nth-child(${index + 1})`)
        .remove();
    }
  }

  private createServiceButton(info: ServiceInfo) {
    const service = document.createElement("button");
    service.className = "service";

    if (info.nextDay) {
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
