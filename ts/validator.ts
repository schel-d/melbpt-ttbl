import { Network } from "./data/network";
import { TimetableSection } from "./data/timetable-section";
import { ValidationResults } from "./data/timetable-validation-results";
import { validationWorkerScriptName } from "./main";

/**
 * This callback is run everytime the worker responds with the validation
 * data. This can be used to pass the information on to the editor, which
 * can display the errors on the timetable.
 */
export type ResultsCallback = (results: ValidationResults) => void;

/**
 * Object created on the main thread that manages communications between the
 * main thread and the validation worker. Timetable validation is done off the
 * main thread since it could be a quite taxing process and we don't want to
 * bog down the UI while it runs.
 */
export class Validator {
  private _worker: Worker;
  resultsCallback: ResultsCallback;

  constructor(network: Network, resultsCallback: ResultsCallback) {
    this._worker = new Worker(validationWorkerScriptName);
    this.resultsCallback = resultsCallback;

    // Provide the network object to the validation worker. This is done once
    // (when the network information is downloaded), not each time validation is
    // requested. This makes the data sent each time validation is requested
    // much smaller, because the network information is cached.
    this._worker.postMessage({
      network: network.toJSON()
    });

    // Worker only sends responses to requests for validation, not during
    // initialization. So it's ok to setup this listener after the above
    // postMessage. Therefore, anytime a message is recieved, it will contain
    // validation results that should be sent back.
    this._worker.onmessage = (e) => {
      this.resultsCallback(ValidationResults.fromJSON(e.data));
    };
  }

  /**
   * Ask the validation worker to determine what errors (if any) exist in this
   * timetable section. When validated, the {@link resultsCallback} will be
   * invoked.
   * @param section The timetable section to validate.
   * @param lineID The line ID, needed so the correct line information can be
   * pulled from the network.
   */
  requestValidation(section: TimetableSection, lineID: number) {
    this._worker.postMessage({
      section: section.toJSON(),
      lineID: lineID
    });
  }
}
