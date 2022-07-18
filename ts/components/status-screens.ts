import { HtmlIDs } from "../main";
import { getDiv } from "../dom-utils";

/**
 * Responsible for showing/hiding the screens that tell the user when the webapp
 * is loading or ready to use.
 */
export class StatusScreens {
  private _status: HTMLDivElement;
  private _statusLoading: HTMLDivElement;
  private _statusReady: HTMLDivElement;

  constructor() {
    this._status = getDiv(HtmlIDs.status);
    this._statusLoading = getDiv(HtmlIDs.statusLoading);
    this._statusReady = getDiv(HtmlIDs.statusReady);
  }

  /**
   * Shows the "ready" screen.
   */
  ready() {
    this._status.classList.remove("gone");
    this._statusLoading.classList.add("gone");
    this._statusReady.classList.remove("gone");
  }

  /**
   * Hide everything to allow space for the editor.
   */
  editing() {
    this._status.classList.add("gone");
  }
}
