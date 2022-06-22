import { range } from "../utils";
import { Service } from "./timetable";

export abstract class SectionEditLog {
  grid: Service[];
  undoGrid: Service[];
  actionName: string;
  constructor(grid: Service[], actionName: string) {
    this.grid = cloneGrid(grid);
    this.undoGrid = cloneGrid(grid);
    this.actionName = actionName;
  }
}
export class SectionAppendLog extends SectionEditLog {
  startIndex: number;
  amount: number;

  constructor(grid: Service[], actionName: string) {
    super(grid, actionName);
    this.startIndex = this.grid.length;
    this.amount = 0;
  }
  appendServices(services: string[][]) {
    this.grid.push(...toGrid(services));
    this.amount += services.length;
  }
}
export class SectionDeleteLog extends SectionEditLog {
  originalIndices: number[];
  private _indicesMap: number[];

  constructor(grid: Service[], actionName: string) {
    super(grid, actionName);
    this.originalIndices = [];
    this._indicesMap = grid.map((_, index) => index);
  }
  deleteService(index: number) {
    this.grid.splice(index, 1);
    this.originalIndices.push(...this._indicesMap.splice(index, 1));
  }
  deleteServices(start: number, end: number) {
    this.grid.splice(start, end - start);
    this.originalIndices.push(...this._indicesMap.splice(start, end - start));
  }
}
export class SectionModifyLog extends SectionEditLog {
  rowsEdited: number[];
  colsEdited: number[];
  constructor(grid: Service[], actionName: string) {
    super(grid, actionName);
    this.rowsEdited = [];
    this.colsEdited = [];
  }
  replaceCell(x: number, y: number, newVal: string) {
    this.grid[x].times[y] = newVal;
    if (!this.colsEdited.includes(x)) { this.colsEdited.push(x); }
    if (!this.rowsEdited.includes(y)) { this.rowsEdited.push(y); }
  }
  replaceService(x: number, service: Service) {
    this.grid[x] = cloneService(service);
    if (!this.colsEdited.includes(x)) { this.colsEdited.push(x); }
    this.rowsEdited.push(...range(0, this.grid[0].times.length));
  }
  modifyCell(x: number, y: number, modFunc: (currentVal: string) => string) {
    this.replaceCell(x, y, modFunc(this.grid[x].times[y]));
  }
  modifyCells(x1: number, y1: number, x2: number, y2: number,
    modFunc: (currentVal: string, x: number, y: number) => string) {

    for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
      for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
        this.replaceCell(x, y, modFunc(this.grid[x].times[y], x, y));
      }
    }
  }
  modifyNextDay(x1: number, x2: number, value: boolean) {
    range(Math.min(x1, x2), Math.max(x1, x2) + 1).forEach(x => {
      this.grid[x].nextDay = value;
      if (!this.colsEdited.includes(x)) { this.colsEdited.push(x); }
    });
    this.rowsEdited.push(...range(0, this.grid[0].times.length));
  }
}

export function cloneGrid(grid: Service[]): Service[] {
  return grid.map(s => cloneService(s));
}
export function cloneService(service: Service): Service {
  return { times: [...service.times], nextDay: service.nextDay };
}
export function toGrid(content: string[][]): Service[] {
  return content.map(t => toService(t));
}
export function toService(times: string[]): Service {
  return { times: [...times], nextDay: false };
}
