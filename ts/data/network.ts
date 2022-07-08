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
  domain: string;
  private _json: NetworkApiV1Schema | null;

  constructor(domain = "api.trainquery.com") {
    this.domain = domain;
    this._json = null;
  }

  async load() {
    const api = "network/v1";
    const response = await fetch(`https://${this.domain}/${api}`)
    if (response.status != 200) {
      throw new Error(`"${this.domain}" did not respond.`);
    }

    // Todo: Use zod to validate incoming json?
    this._json = await response.json() as NetworkApiV1Schema;
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
    return this._json.lines.find(l => l.id == lineID);
  }
  directionsForLine(lineID: number): Direction[] {
    return this._json.lines.find(l => l.id == lineID).directions;
  }

  toJSON() {
    return {
      domain: this.domain,
      json: this._json
    };
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromJSON(json: any) {
    // Todo: Use zod to validate incoming json?
    const network = new Network(json.domain);
    network._json = json.json;
    return network;
  }
}
