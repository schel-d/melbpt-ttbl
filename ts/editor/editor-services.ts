import { getDiv } from "../dom-utils";
import { HtmlIDs } from "../main";

/**
 * Manages the buttons for each service above the editor grid.
 */
export class EditorServices {
  private _servicesDiv: HTMLDivElement;
  private _currNextDay: boolean[];

  /**
   * Called when a service's button is clicked.
   */
  serviceClicked: ((index: number) => void) | null;

  constructor() {
    this._servicesDiv = getDiv(HtmlIDs.editorServices);
    this._currNextDay = [];

    this.serviceClicked = null;
  }

  /**
   * Removes all service buttons.
   */
  clear() {
    this.setServices([]);
  }

  /**
   * Creates buttons for each service.
   * @param nextDay The values of the next day setting for each service.
   */
  setServices(nextDay: boolean[]) {
    // Only edit the DOM if there are changes.
    if (nextDay.length == this._currNextDay.length &&
      nextDay.every((val, index) => this._currNextDay[index] == val)) {
      return;
    }

    this._currNextDay = nextDay;
    this._servicesDiv.replaceChildren(...nextDay.map(f => this.makeButton(f)));
  }

  /**
   * Applies the error styling to each service button where appropriate.
   * @param errors Whether or not to show an error for a service, matched by
   * index.
   */
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

  /**
   * Applies a direction icon to each service button where appropriate.
   * @param directionIcon The icon to use (or null) for each service, matched by
   * index.
   */
  markServiceDirectionIcons(directionIcon: (string | null)[]) {
    this._servicesDiv.querySelectorAll(".service .direction-icon").forEach((x, index) => {
      const xImg = x as HTMLImageElement;

      // Cannot always expect the icons array to have a value for every index,
      // since sometimes icons are not necessary (e.g. linear routes).
      if (directionIcon[index] == null) {
        xImg.classList.add("gone");
      }
      else {
        xImg.src = `service-icons/${directionIcon[index]}.svg`;
        xImg.classList.remove("gone");
      }
    });
  }

  /**
   * Creates a service button, including a hidden empty direction icon (for
   * later use), and a next day icon image if appropriate.
   * @param nextDay Whether or not to add a next day icon.
   */
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

  /**
   * The height of the services div in the DOM. Used to calculate the
   * space available to the editor grid.
   */
  clientHeight(): number {
    return this._servicesDiv.getBoundingClientRect().height
  }
}
