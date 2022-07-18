import { z } from "zod";
import { repeat } from "../utils";

/**
 * An object containing the results of validating the a single timetable
 * section, including errors for each stop/service (if they have any), the
 * detected next day thresholds (where the service crosses midnight if
 * applicable), and the specific direction each service runs in.
 */
export class ValidationResults {
  /**
   * A list containing either null or an error message for each stop, where the
   * indices of the list are equivalent to the stop's y-coordinate in the grid.
   */
  stopErrors: (string | null)[];

  /**
   * A list containing either null or an error message for each service, where
   * the indices of the list are equivalent to the service's x-coordinate in the
   * grid.
   */
  serviceErrors: (string | null)[];

  /**
   * A list the detected next day threshold of each service, where the indices
   * of the list are equivalent to the service's x-coordinate in the grid. The
   * list will contain 0 if the service is in "next day" mode, will set the
   * threshold beyond the final y-coordinate if the service never crosses into
   * the next day (like the majority of services), or null if the service has
   * an error that prevented the threshold being calculated.
   */
  nextDayThresholds: (number | null)[];

  /**
   * A list containing the specific running directions for each service, where
   * the indices of the list are equivalent to the service's x-coordinate in the
   * grid, or null if an error prevented the direction being calculated.
   */
  directions: (string | null)[];

  /**
   * A list containing the name of an icon for each service denoting the running
   * direction, where the indices of the list are equivalent to the service's
   * x-coordinate in the grid. Null may be present either when an error
   * prevented the direction being calculated, or simply an icon is not deemed
   * necessary (such as for linear routes where there's only one option)!
   */
  directionsIcons: (string | null)[];

  constructor(serviceCount: number, stopCount: number) {
    this.stopErrors = repeat(null, stopCount);
    this.serviceErrors = repeat(null, serviceCount);
    this.nextDayThresholds = repeat(null, serviceCount);
    this.directions = repeat(null, serviceCount);
    this.directionsIcons = repeat(null, serviceCount);
  }

  /**
   * Report an error related to a stop.
   * @param index The y-coordinate of the stop.
   * @param error The error message.
   */
  reportStopError(index: number, error: string) {
    this.stopErrors[index] = error;
  }

  /**
   * Report an error related to a service.
   * @param index The x-coordinate of the service.
   * @param error The error message.
   */
  reportServiceError(index: number, error: string) {
    this.serviceErrors[index] = error;
  }

  /**
   * Report a service's direction.
   * @param index The x-coordinate of the service.
   * @param direction The specific direction ID.
   * @param icon The name of the associated icon (if appropriate).
   */
  reportServiceDirection(index: number, direction: string, icon: string | null) {
    this.directions[index] = direction;
    this.directionsIcons[index] = icon;
  }

  /**
   * Report the threshold where the service passes to the next day.
   * @param index The x-coordinate of the service.
   * @param threshold The y-coordinate of the threshold (where 0 means before
   * the first stop, 1 means between the first and second stop, etc.)
   */
  reportNextDayThreshold(index: number, threshold: number) {
    this.nextDayThresholds[index] = threshold;
  }

  /**
   * Returns true if no stops or services have any error.
   */
  isValid(): boolean {
    return this.stopErrors.every(e => e == null)
      && this.serviceErrors.every(e => e == null)
      && this.directions.every(e => e != null);
  }

  /**
   * Returns the error message of an error in the timetable, or null if there
   * are no errors. Appends `"+ ${amount} other errors"` to the end if multiple
   * errors are present. This becomes the text seen in status bar of the webapp.
   */
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

  /**
   * Converts the validation results to JSON, primarily so it can be passed back
   * to the main thread from the validation worker.
   */
  toJSON(): ValidationResultsJson {
    return {
      stopErrors: this.stopErrors,
      serviceErrors: this.serviceErrors,
      nextDayThresholds: this.nextDayThresholds,
      directionsIcons: this.directionsIcons
    }
  }

  /**
   * Parses the validation results from JSON, primarily for validation worker
   * purposes.
   * @param json The json object to parse from.
   */
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

/**
 * The Zod schema for parsing validation results from JSON.
 */
export const ValidationResultsJson = z.object({
  stopErrors: z.string().nullable().array(),
  serviceErrors: z.string().nullable().array(),
  nextDayThresholds: z.number().nullable().array(),
  directionsIcons: z.string().nullable().array()
});

/**
 * The typescript type representing validation results as JSON.
 */
export type ValidationResultsJson = z.infer<typeof ValidationResultsJson>;
