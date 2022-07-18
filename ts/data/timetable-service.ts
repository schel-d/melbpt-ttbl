import { z } from "zod";

/**
 * Represents a single service within the timetable data.
 */
export class Service {
  times: string[];
  nextDay: boolean;

  constructor(times: string[], nextDay: boolean) {
    this.times = times;
    this.nextDay = nextDay;
  }

  /**
   * Returns a clone of this service.
   */
  clone(): Service {
    return new Service([...this.times], this.nextDay);
  }

  /**
   * Converts this service to JSON, primarily for validation worker purposes.
   */
  toJSON(): ServiceJson {
    return {
      times: this.times,
      nextDay: this.nextDay
    };
  }

  /**
   * Parses a service from the given JSON object, primarily for validation
   * worker purposes.
   * @param json The JSON object to parse from.
   */
  static fromJSON(json: unknown): Service {
    const parsedJson = ServiceJson.parse(json);
    return new Service(parsedJson.times, parsedJson.nextDay);
  }
}

/**
 * The Zod schema for parsing a service from JSON.
 */
export const ServiceJson = z.object({
  times: z.string().array(),
  nextDay: z.boolean()
});

/**
 * The typescript type representing a service as JSON.
 */
export type ServiceJson = z.infer<typeof ServiceJson>;
