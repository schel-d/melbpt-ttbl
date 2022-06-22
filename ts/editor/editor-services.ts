export class EditorServices {
  private _servicesDiv: HTMLDivElement;
  private _currNextDay: boolean[];

  serviceClicked: (index: number) => void;

  constructor(servicesID: string) {
    this._servicesDiv = document.getElementById(servicesID) as HTMLDivElement;
    this._currNextDay = [];
  }

  clear() {
    this.setServices([]);
  }

  setServices(nextDay: boolean[]) {
    // Only edit the DOM if there are changes.
    if (nextDay.length == this._currNextDay.length &&
      nextDay.every((val, index) => this._currNextDay[index] == val)) {
      return;
    }

    this._currNextDay = nextDay;
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
