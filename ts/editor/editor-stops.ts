export class EditorStops {
  private _stopsDiv: HTMLDivElement;

  stopClicked: (index: number) => void;

  constructor(stopsID: string) {
    this._stopsDiv = document.getElementById(stopsID) as HTMLDivElement;
  }

  clear() {
    this.setStops([]);
  }
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
  clientWidth() {
    return this._stopsDiv.getBoundingClientRect().width;
  }
}
