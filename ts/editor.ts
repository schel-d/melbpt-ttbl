import { editorDraw } from "./editor-draw"
import { editorInit } from "./editor-init"

export class Editor {
  html: {
    editor: HTMLElement,
    grid: HTMLElement,
    canvas: HTMLCanvasElement,
    context: CanvasRenderingContext2D,
    stops: HTMLElement,
    services: HTMLElement
  }

  content: string[][]

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
  }

  constructor(editorID: string, gridID: string, canvasID: string, stopsID: string, servicesID: string) {
    const editor = document.getElementById(editorID);
    const grid = document.getElementById(gridID);
    const canvas = document.getElementById(canvasID) as HTMLCanvasElement;
    const context = canvas.getContext("2d");
    const stops = document.getElementById(stopsID);
    const services = document.getElementById(servicesID);
    this.html = {
      editor: editor,
      grid: grid,
      canvas: canvas,
      context: context,
      stops: stops,
      services: services,
    };
    this.content = [];
    this.events = {
      mouseOver: null,
      selected: null,
      dragging: false,
    };
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
}
