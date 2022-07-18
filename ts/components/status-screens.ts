import { HtmlIDs } from "../main";
import { getDiv } from "../dom-utils";

export class StatusScreens {
  private _status: HTMLDivElement;
  private _statusLoading: HTMLDivElement;
  private _statusReady: HTMLDivElement;

  constructor() {
    this._status = getDiv(HtmlIDs.status);
    this._statusLoading = getDiv(HtmlIDs.statusLoading);
    this._statusReady = getDiv(HtmlIDs.statusReady);
  }
  ready() {
    this._status.classList.remove("gone");
    this._statusLoading.classList.add("gone");
    this._statusReady.classList.remove("gone");
  }
  editing() {
    this._status.classList.add("gone");
  }
}
