export class EditorStops {
  private _stopsDiv: HTMLDivElement;

  constructor(stopsID: string) {
    this._stopsDiv = document.getElementById(stopsID) as HTMLDivElement;
  }

  clear() {
    this.setStops([]);
  }
  setStops(stopNames: string[]) {
    this._stopsDiv.replaceChildren(...stopNames.map(s => {
      const stop = document.createElement("button");
      stop.className = "stop";

      const stopP = document.createElement("p");
      stopP.textContent = s;
      stop.append(stopP);

      return stop;
    }))
  }
  clientWidth() {
    return this._stopsDiv.getBoundingClientRect().width;
  }
}
