type NetworkApiV1Schema = {
  hash: string,
  stops: {
    id: number,
    name: string,
    platforms: {
      id: string,
      name: string
    }[],
    urlName: string
  }[],
  lines: {
    id: number,
    name: string,
    color: string,
    service: string,
    routeType: string,
    directions: {
      id: string,
      name: string,
      stops: number[]
    }[]
  }[]
}

export class Network {
  domain: string;
  json: NetworkApiV1Schema | null;
  constructor(domain = "api.trainarrives.in") {
    this.domain = domain;
    this.json = null;
  }
  async load() {
    const api = "network/v1";
    const response = await fetch(`https://${this.domain}/${api}`)
    if (response.status != 200) {
      throw new Error(`"${this.domain}" did not respond.`);
    }
    this.json = await response.json() as NetworkApiV1Schema;
  }
  get lines() {
    if (this.json == null) {
      throw new Error("Network not loaded.");
    }
    return this.json.lines;
  }
}
