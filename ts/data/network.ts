import { z } from "zod";

/**
 * The Zod schema to parse the json for each stop in the network.
 */
const Stop = z.object({
  id: z.number(),
  name: z.string(),
  platforms: z.object({
    id: z.string(),
    name: z.string()
  }).array(),
  urlName: z.string()
});

/**
 * The Zod schema to parse the json for each line in the network.
 */
const Line = z.object({
  id: z.number(),
  name: z.string(),
  color: z.enum(["red", "yellow", "green", "cyan", "blue", "purple", "pink", "grey"]),
  service: z.enum(["suburban", "regional"]),
  routeType: z.enum(["linear", "city-loop", "branch"]),
  routeLoopPortal: z.enum(["richmond", "jolimont", "north-melbourne"]).optional(),

  directions: z.object({
    id: z.string(),
    name: z.string(),
    stops: z.number().array()
  }).array()
});

/**
 * The Zod schema to parse the network json returned from the API.
 */
const NetworkJson = z.object({
  hash: z.string(),
  stops: Stop.array(),
  lines: Line.array(),
});

/**
 * The typescript type representing network data as JSON.
 */
export type NetworkJson = z.infer<typeof NetworkJson>;

/**
 * The typescript type representing a stop as JSON.
 */
export type Stop = z.infer<typeof Stop>;

/**
 * The typescript type representing a line as JSON.
 */
export type Line = z.infer<typeof Line>;

/**
 * The typescript type representing a direction as JSON.
 */
export type Direction = z.infer<typeof Line.shape.directions.element>;

/**
 * An interface for accessing network information returned from the API.
 */
export class Network {
  private _json: NetworkJson;

  constructor(json: NetworkJson) {
    this._json = json;
  }

  /**
   * Returns the complete list of lines in the network.
   */
  get lines() {
    return this._json.lines;
  }

  /**
   * Returns the name of the stop given its numeric ID.
   * @param stop The numeric ID of the stop.
   */
  stopName(stop: number) {
    if (this._json == null) {
      throw new Error("Network not loaded.");
    }
    const stopObj = this._json.stops.find(s => s.id === stop);
    if (stopObj == null) {
      throw new Error(`No stop with id=${stop}`);
    }
    return stopObj.name;
  }

  /**
   * Returns all the information provided by the API for a particular line,
   * given its numeric ID.
   * @param lineID The numeric ID of the line.
   */
  line(lineID: number): Line {
    const line = this._json.lines.find(l => l.id == lineID);
    if (line == null) {
      throw new Error(`No train line with the ID "${lineID}"`);
    }
    return line;
  }

  /**
   * Returns the complete list of directions and their relevant information
   * provided by the API for a particular line, given its numeric ID.
   * @param lineID The numeric ID of the line.
   */
  directionsForLine(lineID: number): Direction[] {
    return this.line(lineID).directions;
  }

  /**
   * Convert this object to JSON (primarily for the validation worker).
   */
  toJSON(): NetworkJson {
    return this._json;
  }

  /**
   * Parse this object from JSON. This is primarily for the validation worker,
   * use {@link loadNetwork} to load the network from the API.
   * @param json The JSON object to parse.
   */
  static fromJSON(json: unknown): Network {
    const parsedJson = NetworkJson.parse(json);
    return new Network(parsedJson);
  }
}

/**
 * Loads the network information from the API, given the domain name.
 * @param domain The domain (including subdomain) of the API server.
 */
export async function loadNetwork(domain: string): Promise<Network> {
  const api = "network/v1";
  const response = await fetch(`https://${domain}/${api}`)
  if (response.status != 200) {
    throw new Error(`"${domain}" did not respond.`);
  }

  const json = await response.json();

  try {
    const parsedJson = NetworkJson.parse(json);
    return new Network(parsedJson);
  }
  catch (ex) {
    throw new Error("The API responded in an unexpected format");
  }
}
