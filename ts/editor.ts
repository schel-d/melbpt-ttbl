import { editorDraw } from "./editor-draw"
import { editorInit } from "./editor-init"
import { Network } from "./network";
import { TimetableSection } from "./timetable";

export class Editor {
  html: {
    editor: HTMLDivElement,
    grid: HTMLDivElement,
    canvas: HTMLCanvasElement,
    context: CanvasRenderingContext2D,
    stops: HTMLDivElement,
    services: HTMLDivElement
  };

  private _section: TimetableSection | null;

  events: {
    mouseOver: {
      x: number,
      y: number
    } | null,
    selected: {
      startX: number,
      startY: number,
      endX: number,
      endY: number
    } | null,
    dragging: boolean
  };

  constructor(editorID: string, gridID: string, canvasID: string,
    stopsID: string, servicesID: string) {

    const editor = document.getElementById(editorID) as HTMLDivElement;
    const grid = document.getElementById(gridID) as HTMLDivElement;
    const canvas = document.getElementById(canvasID) as HTMLCanvasElement;
    const context = canvas.getContext("2d");
    const stops = document.getElementById(stopsID) as HTMLDivElement;
    const services = document.getElementById(servicesID) as HTMLDivElement;
    this.html = {
      editor: editor,
      grid: grid,
      canvas: canvas,
      context: context,
      stops: stops,
      services: services,
    };
    this._section = null;
    this.resetEvents();
  }

  windowResized() {
    this.events.mouseOver = null;
    this.draw();
  }

  init() {
    editorInit(this);
  }

  draw() {
    editorDraw(this);
  }

  clear() {
    this._section = null;
    this.resetEvents();
    this.html.stops.replaceChildren();
    this.draw();
  }

  setSection(section: TimetableSection, network: Network) {
    this._section = section;
    this.resetEvents();
    this.setStops(section.stops, network);
    this.draw();
  }

  get content() {
    if (this._section == null) {
      return [];
    }
    return this._section.grid;
  }
  addContent(content: string[][]) {
    if (this._section == null) {
      throw new Error("No section selected to edit to");
    }
    this._section.grid.push(...content);
    this.draw();
  }

  private setStops(stops: number[], network: Network) {
    this.html.stops.replaceChildren(...stops.map(s => {
      const stop = document.createElement("div");
      stop.className = "stop";

      const stopP = document.createElement("p");
      stopP.textContent = network.stopName(s);
      stop.append(stopP);

      return stop;
    }))
  }
  private resetEvents() {
    this.events = {
      mouseOver: null,
      selected: null,
      dragging: false,
    };
  }
}
