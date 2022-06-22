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
    // todo: this shouldn't happen every edit! only update the number of buttons
    // if needed etc.
    this._servicesDiv.replaceChildren(...nextDay.map(f => this.makeButton(f)));
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
        const serviceDivs = Array.from(service.parentElement.children);
        const serviceIndex = serviceDivs.indexOf(service);
        this.serviceClicked(serviceIndex);
      }
    });
    return service;
  }

  clientHeight() {
    return this._servicesDiv.getBoundingClientRect().height
  }
}
