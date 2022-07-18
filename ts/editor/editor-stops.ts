import { getDiv } from "../dom-utils";
import { HtmlIDs } from "../main";

/**
 * Manages the list of stops on the left-hand side of the editor.
 */
export class EditorStops {
  private _stopsDiv: HTMLDivElement;

  /**
   * Callback called when a stop is clicked.
   */
  stopClicked: ((index: number) => void) | null;

  constructor() {
    this._stopsDiv = getDiv(HtmlIDs.editorStops);
    this.stopClicked = null;
  }

  /**
   * Removes every stop.
   */
  clear() {
    this.setStops([]);
  }

  /**
   * Sets the list of stops.
   * @param stopNames The names of each stop to create.
   */
  setStops(stopNames: string[]) {
    this._stopsDiv.replaceChildren(...stopNames.map((s, index) => {
      const stop = document.createElement("button");
      stop.className = "stop";

      const stopP = document.createElement("p");
      stopP.textContent = s;
      stop.append(stopP);

      stop.addEventListener("click", () => {
        if (this.stopClicked != null) {
          this.stopClicked(index);
        }
      })

      return stop;
    }))
  }

  /**
   * Gives error styling to each stop button if appropriate.
   * @param errors Whether or not to apply error styling, matched by index.
   */
  markErrorStops(errors: boolean[]) {
    this._stopsDiv.querySelectorAll(".stop").forEach((x, index) => {
      if (errors[index]) {
        x.classList.add("error");
      }
      else {
        x.classList.remove("error");
      }
    })
  }

  /**
   * Returns the width of the stops column in the DOM. Used to calculate the
   * space available to the editor grid.
   */
  clientWidth(): number {
    return this._stopsDiv.getBoundingClientRect().width;
  }
}
