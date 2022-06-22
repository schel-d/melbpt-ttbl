import { range, repeat } from "../utils";
import { Network } from "./network";
import { Timetable } from "./timetable";
import { TimetableSection } from "./timetable-section";

export function isValidTimetable(timetable: Timetable, network: Network) {
  return timetable.sections.every(s => validateSection(s, network).isValid())
}
export function validateSection(section: TimetableSection,
  network: Network): ValidationResults {

  const results = new ValidationResults(section.width, section.height);
  checkMissingVals(section, results);

  return results;
}
export function checkMissingVals(section: TimetableSection,
  results: ValidationResults) {

  for (const y of range(0, section.height)) {
    if (range(0, section.width).some(x => section.cell(x, y) == "")) {
      results.reportStopError(y, "Stop has missing values");
    }
  }
}
export class ValidationResults {
  stopErrors: (string | null)[];
  serviceErrors: (string | null)[];
  nextDayThresholds: number[];
  directionsIcons: string[];

  constructor(width: number, height: number) {
    this.stopErrors = repeat(null, height);
    this.serviceErrors = repeat(null, width);
    this.nextDayThresholds = repeat(5, width);
    this.directionsIcons = repeat("jolimont-via-loop", width);
  }
  reportStopError(index: number, error: string) {
    this.stopErrors[index] = error;
  }
  reportServiceError(index: number, error: string) {
    this.serviceErrors[index] = error;
  }
  isValid(): boolean {
    return this.stopErrors.every(e => e == null)
      && this.serviceErrors.every(e => e == null);
  }
  overallError(): string | null {
    let error: string = null;
    if (error == null) { error = this.stopErrors.find(e => e != null); }
    if (error == null) { error = this.serviceErrors.find(e => e != null); }

    if (error == null) { return null; }

    const othersCount = this.stopErrors.filter(e => e != null).length +
      this.serviceErrors.filter(e => e != null).length - 1;

    if (othersCount == 0) { return error; }
    else if (othersCount == 1) { return `${error} + 1 other error`; }
    return `${error} + ${othersCount} other errors`;
  }

  toJSON() {
    return {
      stopErrors: this.stopErrors,
      serviceErrors: this.serviceErrors,
      nextDayThresholds: this.nextDayThresholds,
      directionsIcons: this.directionsIcons
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromJSON(json: any) {
    const results = new ValidationResults(json.serviceErrors.length, json.stopErrors.length);
    results.stopErrors = json.stopErrors;
    results.serviceErrors = json.serviceErrors;
    results.nextDayThresholds = json.nextDayThresholds;
    results.directionsIcons = json.directionsIcons;
    return results;
  }
}
