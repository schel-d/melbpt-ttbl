import { range, repeat } from "../utils";
import { TimetableSection } from "./timetable";

export class ValidationEngine {
  private _section: TimetableSection;

  serviceErrors: (string | null)[];
  serviceDirections: (string | null)[];
  serviceNextDaySplitIndex: number[];
  stopErrors: (string | null)[];

  constructor(section: TimetableSection) {
    this._section = section;

    this.serviceErrors = repeat(null, section.width);
    this.serviceDirections = repeat(null, section.width);
    this.serviceNextDaySplitIndex = repeat(section.height, section.width);
    this.stopErrors = repeat(null, section.height);

    this.revalidateServices(range(0, section.width));
    this.revalidateStops(range(0, section.height));
  }
  revalidateServices(indices: number[]) {
    // todo: do stuff
  }
  removeServices(indices: number[]) {
    const sortedIndices = [...indices].sort((a, b) => b - a);
    sortedIndices.forEach(i => {
      this.serviceErrors.splice(i, 0);
      this.serviceDirections.splice(i, 0);
      this.serviceNextDaySplitIndex.splice(i, 0);
    });
  }
  revalidateStops(indices: number[]) {
    indices.forEach(i => {
      const missingVals = this._section.grid.some(s => s.times[i] == "");
      this.stopErrors[i] = missingVals ? "Stop has missing values" : null;
    })
  }
  errorMessage(): string | null {
    const additionalErrorCount = this.stopErrors.filter(e => e != null).length +
      this.serviceErrors.filter(e => e != null).length - 1;
    const errorCountSuffix = additionalErrorCount == 0 ? "" :
      ` + ${additionalErrorCount} other ${additionalErrorCount == 1 ? "error" : "errors"}`;

    const stopError = this.stopErrors.find(e => e != null);
    if (stopError != null) {
      return stopError + errorCountSuffix;
    }
    const serviceError = this.serviceErrors.find(e => e != null);
    if (serviceError != null) {
      return serviceError + errorCountSuffix;
    }
    return null;
  }
}
