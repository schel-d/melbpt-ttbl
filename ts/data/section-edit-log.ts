export abstract class SectionEditLog {
  grid: string[][];
  actionName: string;
  constructor(grid: string[][], actionName: string) {
    this.grid = grid;
    this.actionName = actionName;
  }
}
export class SectionAppendLog extends SectionEditLog {
  startIndex: number;
  amount: number;

  constructor(grid: string[][], actionName: string) {
    super(grid, actionName);
    this.startIndex = this.grid.length;
    this.amount = 0;
  }
  appendServices(services: string[][]) {
    this.grid.push(...services);
    this.amount += services.length;
  }
}
export class SectionDeleteLog extends SectionEditLog {
  originalIndices: number[];
  private _indicesMap: number[];

  constructor(grid: string[][], actionName: string) {
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
  constructor(grid: string[][], actionName: string) {
    super(grid, actionName);
    this.rowsEdited = [];
    this.colsEdited = [];
  }
  replaceCell(x: number, y: number, newVal: string) {
    this.grid[x][y] = newVal;
    if (!this.colsEdited.includes(x)) { this.rowsEdited.push(x); }
    if (!this.rowsEdited.includes(y)) { this.rowsEdited.push(y); }
  }
  modifyCell(x: number, y: number, modFunc: (currentVal: string) => string) {
    this.replaceCell(x, y, modFunc(this.grid[x][y]));
  }
  modifyCells(x1: number, y1: number, x2: number, y2: number,
    modFunc: (currentVal: string, x: number, y: number) => string) {

    for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
      for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
        this.replaceCell(x, y, modFunc(this.grid[x][y], x, y));
      }
    }
  }
}
