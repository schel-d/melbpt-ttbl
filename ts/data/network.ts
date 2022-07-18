export type Stop = {
  id: number,
  name: string,
  platforms: {
    id: string,
    name: string
  }[],
  urlName: string
};
export type Line = {
  id: number,
  name: string,
  color: string,
  service: string,
  routeType: string,
  routeLoopPortal?: string,
  directions: Direction[]
};
export type Direction = {
  id: string,
  name: string,
  stops: number[]
}
export type NetworkApiV1Schema = {
  hash: string,
  stops: Stop[],
  lines: Line[]
}

export class Network {
  private _json: NetworkApiV1Schema;

  constructor(json: NetworkApiV1Schema) {
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

  toJSON() {
    return {
      json: this._json
    };
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromJSON(json: any) {
    // Todo: Use zod to validate incoming json?
    return new Network(json.json);
  }
}

export async function loadNetwork(domain: string): Promise<Network> {
  const api = "network/v1";
  const response = await fetch(`https://${domain}/${api}`)
  if (response.status != 200) {
    throw new Error(`"${domain}" did not respond.`);
  }

  // Todo: Use zod to validate incoming json?
  const json = await response.json() as NetworkApiV1Schema;

  return new Network(json);
}
