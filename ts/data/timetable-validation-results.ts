import { z } from "zod";
import { repeat } from "../utils";

export class ValidationResults {
  stopErrors: (string | null)[];
  serviceErrors: (string | null)[];
  nextDayThresholds: (number | null)[];
  directions: (string | null)[];
  directionsIcons: (string | null)[];

  constructor(serviceCount: number, stopCount: number) {
    this.stopErrors = repeat(null, stopCount);
    this.serviceErrors = repeat(null, serviceCount);
    this.nextDayThresholds = repeat(null, serviceCount);
    this.directions = repeat(null, serviceCount);
    this.directionsIcons = repeat(null, serviceCount);
  }
  reportStopError(index: number, error: string) {
    this.stopErrors[index] = error;
  }
  reportServiceError(index: number, error: string) {
    this.serviceErrors[index] = error;
  }
  reportServiceDirection(index: number, direction: string, icon: string | null) {
    this.directions[index] = direction;
    this.directionsIcons[index] = icon;
  }
  reportNextDayThreshold(index: number, threshold: number) {
    this.nextDayThresholds[index] = threshold;
  }
  isValid(): boolean {
    return this.stopErrors.every(e => e == null)
      && this.serviceErrors.every(e => e == null)
      && this.directions.every(e => e != null);
  }
  overallError(): string | null {
    let error: string | null = null;
    if (error == null) {
      error = this.stopErrors.find(e => e != null) ?? null;
    }
    if (error == null) {
      error = this.serviceErrors.find(e => e != null) ?? null;
    }

    if (error == null) { return null; }

    const othersCount = this.stopErrors.filter(e => e != null).length +
      this.serviceErrors.filter(e => e != null).length - 1;

    if (othersCount == 0) { return error; }
    else if (othersCount == 1) { return `${error} + 1 other error`; }
    return `${error} + ${othersCount} other errors`;
  }

  toJSON(): ValidationResultsJson {
    return {
      stopErrors: this.stopErrors,
      serviceErrors: this.serviceErrors,
      nextDayThresholds: this.nextDayThresholds,
      directionsIcons: this.directionsIcons
    }
  }
  static fromJSON(json: unknown) {
    const parsedJson = ValidationResultsJson.parse(json);

    const serviceCount = parsedJson.serviceErrors.length;
    const stopCount = parsedJson.stopErrors.length;
    const results = new ValidationResults(serviceCount, stopCount);

    results.stopErrors = parsedJson.stopErrors;
    results.serviceErrors = parsedJson.serviceErrors;
    results.nextDayThresholds = parsedJson.nextDayThresholds;
    results.directionsIcons = parsedJson.directionsIcons;

    return results;
  }
}

export const ValidationResultsJson = z.object({
  stopErrors: z.string().nullable().array(),
  serviceErrors: z.string().nullable().array(),
  nextDayThresholds: z.number().nullable().array(),
  directionsIcons: z.string().nullable().array()
});
export type ValidationResultsJson = z.infer<typeof ValidationResultsJson>;
