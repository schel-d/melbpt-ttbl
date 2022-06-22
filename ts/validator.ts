import { Network } from "./data/network";
import { TimetableSection } from "./data/timetable-section";
import { ValidationResults } from "./data/timetable-validation";

export class Validator {
  private _worker: Worker;
  onResults: (results: ValidationResults) => void;

  constructor(scriptName: string) {
    this._worker = new Worker(scriptName);
    this._worker.onmessage = (e) => {
      if (this.onResults) { this.onResults(ValidationResults.fromJSON(e.data)); }
    };
  }

  requestValidation(section: TimetableSection, network: Network) {
    this._worker.postMessage({ section: section.toJSON(), network: network.toJSON() });
  }
}
