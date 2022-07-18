import { z } from "zod";

export class TimetableData {
  private _services: Service[];

  constructor(services: Service[] = []) {
    this._services = services.map(s => s.clone());
  }
  cell(x: number, y: number): string {
    return this._services[x].times[y];
  }
  service(x: number): Service {
    return this._services[x].clone();
  }
  nextDay(x: number): boolean {
    return this._services[x].nextDay;
  }
  map<T>(func: (service: Service, index: number) => T): T[] {
    return this._services.map((s, index) => func(s.clone(), index));
  }
  filter(func: (service: Service, index: number) => boolean): Service[] {
    return this._services.map(s => s.clone()).filter((s, i) => func(s, i));
  }
  addServices(service: Service[], index?: number) {
    if (index == null) { this._services.push(...service.map(s => s.clone())); }
    else { this._services.splice(index, 0, ...service.map(s => s.clone())); }
  }
  deleteServices(start: number, end?: number) {
    if (end == null) {
      this._services.splice(start, 1);
    }
    else {
      this._services.splice(start, end - start);
    }
  }
  replaceService(service: Service, index: number) {
    this._services[index] = service.clone();
  }
  replaceCell(x: number, y: number, val: string) {
    this._services[x].times[y] = val;
  }
  modifyCell(x: number, y: number, func: (cell: string) => string) {
    this._services[x].times[y] = func(this._services[x].times[y]);
  }
  modifyCells(x1: number, y1: number, x2: number, y2: number,
    func: (cell: string, x: number, y: number) => string) {
    for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
      for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
        this._services[x].times[y] = func(this._services[x].times[y], x, y);
      }
    }
  }
  setNextDay(x: number, nextDay: boolean) {
    this._services[x].nextDay = nextDay;
  }
  clone() {
    return new TimetableData(this._services);
  }
  get width() {
    return this._services.length;
  }

  toJSON(): TimetableDataJson {
    return {
      services: this._services.map(x => x.toJSON())
    };
  }
  static fromJSON(json: unknown) {
    const parsedJson = TimetableDataJson.parse(json);
    return new TimetableData(parsedJson.services.map((x: ServiceJson) =>
      Service.fromJSON(x)
    ));
  }
}


export class Service {
  times: string[];
  nextDay: boolean;

  constructor(times: string[], nextDay: boolean) {
    this.times = times;
    this.nextDay = nextDay;
  }
  clone() {
    return new Service([...this.times], this.nextDay);
  }
  toJSON(): ServiceJson {
    return {
      times: this.times,
      nextDay: this.nextDay
    };
  }
  static fromJSON(json: unknown) {
    const parsedJson = ServiceJson.parse(json);
    return new Service(parsedJson.times, parsedJson.nextDay);
  }
}

const ServiceJson = z.object({
  times: z.string().array(),
  nextDay: z.boolean()
});
export const TimetableDataJson = z.object({
  services: ServiceJson.array()
});
export type ServiceJson = z.infer<typeof ServiceJson>;
export type TimetableDataJson = z.infer<typeof TimetableDataJson>;
