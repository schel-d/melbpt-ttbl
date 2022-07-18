import { getDiv } from "../dom-utils";
import { HtmlIDs } from "../main";

export class EditorServices {
  private _servicesDiv: HTMLDivElement;
  private _currNextDay: boolean[];

  serviceClicked: ((index: number) => void) | null;

  constructor() {
    this._servicesDiv = getDiv(HtmlIDs.editorServices);
    this._currNextDay = [];

    this.serviceClicked = null;
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
  markErrorServices(errors: boolean[]) {
    this._servicesDiv.querySelectorAll(".service").forEach((x, index) => {
      // Cannot always expect the errors array to have a value for every index,
      // since the validation is done async and could arrive late. In this, the
      // if statement value will be falsey so its ok.
      if (errors[index]) {
        x.classList.add("error");
      }
      else {
        x.classList.remove("error");
      }
    });
  }
  markServiceDirectionIcons(directionIcon: (string | null)[]) {
    this._servicesDiv.querySelectorAll(".service .direction-icon").forEach((x, index) => {
      const xImg = x as HTMLImageElement;

      // Cannot always expect the errors array to have a value for every index,
      // since the validation is done async and could arrive late. In this, the
      // if statement value will be falsey so its ok.
      if (directionIcon[index] == null) {
        xImg.classList.add("gone");
      }
      else {
        xImg.src = `service-icons/${directionIcon[index]}.svg`;
        xImg.classList.remove("gone");
      }
    });
  }

  private makeButton(nextDay: boolean): HTMLButtonElement {
    const service = document.createElement("button");
    service.className = "service";

    const dirImg = document.createElement("img");
    dirImg.className = "direction-icon gone";
    dirImg.alt = "Service direction indicator";
    service.append(dirImg);

    if (nextDay) {
      const moonImg = document.createElement("img");
      moonImg.src = "service-icons/next-day.svg";
      moonImg.alt = "Next day";
      service.append(moonImg);
    }

    service.addEventListener("click", () => {
      if (this.serviceClicked != null) {
        const parent = service.parentElement;
        if (parent == null) {
          throw new Error("Clicked service button had no parent");
        }
        const serviceDivs = Array.from(parent.children);
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
