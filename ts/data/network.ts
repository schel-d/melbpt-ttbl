import { z } from "zod";

const Stop = z.object({
  id: z.number(),
  name: z.string(),
  platforms: z.object({
    id: z.string(),
    name: z.string()
  }).array(),
  urlName: z.string()
});

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

const NetworkJson = z.object({
  hash: z.string(),
  stops: Stop.array(),
  lines: Line.array(),
});

export type NetworkJson = z.infer<typeof NetworkJson>;
export type Stop = z.infer<typeof Stop>;
export type Line = z.infer<typeof Line>;
export type Direction = z.infer<typeof Line.shape.directions.element>;

export class Network {
  private _json: NetworkJson;

  constructor(json: NetworkJson) {
    this._json = json;
  }

  get lines() {
    if (this._json == null) {
      throw new Error("Network not loaded.");
    }
    return this._json.lines;
  }
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
  line(lineID: number): Line {
    const line = this._json.lines.find(l => l.id == lineID);
    if (line == null) {
      throw new Error(`No train line with the ID "${lineID}"`);
    }
    return line;
  }
  directionsForLine(lineID: number): Direction[] {
    return this.line(lineID).directions;
  }

  toJSON(): NetworkJson {
    return this._json;
  }
  static fromJSON(json: unknown) {
    const parsedJson = NetworkJson.parse(json);
    return new Network(parsedJson);
  }
}

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
