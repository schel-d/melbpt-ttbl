(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.css = void 0;
exports.css = (() => {
    return {
        text: "hsla(220deg, 100%, 4%, 0.8)",
        paper10: "hsl(220deg, 30%, 93.5%)",
        accent: "#00a5ca",
        hoverHighlight: "hsla(220deg, 100%, 18%, 0.1)",
    };
})();
},{}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.editorDraw = exports.COL_SIZE = exports.ROW_SIZE = void 0;
const css_1 = require("./css");
exports.ROW_SIZE = 20;
exports.COL_SIZE = 48;
const TEXT_OFFSET_X = 7;
const TEXT_OFFSET_Y = 14;
function editorDraw(editor) {
    var _a, _b;
    const canvas = editor.html.canvas;
    const context = editor.html.context;
    const content = editor.content;
    const cols = content.length;
    const rows = (_b = (_a = content[0]) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0;
    if (content.some((c) => c.length !== rows)) {
        throw "Grid is jagged (some columns have more rows than others)";
    }
    const dpiRatio = calculateDpiRatio(context);
    const cells = getOnScreenCells(editor, rows, cols);
    // Set the container holding the canvas to the full size (makes the scrollbar
    // work properly)
    editor.html.grid.style.width = exports.COL_SIZE * cols + "px";
    editor.html.grid.style.height = exports.ROW_SIZE * rows + "px";
    // Make the canvas big enough to fit only the cells actually on screen
    // Shift the canvas within it's parent so when it's scrolled, it still appears
    // on screen despite its smaller size
    canvas.width = exports.COL_SIZE * cells.width * dpiRatio;
    canvas.height = exports.ROW_SIZE * cells.height * dpiRatio;
    canvas.style.width = exports.COL_SIZE * cells.width + "px";
    canvas.style.height = exports.ROW_SIZE * cells.height + "px";
    canvas.style.left = exports.COL_SIZE * cells.x1 + "px";
    canvas.style.top = exports.ROW_SIZE * cells.y1 + "px";
    // Clear the canvas, and transform the coordinate space to account for the
    // scrolling
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.translate(-cells.x1 * exports.COL_SIZE * dpiRatio, -cells.y1 * exports.ROW_SIZE * dpiRatio);
    context.scale(dpiRatio, dpiRatio);
    // Render a lighter background for every second row
    context.fillStyle = css_1.css.paper10;
    for (let y = cells.y1; y < cells.y2; y++) {
        if (y % 2 != 0) {
            continue;
        }
        context.fillRect(cells.x1 * exports.COL_SIZE, y * exports.ROW_SIZE, cells.width * exports.COL_SIZE, exports.ROW_SIZE);
    }
    // Render the text for each cell
    context.font = "0.7rem 'Roboto Mono', monospace";
    context.fillStyle = css_1.css.text;
    for (let x = cells.x1; x < cells.x2; x++) {
        for (let y = cells.y1; y < cells.y2; y++) {
            const str = content[x][y];
            context.fillText(str, x * exports.COL_SIZE + TEXT_OFFSET_X, y * exports.ROW_SIZE + TEXT_OFFSET_Y);
        }
    }
    // Render a highlight on the cell that the mouse is over
    context.fillStyle = css_1.css.hoverHighlight;
    const mouseOver = editor.events.mouseOver;
    if (mouseOver != null) {
        context.fillRect(mouseOver.x * exports.COL_SIZE, mouseOver.y * exports.ROW_SIZE, exports.COL_SIZE, exports.ROW_SIZE);
    }
    // Render a border on the cell that is selected
    context.lineWidth = Math.round(1.5 * dpiRatio) / dpiRatio;
    context.strokeStyle = css_1.css.accent;
    const selected = editor.events.selected;
    if (selected != null) {
        const x1 = Math.min(selected.startX, selected.endX);
        const w = Math.max(selected.startX, selected.endX) - x1 + 1;
        const y1 = Math.min(selected.startY, selected.endY);
        const h = Math.max(selected.startY, selected.endY) - y1 + 1;
        context.strokeRect(x1 * exports.COL_SIZE, y1 * exports.ROW_SIZE, w * exports.COL_SIZE, h * exports.ROW_SIZE);
    }
}
exports.editorDraw = editorDraw;
;
function getOnScreenCells(editor, rows, cols) {
    const editorSize = editor.html.editor.getBoundingClientRect();
    const gridScreenX = editor.html.stops.getBoundingClientRect().width;
    const gridScreenY = editor.html.services.getBoundingClientRect().height;
    const gridWidth = editorSize.width - gridScreenX;
    const gridHeight = editorSize.height - gridScreenY;
    const scrollX = editor.html.editor.scrollLeft;
    const scrollY = editor.html.editor.scrollTop;
    const startRow = Math.max(0, Math.floor(scrollY / exports.ROW_SIZE));
    const endRow = Math.min(rows, startRow + Math.ceil(gridHeight / exports.ROW_SIZE) + 1);
    const rowsHigh = endRow - startRow;
    const startCol = Math.max(0, Math.floor(scrollX / exports.COL_SIZE));
    const endCol = Math.min(cols, startCol + Math.ceil(gridWidth / exports.COL_SIZE) + 1);
    const colsWide = endCol - startCol;
    return {
        x1: startCol,
        x2: endCol,
        y1: startRow,
        y2: endRow,
        width: colsWide,
        height: rowsHigh,
    };
}
;
function calculateDpiRatio(gridCanvas2d) {
    const dpr = window.devicePixelRatio || 1;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const bsr = gridCanvas2d.backingStorePixelRatio || 1;
    return dpr / bsr;
}
;
},{"./css":1}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.editorInit = void 0;
const editor_draw_1 = require("./editor-draw");
function editorInit(editor) {
    editor.draw();
    editor.html.canvas.addEventListener("mousedown", (e) => {
        const m = relativeCoords(e, editor);
        editor.events.selected = { startX: m.x, startY: m.y, endX: m.x, endY: m.y };
        editor.events.dragging = true;
        editor.draw();
    });
    editor.html.canvas.addEventListener("mouseup", (e) => {
        const m = relativeCoords(e, editor);
        editor.events.selected.endX = m.x;
        editor.events.selected.endY = m.y;
        editor.events.dragging = false;
        editor.draw();
    });
    editor.html.canvas.addEventListener("mousemove", (e) => canvasMouseMoveEvent(e, editor));
    editor.html.canvas.addEventListener("mouseenter", (e) => canvasMouseMoveEvent(e, editor));
    editor.html.canvas.addEventListener("mouseleave", () => {
        editor.events.mouseOver = null;
        editor.draw();
    });
    editor.html.editor.addEventListener("scroll", () => {
        editor.events.mouseOver = null;
        editor.draw();
    });
    // Make the scrollwheel cause horizontal scrolling in the editor, not vertical
    // Firefox is 'DOMMouseScroll' and basically everything else is 'mousewheel'
    editor.html.editor.addEventListener("mousewheel", (e) => editorScrollEvent(e, editor), false);
    editor.html.editor.addEventListener("DOMMouseScroll", (e) => editorScrollEvent(e, editor), false);
    document.addEventListener("paste", (e) => {
        const clipboardText = e.clipboardData.getData('text');
        console.log(clipboardText);
        e.preventDefault();
    });
}
exports.editorInit = editorInit;
;
function editorScrollEvent(e, editor) {
    e = window.event || e;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const wheelEvent = e;
    const delta = Math.max(-1, Math.min(1, wheelEvent.wheelDelta || -wheelEvent.detail));
    editor.html.editor.scrollLeft -= delta * 64;
    e.preventDefault();
}
;
function canvasMouseMoveEvent(e, editor) {
    editor.events.mouseOver = relativeCoords(e, editor);
    if (editor.events.dragging) {
        if (e.buttons != 1) {
            editor.events.dragging = false;
        }
        else {
            editor.events.selected.endX = editor.events.mouseOver.x;
            editor.events.selected.endY = editor.events.mouseOver.y;
        }
    }
    editor.draw();
}
;
function relativeCoords(e, editor) {
    const bounds = editor.html.grid.getBoundingClientRect();
    const x = e.clientX - bounds.left;
    const y = e.clientY - bounds.top;
    return {
        x: Math.floor(x / editor_draw_1.COL_SIZE),
        y: Math.floor(y / editor_draw_1.ROW_SIZE),
    };
}
;
},{"./editor-draw":2}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Editor = void 0;
const editor_draw_1 = require("./editor-draw");
const editor_init_1 = require("./editor-init");
class Editor {
    constructor(editorID, gridID, canvasID, stopsID, servicesID) {
        const editor = document.getElementById(editorID);
        const grid = document.getElementById(gridID);
        const canvas = document.getElementById(canvasID);
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
        this._content = [];
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
        (0, editor_init_1.editorInit)(this);
    }
    draw() {
        (0, editor_draw_1.editorDraw)(this);
    }
    set content(newContent) {
        this._content = newContent;
        this.draw();
    }
    get content() {
        return this._content;
    }
}
exports.Editor = Editor;
},{"./editor-draw":2,"./editor-init":3}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const editor_1 = require("./editor");
const network_1 = require("./network");
const new_timetable_dialog_1 = require("./new-timetable-dialog");
// Todo: Fix bug causing layout before CSS is loaded, especially apparent when
// using throttled connections without caching in DevTools.
const editor = new editor_1.Editor("editor", "grid", "grid-canvas", "stops", "services");
editor.init();
window.addEventListener("resize", () => editor.windowResized());
const network = new network_1.Network();
network.load().then(() => {
    showWelcome();
});
(0, new_timetable_dialog_1.setup)();
document.querySelector("#new-timetable-button").addEventListener("click", () => {
    (0, new_timetable_dialog_1.show)(network);
});
function showWelcome() {
    // Clear the editor and hide the loading screen.
    editor.content = [];
    document.querySelector("#status-loading").classList.add("gone");
    // Hide loading screen and enable header buttons for new timetable and import.
    document.querySelector("#status").classList.remove("gone");
    document.querySelector("#status-ready").classList.remove("gone");
    document.querySelector("#new-timetable-button").disabled = false;
    document.querySelector("#import-button").disabled = false;
}
// function showEditor() {
//   // Todo: Hide the welcome/loading screens, populate the sections in the
//   // header. Maybe even enable the "export" button?
//   document.querySelector("#status-loading").classList.add("gone");
//   document.querySelector("#status-ready").classList.add("gone");
//   document.querySelector("#status").classList.add("gone");
//   (document.querySelector("#new-timetable-button") as HTMLButtonElement).disabled = false;
//   (document.querySelector("#import-button") as HTMLButtonElement).disabled = false;
//   (document.querySelector("#export-button") as HTMLButtonElement).disabled = false;
//   const content: string[][] = [];
//   for (let x = 0; x < 50; x++) {
//     content[x] = [];
//     for (let y = 0; y < 30; y++) {
//       content[x][y] = "00:00";
//     }
//   }
//   editor.content = content;
// }
},{"./editor":4,"./network":6,"./new-timetable-dialog":7}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Network = void 0;
class Network {
    constructor(domain = "api.trainarrives.in") {
        this.domain = domain;
        this.json = null;
    }
    async load() {
        const api = "network/v1";
        const response = await fetch(`https://${this.domain}/${api}`);
        if (response.status != 200) {
            throw new Error(`"${this.domain}" did not respond.`);
        }
        this.json = await response.json();
    }
    get lines() {
        if (this.json == null) {
            throw new Error("Network not loaded.");
        }
        return this.json.lines;
    }
}
exports.Network = Network;
},{}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.show = exports.setup = void 0;
// HTML IDs for dialog elements.
const dialogID = "#new-timetable-dialog";
const cancelButtonID = "#new-timetable-dialog-cancel";
const submitButtonID = "#new-timetable-dialog-submit";
const linesSelectID = "#new-timetable-dialog-lines";
function setup() {
    // Close dialog on cancel button (note that ESC key can also close dialogs).
    document.querySelector(cancelButtonID).addEventListener("click", () => {
        // Required to cast to any since typescript does not know about showModal().
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const dialog = document.querySelector(dialogID);
        dialog.close();
    });
    // Close dialog on submit button.
    document.querySelector(submitButtonID).addEventListener("click", () => {
        // Required to cast to any since typescript does not know about showModal().
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const dialog = document.querySelector(dialogID);
        dialog.close();
    });
}
exports.setup = setup;
function show(network) {
    // Sort lines by name alphabetical order.
    const lines = [...network.lines].sort((a, b) => a.name.localeCompare(b.name));
    // Required to cast to any since typescript does not know about showModal().
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dialog = document.querySelector(dialogID);
    // Remove all existing options from lines select, and add each line as an
    // option.
    const select = document.querySelector(linesSelectID);
    while (select.lastChild) {
        select.removeChild(select.lastChild);
    }
    lines.map(line => {
        const option = new Option(line.name, line.id.toString());
        select.appendChild(option);
    });
    dialog.showModal();
}
exports.show = show;
},{}]},{},[5])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJ0cy9jc3MudHMiLCJ0cy9lZGl0b3ItZHJhdy50cyIsInRzL2VkaXRvci1pbml0LnRzIiwidHMvZWRpdG9yLnRzIiwidHMvbWFpbi50cyIsInRzL25ldHdvcmsudHMiLCJ0cy9uZXctdGltZXRhYmxlLWRpYWxvZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7OztBQ0FhLFFBQUEsR0FBRyxHQUFHLENBQUMsR0FBRyxFQUFFO0lBQ3ZCLE9BQU87UUFDTCxJQUFJLEVBQUUsNkJBQTZCO1FBQ25DLE9BQU8sRUFBRSx5QkFBeUI7UUFDbEMsTUFBTSxFQUFFLFNBQVM7UUFDakIsY0FBYyxFQUFFLDhCQUE4QjtLQUMvQyxDQUFDO0FBQ0osQ0FBQyxDQUFDLEVBQUUsQ0FBQzs7Ozs7QUNOTCwrQkFBNEI7QUFFZixRQUFBLFFBQVEsR0FBRyxFQUFFLENBQUM7QUFDZCxRQUFBLFFBQVEsR0FBRyxFQUFFLENBQUM7QUFDM0IsTUFBTSxhQUFhLEdBQUcsQ0FBQyxDQUFDO0FBQ3hCLE1BQU0sYUFBYSxHQUFHLEVBQUUsQ0FBQztBQUV6QixTQUFnQixVQUFVLENBQUMsTUFBYzs7SUFDdkMsTUFBTSxNQUFNLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUM7SUFDbEMsTUFBTSxPQUFPLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUM7SUFDcEMsTUFBTSxPQUFPLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQztJQUUvQixNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDO0lBQzVCLE1BQU0sSUFBSSxHQUFHLE1BQUEsTUFBQSxPQUFPLENBQUMsQ0FBQyxDQUFDLDBDQUFFLE1BQU0sbUNBQUksQ0FBQyxDQUFDO0lBQ3JDLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sS0FBSyxJQUFJ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LEVBQUUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1FBQ3pELE1BQU0sQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDN0IsQ0FBQyxDQUFDLENBQUE7SUFFRixNQUFNLENBQUMsU0FBUyxFQUFFLENBQUM7QUFDckIsQ0FBQztBQWxCRCxvQkFrQkMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJleHBvcnQgY29uc3QgY3NzID0gKCgpID0+IHtcclxuICByZXR1cm4ge1xyXG4gICAgdGV4dDogXCJoc2xhKDIyMGRlZywgMTAwJSwgNCUsIDAuOClcIixcclxuICAgIHBhcGVyMTA6IFwiaHNsKDIyMGRlZywgMzAlLCA5My41JSlcIixcclxuICAgIGFjY2VudDogXCIjMDBhNWNhXCIsXHJcbiAgICBob3ZlckhpZ2hsaWdodDogXCJoc2xhKDIyMGRlZywgMTAwJSwgMTglLCAwLjEpXCIsXHJcbiAgfTtcclxufSkoKTtcclxuIiwiaW1wb3J0IHsgRWRpdG9yIH0gZnJvbSBcIi4vZWRpdG9yXCI7XHJcbmltcG9ydCB7IGNzcyB9IGZyb20gXCIuL2Nzc1wiO1xyXG5cclxuZXhwb3J0IGNvbnN0IFJPV19TSVpFID0gMjA7XHJcbmV4cG9ydCBjb25zdCBDT0xfU0laRSA9IDQ4O1xyXG5jb25zdCBURVhUX09GRlNFVF9YID0gNztcclxuY29uc3QgVEVYVF9PRkZTRVRfWSA9IDE0O1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGVkaXRvckRyYXcoZWRpdG9yOiBFZGl0b3IpIHtcclxuICBjb25zdCBjYW52YXMgPSBlZGl0b3IuaHRtbC5jYW52YXM7XHJcbiAgY29uc3QgY29udGV4dCA9IGVkaXRvci5odG1sLmNvbnRleHQ7XHJcbiAgY29uc3QgY29udGVudCA9IGVkaXRvci5jb250ZW50O1xyXG5cclxuICBjb25zdCBjb2xzID0gY29udGVudC5sZW5ndGg7XHJcbiAgY29uc3Qgcm93cyA9IGNvbnRlbnRbMF0/Lmxlbmd0aCA/PyAwO1xyXG4gIGlmIChjb250ZW50LnNvbWUoKGMpID0+IGMubGVuZ3RoICE9PSByb3dzKSkge1xyXG4gICAgdGhyb3cgXCJHcmlkIGlzIGphZ2dlZCAoc29tZSBjb2x1bW5zIGhhdmUgbW9yZSByb3dzIHRoYW4gb3RoZXJzKVwiO1xyXG4gIH1cclxuXHJcbiAgY29uc3QgZHBpUmF0aW8gPSBjYWxjdWxhdGVEcGlSYXRpbyhjb250ZXh0KTtcclxuICBjb25zdCBjZWxscyA9IGdldE9uU2NyZWVuQ2VsbHMoZWRpdG9yLCByb3dzLCBjb2xzKTtcclxuXHJcbiAgLy8gU2V0IHRoZSBjb250YWluZXIgaG9sZGluZyB0aGUgY2FudmFzIHRvIHRoZSBmdWxsIHNpemUgKG1ha2VzIHRoZSBzY3JvbGxiYXJcclxuICAvLyB3b3JrIHByb3Blcmx5KVxyXG4gIGVkaXRvci5odG1sLmdyaWQuc3R5bGUud2lkdGggPSBDT0xfU0laRSAqIGNvbHMgKyBcInB4XCI7XHJcbiAgZWRpdG9yLmh0bWwuZ3JpZC5zdHlsZS5oZWlnaHQgPSBST1dfU0laRSAqIHJvd3MgKyBcInB4XCI7XHJcblxyXG4gIC8vIE1ha2UgdGhlIGNhbnZhcyBiaWcgZW5vdWdoIHRvIGZpdCBvbmx5IHRoZSBjZWxscyBhY3R1YWxseSBvbiBzY3JlZW5cclxuICAvLyBTaGlmdCB0aGUgY2FudmFzIHdpdGhpbiBpdCdzIHBhcmVudCBzbyB3aGVuIGl0J3Mgc2Nyb2xsZWQsIGl0IHN0aWxsIGFwcGVhcnNcclxuICAvLyBvbiBzY3JlZW4gZGVzcGl0ZSBpdHMgc21hbGxlciBzaXplXHJcbiAgY2FudmFzLndpZHRoID0gQ09MX1NJWkUgKiBjZWxscy53aWR0aCAqIGRwaVJhdGlvO1xyXG4gIGNhbnZhcy5oZWlnaHQgPSBST1dfU0laRSAqIGNlbGxzLmhlaWdodCAqIGRwaVJhdGlvO1xyXG4gIGNhbnZhcy5zdHlsZS53aWR0aCA9IENPTF9TSVpFICogY2VsbHMud2lkdGggKyBcInB4XCI7XHJcbiAgY2FudmFzLnN0eWxlLmhlaWdodCA9IFJPV19TSVpFICogY2VsbHMuaGVpZ2h0ICsgXCJweFwiO1xyXG4gIGNhbnZhcy5zdHlsZS5sZWZ0ID0gQ09MX1NJWkUgKiBjZWxscy54MSArIFwicHhcIjtcclxuICBjYW52YXMuc3R5bGUudG9wID0gUk9XX1NJWkUgKiBjZWxscy55MSArIFwicHhcIjtcclxuXHJcbiAgLy8gQ2xlYXIgdGhlIGNhbnZhcywgYW5kIHRyYW5zZm9ybSB0aGUgY29vcmRpbmF0ZSBzcGFjZSB0byBhY2NvdW50IGZvciB0aGVcclxuICAvLyBzY3JvbGxpbmdcclxuICBjb250ZXh0LmNsZWFyUmVjdCgwLCAwLCBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpO1xyXG4gIGNvbnRleHQudHJhbnNsYXRlKFxyXG4gICAgLWNlbGxzLngxICogQ09MX1NJWkUgKiBkcGlSYXRpbyxcclxuICAgIC1jZWxscy55MSAqIFJPV19TSVpFICogZHBpUmF0aW9cclxuICApO1xyXG4gIGNvbnRleHQuc2NhbGUoZHBpUmF0aW8sIGRwaVJhdGlvKTtcclxuXHJcbiAgLy8gUmVuZGVyIGEgbGlnaHRlciBiYWNrZ3JvdW5kIGZvciBldmVyeSBzZWNvbmQgcm93XHJcbiAgY29udGV4dC5maWxsU3R5bGUgPSBjc3MucGFwZXIxMDtcclxuICBmb3IgKGxldCB5ID0gY2VsbHMueTE7IHkgPCBjZWxscy55MjsgeSsrKSB7XHJcbiAgICBpZiAoeSAlIDIgIT0gMCkge1xyXG4gICAgICBjb250aW51ZTtcclxuICAgIH1cclxuICAgIGNvbnRleHQuZmlsbFJlY3QoXHJcbiAgICAgIGNlbGxzLngxICogQ09MX1NJWkUsXHJcbiAgICAgIHkgKiBST1dfU0laRSxcclxuICAgICAgY2VsbHMud2lkdGggKiBDT0xfU0laRSxcclxuICAgICAgUk9XX1NJWkVcclxuICAgICk7XHJcbiAgfVxyXG5cclxuICAvLyBSZW5kZXIgdGhlIHRleHQgZm9yIGVhY2ggY2VsbFxyXG4gIGNvbnRleHQuZm9udCA9IFwiMC43cmVtICdSb2JvdG8gTW9ubycsIG1vbm9zcGFjZVwiO1xyXG4gIGNvbnRleHQuZmlsbFN0eWxlID0gY3NzLnRleHQ7XHJcbiAgZm9yIChsZXQgeCA9IGNlbGxzLngxOyB4IDwgY2VsbHMueDI7IHgrKykge1xyXG4gICAgZm9yIChsZXQgeSA9IGNlbGxzLnkxOyB5IDwgY2VsbHMueTI7IHkrKykge1xyXG4gICAgICBjb25zdCBzdHIgPSBjb250ZW50W3hdW3ldO1xyXG4gICAgICBjb250ZXh0LmZpbGxUZXh0KFxyXG4gICAgICAgIHN0cixcclxuICAgICAgICB4ICogQ09MX1NJWkUgKyBURVhUX09GRlNFVF9YLFxyXG4gICAgICAgIHkgKiBST1dfU0laRSArIFRFWFRfT0ZGU0VUX1lcclxuICAgICAgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vIFJlbmRlciBhIGhpZ2hsaWdodCBvbiB0aGUgY2VsbCB0aGF0IHRoZSBtb3VzZSBpcyBvdmVyXHJcbiAgY29udGV4dC5maWxsU3R5bGUgPSBjc3MuaG92ZXJIaWdobGlnaHQ7XHJcbiAgY29uc3QgbW91c2VPdmVyID0gZWRpdG9yLmV2ZW50cy5tb3VzZU92ZXI7XHJcbiAgaWYgKG1vdXNlT3ZlciAhPSBudWxsKSB7XHJcbiAgICBjb250ZXh0LmZpbGxSZWN0KFxyXG4gICAgICBtb3VzZU92ZXIueCAqIENPTF9TSVpFLFxyXG4gICAgICBtb3VzZU92ZXIueSAqIFJPV19TSVpFLFxyXG4gICAgICBDT0xfU0laRSxcclxuICAgICAgUk9XX1NJWkVcclxuICAgICk7XHJcbiAgfVxyXG5cclxuICAvLyBSZW5kZXIgYSBib3JkZXIgb24gdGhlIGNlbGwgdGhhdCBpcyBzZWxlY3RlZFxyXG4gIGNvbnRleHQubGluZVdpZHRoID0gTWF0aC5yb3VuZCgxLjUgKiBkcGlSYXRpbykgLyBkcGlSYXRpbztcclxuICBjb250ZXh0LnN0cm9rZVN0eWxlID0gY3NzLmFjY2VudDtcclxuICBjb25zdCBzZWxlY3RlZCA9IGVkaXRvci5ldmVudHMuc2VsZWN0ZWQ7XHJcbiAgaWYgKHNlbGVjdGVkICE9IG51bGwpIHtcclxuICAgIGNvbnN0IHgxID0gTWF0aC5taW4oc2VsZWN0ZWQuc3RhcnRYLCBzZWxlY3RlZC5lbmRYKTtcclxuICAgIGNvbnN0IHcgPSBNYXRoLm1heChzZWxlY3RlZC5zdGFydFgsIHNlbGVjdGVkLmVuZFgpIC0geDEgKyAxO1xyXG4gICAgY29uc3QgeTEgPSBNYXRoLm1pbihzZWxlY3RlZC5zdGFydFksIHNlbGVjdGVkLmVuZFkpO1xyXG4gICAgY29uc3QgaCA9IE1hdGgubWF4KHNlbGVjdGVkLnN0YXJ0WSwgc2VsZWN0ZWQuZW5kWSkgLSB5MSArIDE7XHJcbiAgICBjb250ZXh0LnN0cm9rZVJlY3QoXHJcbiAgICAgIHgxICogQ09MX1NJWkUsXHJcbiAgICAgIHkxICogUk9XX1NJWkUsXHJcbiAgICAgIHcgKiBDT0xfU0laRSxcclxuICAgICAgaCAqIFJPV19TSVpFXHJcbiAgICApO1xyXG4gIH1cclxufTtcclxuXHJcbmZ1bmN0aW9uIGdldE9uU2NyZWVuQ2VsbHMoZWRpdG9yOiBFZGl0b3IsIHJvd3M6IG51bWJlciwgY29sczogbnVtYmVyKSB7XHJcbiAgY29uc3QgZWRpdG9yU2l6ZSA9IGVkaXRvci5odG1sLmVkaXRvci5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuICBjb25zdCBncmlkU2NyZWVuWCA9IGVkaXRvci5odG1sLnN0b3BzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLndpZHRoO1xyXG4gIGNvbnN0IGdyaWRTY3JlZW5ZID0gZWRpdG9yLmh0bWwuc2VydmljZXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkuaGVpZ2h0O1xyXG4gIGNvbnN0IGdyaWRXaWR0aCA9IGVkaXRvclNpemUud2lkdGggLSBncmlkU2NyZWVuWDtcclxuICBjb25zdCBncmlkSGVpZ2h0ID0gZWRpdG9yU2l6ZS5oZWlnaHQgLSBncmlkU2NyZWVuWTtcclxuXHJcbiAgY29uc3Qgc2Nyb2xsWCA9IGVkaXRvci5odG1sLmVkaXRvci5zY3JvbGxMZWZ0O1xyXG4gIGNvbnN0IHNjcm9sbFkgPSBlZGl0b3IuaHRtbC5lZGl0b3Iuc2Nyb2xsVG9wO1xyXG5cclxuICBjb25zdCBzdGFydFJvdyA9IE1hdGgubWF4KDAsIE1hdGguZmxvb3Ioc2Nyb2xsWSAvIFJPV19TSVpFKSk7XHJcbiAgY29uc3QgZW5kUm93ID0gTWF0aC5taW4ocm93cywgc3RhcnRSb3cgKyBNYXRoLmNlaWwoZ3JpZEhlaWdodCAvIFJPV19TSVpFKSArIDEpO1xyXG4gIGNvbnN0IHJvd3NIaWdoID0gZW5kUm93IC0gc3RhcnRSb3c7XHJcbiAgY29uc3Qgc3RhcnRDb2wgPSBNYXRoLm1heCgwLCBNYXRoLmZsb29yKHNjcm9sbFggLyBDT0xfU0laRSkpO1xyXG4gIGNvbnN0IGVuZENvbCA9IE1hdGgubWluKGNvbHMsIHN0YXJ0Q29sICsgTWF0aC5jZWlsKGdyaWRXaWR0aCAvIENPTF9TSVpFKSArIDEpO1xyXG4gIGNvbnN0IGNvbHNXaWRlID0gZW5kQ29sIC0gc3RhcnRDb2w7XHJcblxyXG4gIHJldHVybiB7XHJcbiAgICB4MTogc3RhcnRDb2wsXHJcbiAgICB4MjogZW5kQ29sLFxyXG4gICAgeTE6IHN0YXJ0Um93LFxyXG4gICAgeTI6IGVuZFJvdyxcclxuICAgIHdpZHRoOiBjb2xzV2lkZSxcclxuICAgIGhlaWdodDogcm93c0hpZ2gsXHJcbiAgfTtcclxufTtcclxuXHJcbmZ1bmN0aW9uIGNhbGN1bGF0ZURwaVJhdGlvKGdyaWRDYW52YXMyZDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEKSB7XHJcbiAgY29uc3QgZHByID0gd2luZG93LmRldmljZVBpeGVsUmF0aW8gfHwgMTtcclxuXHJcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcclxuICBjb25zdCBic3IgPSAoZ3JpZENhbnZhczJkIGFzIGFueSkuYmFja2luZ1N0b3JlUGl4ZWxSYXRpbyB8fCAxO1xyXG5cclxuICByZXR1cm4gZHByIC8gYnNyO1xyXG59O1xyXG4iLCJpbXBvcnQgeyBFZGl0b3IgfSBmcm9tIFwiLi9lZGl0b3JcIjtcclxuaW1wb3J0IHsgQ09MX1NJWkUsIFJPV19TSVpFIH0gZnJvbSBcIi4vZWRpdG9yLWRyYXdcIjtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBlZGl0b3JJbml0KGVkaXRvcjogRWRpdG9yKSB7XHJcbiAgZWRpdG9yLmRyYXcoKTtcclxuXHJcbiAgZWRpdG9yLmh0bWwuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgKGUpID0+IHtcclxuICAgIGNvbnN0IG0gPSByZWxhdGl2ZUNvb3JkcyhlLCBlZGl0b3IpO1xyXG4gICAgZWRpdG9yLmV2ZW50cy5zZWxlY3RlZCA9IHsgc3RhcnRYOiBtLngsIHN0YXJ0WTogbS55LCBlbmRYOiBtLngsIGVuZFk6IG0ueSB9O1xyXG4gICAgZWRpdG9yLmV2ZW50cy5kcmFnZ2luZyA9IHRydWU7XHJcbiAgICBlZGl0b3IuZHJhdygpO1xyXG4gIH0pO1xyXG4gIGVkaXRvci5odG1sLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFwibW91c2V1cFwiLCAoZSkgPT4ge1xyXG4gICAgY29uc3QgbSA9IHJlbGF0aXZlQ29vcmRzKGUsIGVkaXRvcik7XHJcbiAgICBlZGl0b3IuZXZlbnRzLnNlbGVjdGVkLmVuZFggPSBtLng7XHJcbiAgICBlZGl0b3IuZXZlbnRzLnNlbGVjdGVkLmVuZFkgPSBtLnk7XHJcbiAgICBlZGl0b3IuZXZlbnRzLmRyYWdnaW5nID0gZmFsc2U7XHJcbiAgICBlZGl0b3IuZHJhdygpO1xyXG4gIH0pO1xyXG5cclxuICBlZGl0b3IuaHRtbC5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCAoZSkgPT5cclxuICAgIGNhbnZhc01vdXNlTW92ZUV2ZW50KGUsIGVkaXRvcilcclxuICApO1xyXG4gIGVkaXRvci5odG1sLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFwibW91c2VlbnRlclwiLCAoZSkgPT5cclxuICAgIGNhbnZhc01vdXNlTW92ZUV2ZW50KGUsIGVkaXRvcilcclxuICApO1xyXG4gIGVkaXRvci5odG1sLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFwibW91c2VsZWF2ZVwiLCAoKSA9PiB7XHJcbiAgICBlZGl0b3IuZXZlbnRzLm1vdXNlT3ZlciA9IG51bGw7XHJcbiAgICBlZGl0b3IuZHJhdygpO1xyXG4gIH0pO1xyXG4gIGVkaXRvci5odG1sLmVkaXRvci5hZGRFdmVudExpc3RlbmVyKFwic2Nyb2xsXCIsICgpID0+IHtcclxuICAgIGVkaXRvci5ldmVudHMubW91c2VPdmVyID0gbnVsbDtcclxuICAgIGVkaXRvci5kcmF3KCk7XHJcbiAgfSk7XHJcblxyXG4gIC8vIE1ha2UgdGhlIHNjcm9sbHdoZWVsIGNhdXNlIGhvcml6b250YWwgc2Nyb2xsaW5nIGluIHRoZSBlZGl0b3IsIG5vdCB2ZXJ0aWNhbFxyXG4gIC8vIEZpcmVmb3ggaXMgJ0RPTU1vdXNlU2Nyb2xsJyBhbmQgYmFzaWNhbGx5IGV2ZXJ5dGhpbmcgZWxzZSBpcyAnbW91c2V3aGVlbCdcclxuICBlZGl0b3IuaHRtbC5lZGl0b3IuYWRkRXZlbnRMaXN0ZW5lcihcclxuICAgIFwibW91c2V3aGVlbFwiLFxyXG4gICAgKGUpID0+IGVkaXRvclNjcm9sbEV2ZW50KGUsIGVkaXRvciksXHJcbiAgICBmYWxzZVxyXG4gICk7XHJcbiAgZWRpdG9yLmh0bWwuZWRpdG9yLmFkZEV2ZW50TGlzdGVuZXIoXHJcbiAgICBcIkRPTU1vdXNlU2Nyb2xsXCIsXHJcbiAgICAoZSkgPT4gZWRpdG9yU2Nyb2xsRXZlbnQoZSwgZWRpdG9yKSxcclxuICAgIGZhbHNlXHJcbiAgKTtcclxuXHJcbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcInBhc3RlXCIsIChlKSA9PiB7XHJcbiAgICBjb25zdCBjbGlwYm9hcmRUZXh0ID0gZS5jbGlwYm9hcmREYXRhLmdldERhdGEoJ3RleHQnKTtcclxuICAgIGNvbnNvbGUubG9nKGNsaXBib2FyZFRleHQpO1xyXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gIH0pO1xyXG59O1xyXG5cclxuZnVuY3Rpb24gZWRpdG9yU2Nyb2xsRXZlbnQoZTogRXZlbnQsIGVkaXRvcjogRWRpdG9yKSB7XHJcbiAgZSA9IHdpbmRvdy5ldmVudCB8fCBlO1xyXG5cclxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxyXG4gIGNvbnN0IHdoZWVsRXZlbnQgPSBlIGFzIGFueTtcclxuXHJcbiAgY29uc3QgZGVsdGEgPSBNYXRoLm1heCgtMSwgTWF0aC5taW4oMSwgd2hlZWxFdmVudC53aGVlbERlbHRhIHx8IC13aGVlbEV2ZW50LmRldGFpbCkpO1xyXG4gIGVkaXRvci5odG1sLmVkaXRvci5zY3JvbGxMZWZ0IC09IGRlbHRhICogNjQ7XHJcbiAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG59O1xyXG5cclxuZnVuY3Rpb24gY2FudmFzTW91c2VNb3ZlRXZlbnQoZTogTW91c2VFdmVudCwgZWRpdG9yOiBFZGl0b3IpIHtcclxuICBlZGl0b3IuZXZlbnRzLm1vdXNlT3ZlciA9IHJlbGF0aXZlQ29vcmRzKGUsIGVkaXRvcik7XHJcbiAgaWYgKGVkaXRvci5ldmVudHMuZHJhZ2dpbmcpIHtcclxuICAgIGlmIChlLmJ1dHRvbnMgIT0gMSkge1xyXG4gICAgICBlZGl0b3IuZXZlbnRzLmRyYWdnaW5nID0gZmFsc2U7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBlZGl0b3IuZXZlbnRzLnNlbGVjdGVkLmVuZFggPSBlZGl0b3IuZXZlbnRzLm1vdXNlT3Zlci54O1xyXG4gICAgICBlZGl0b3IuZXZlbnRzLnNlbGVjdGVkLmVuZFkgPSBlZGl0b3IuZXZlbnRzLm1vdXNlT3Zlci55O1xyXG4gICAgfVxyXG4gIH1cclxuICBlZGl0b3IuZHJhdygpO1xyXG59O1xyXG5cclxuZnVuY3Rpb24gcmVsYXRpdmVDb29yZHMoZTogTW91c2VFdmVudCwgZWRpdG9yOiBFZGl0b3IpIHtcclxuICBjb25zdCBib3VuZHMgPSBlZGl0b3IuaHRtbC5ncmlkLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG4gIGNvbnN0IHggPSBlLmNsaWVudFggLSBib3VuZHMubGVmdDtcclxuICBjb25zdCB5ID0gZS5jbGllbnRZIC0gYm91bmRzLnRvcDtcclxuICByZXR1cm4ge1xyXG4gICAgeDogTWF0aC5mbG9vcih4IC8gQ09MX1NJWkUpLFxyXG4gICAgeTogTWF0aC5mbG9vcih5IC8gUk9XX1NJWkUpLFxyXG4gIH07XHJcbn07XHJcbiIsImltcG9ydCB7IGVkaXRvckRyYXcgfSBmcm9tIFwiLi9lZGl0b3ItZHJhd1wiXHJcbmltcG9ydCB7IGVkaXRvckluaXQgfSBmcm9tIFwiLi9lZGl0b3ItaW5pdFwiXHJcblxyXG5leHBvcnQgY2xhc3MgRWRpdG9yIHtcclxuICBodG1sOiB7XHJcbiAgICBlZGl0b3I6IEhUTUxFbGVtZW50LFxyXG4gICAgZ3JpZDogSFRNTEVsZW1lbnQsXHJcbiAgICBjYW52YXM6IEhUTUxDYW52YXNFbGVtZW50LFxyXG4gICAgY29udGV4dDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELFxyXG4gICAgc3RvcHM6IEhUTUxFbGVtZW50LFxyXG4gICAgc2VydmljZXM6IEhUTUxFbGVtZW50XHJcbiAgfTtcclxuXHJcbiAgcHJpdmF0ZSBfY29udGVudDogc3RyaW5nW11bXTtcclxuXHJcbiAgZXZlbnRzOiB7XHJcbiAgICBtb3VzZU92ZXI6IHtcclxuICAgICAgeDogbnVtYmVyLFxyXG4gICAgICB5OiBudW1iZXJcclxuICAgIH0gfCBudWxsLFxyXG4gICAgc2VsZWN0ZWQ6IHtcclxuICAgICAgc3RhcnRYOiBudW1iZXIsXHJcbiAgICAgIHN0YXJ0WTogbnVtYmVyLFxyXG4gICAgICBlbmRYOiBudW1iZXIsXHJcbiAgICAgIGVuZFk6IG51bWJlclxyXG4gICAgfSB8IG51bGwsXHJcbiAgICBkcmFnZ2luZzogYm9vbGVhblxyXG4gIH07XHJcblxyXG4gIGNvbnN0cnVjdG9yKGVkaXRvcklEOiBzdHJpbmcsIGdyaWRJRDogc3RyaW5nLCBjYW52YXNJRDogc3RyaW5nLCBzdG9wc0lEOiBzdHJpbmcsIHNlcnZpY2VzSUQ6IHN0cmluZykge1xyXG4gICAgY29uc3QgZWRpdG9yID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoZWRpdG9ySUQpO1xyXG4gICAgY29uc3QgZ3JpZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGdyaWRJRCk7XHJcbiAgICBjb25zdCBjYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChjYW52YXNJRCkgYXMgSFRNTENhbnZhc0VsZW1lbnQ7XHJcbiAgICBjb25zdCBjb250ZXh0ID0gY2FudmFzLmdldENvbnRleHQoXCIyZFwiKTtcclxuICAgIGNvbnN0IHN0b3BzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoc3RvcHNJRCk7XHJcbiAgICBjb25zdCBzZXJ2aWNlcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHNlcnZpY2VzSUQpO1xyXG4gICAgdGhpcy5odG1sID0ge1xyXG4gICAgICBlZGl0b3I6IGVkaXRvcixcclxuICAgICAgZ3JpZDogZ3JpZCxcclxuICAgICAgY2FudmFzOiBjYW52YXMsXHJcbiAgICAgIGNvbnRleHQ6IGNvbnRleHQsXHJcbiAgICAgIHN0b3BzOiBzdG9wcyxcclxuICAgICAgc2VydmljZXM6IHNlcnZpY2VzLFxyXG4gICAgfTtcclxuICAgIHRoaXMuX2NvbnRlbnQgPSBbXTtcclxuICAgIHRoaXMuZXZlbnRzID0ge1xyXG4gICAgICBtb3VzZU92ZXI6IG51bGwsXHJcbiAgICAgIHNlbGVjdGVkOiBudWxsLFxyXG4gICAgICBkcmFnZ2luZzogZmFsc2UsXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgd2luZG93UmVzaXplZCgpIHtcclxuICAgIHRoaXMuZXZlbnRzLm1vdXNlT3ZlciA9IG51bGw7XHJcbiAgICB0aGlzLmRyYXcoKTtcclxuICB9XHJcblxyXG4gIGluaXQoKSB7XHJcbiAgICBlZGl0b3JJbml0KHRoaXMpO1xyXG4gIH1cclxuICBkcmF3KCkge1xyXG4gICAgZWRpdG9yRHJhdyh0aGlzKTtcclxuICB9XHJcbiAgc2V0IGNvbnRlbnQobmV3Q29udGVudDogc3RyaW5nW11bXSkge1xyXG4gICAgdGhpcy5fY29udGVudCA9IG5ld0NvbnRlbnQ7XHJcbiAgICB0aGlzLmRyYXcoKTtcclxuICB9XHJcbiAgZ2V0IGNvbnRlbnQoKTogc3RyaW5nW11bXSB7XHJcbiAgICByZXR1cm4gdGhpcy5fY29udGVudDtcclxuICB9XHJcbn1cclxuIiwiaW1wb3J0IHsgRWRpdG9yIH0gZnJvbSBcIi4vZWRpdG9yXCI7XHJcbmltcG9ydCB7IE5ldHdvcmsgfSBmcm9tIFwiLi9uZXR3b3JrXCI7XHJcbmltcG9ydCB7IHNldHVwIGFzIHNldHVwTmV3VGltZXRhYmxlRGlhbG9nLCBzaG93IGFzIHNob3dOZXdUaW1ldGFibGVEaWFsb2cgfSBmcm9tIFwiLi9uZXctdGltZXRhYmxlLWRpYWxvZ1wiO1xyXG5cclxuLy8gVG9kbzogRml4IGJ1ZyBjYXVzaW5nIGxheW91dCBiZWZvcmUgQ1NTIGlzIGxvYWRlZCwgZXNwZWNpYWxseSBhcHBhcmVudCB3aGVuXHJcbi8vIHVzaW5nIHRocm90dGxlZCBjb25uZWN0aW9ucyB3aXRob3V0IGNhY2hpbmcgaW4gRGV2VG9vbHMuXHJcblxyXG5jb25zdCBlZGl0b3IgPSBuZXcgRWRpdG9yKFwiZWRpdG9yXCIsIFwiZ3JpZFwiLCBcImdyaWQtY2FudmFzXCIsIFwic3RvcHNcIiwgXCJzZXJ2aWNlc1wiKTtcclxuZWRpdG9yLmluaXQoKTtcclxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJyZXNpemVcIiwgKCkgPT4gZWRpdG9yLndpbmRvd1Jlc2l6ZWQoKSk7XHJcblxyXG5jb25zdCBuZXR3b3JrID0gbmV3IE5ldHdvcmsoKTtcclxubmV0d29yay5sb2FkKCkudGhlbigoKSA9PiB7XHJcbiAgc2hvd1dlbGNvbWUoKTtcclxufSk7XHJcblxyXG5zZXR1cE5ld1RpbWV0YWJsZURpYWxvZygpO1xyXG5cclxuZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNuZXctdGltZXRhYmxlLWJ1dHRvblwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xyXG4gIHNob3dOZXdUaW1ldGFibGVEaWFsb2cobmV0d29yayk7XHJcbn0pO1xyXG5cclxuZnVuY3Rpb24gc2hvd1dlbGNvbWUoKSB7XHJcbiAgLy8gQ2xlYXIgdGhlIGVkaXRvciBhbmQgaGlkZSB0aGUgbG9hZGluZyBzY3JlZW4uXHJcbiAgZWRpdG9yLmNvbnRlbnQgPSBbXTtcclxuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3N0YXR1cy1sb2FkaW5nXCIpLmNsYXNzTGlzdC5hZGQoXCJnb25lXCIpO1xyXG5cclxuICAvLyBIaWRlIGxvYWRpbmcgc2NyZWVuIGFuZCBlbmFibGUgaGVhZGVyIGJ1dHRvbnMgZm9yIG5ldyB0aW1ldGFibGUgYW5kIGltcG9ydC5cclxuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3N0YXR1c1wiKS5jbGFzc0xpc3QucmVtb3ZlKFwiZ29uZVwiKTtcclxuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3N0YXR1cy1yZWFkeVwiKS5jbGFzc0xpc3QucmVtb3ZlKFwiZ29uZVwiKTtcclxuICAoZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNuZXctdGltZXRhYmxlLWJ1dHRvblwiKSBhcyBIVE1MQnV0dG9uRWxlbWVudCkuZGlzYWJsZWQgPSBmYWxzZTtcclxuICAoZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNpbXBvcnQtYnV0dG9uXCIpIGFzIEhUTUxCdXR0b25FbGVtZW50KS5kaXNhYmxlZCA9IGZhbHNlO1xyXG59XHJcbi8vIGZ1bmN0aW9uIHNob3dFZGl0b3IoKSB7XHJcbi8vICAgLy8gVG9kbzogSGlkZSB0aGUgd2VsY29tZS9sb2FkaW5nIHNjcmVlbnMsIHBvcHVsYXRlIHRoZSBzZWN0aW9ucyBpbiB0aGVcclxuLy8gICAvLyBoZWFkZXIuIE1heWJlIGV2ZW4gZW5hYmxlIHRoZSBcImV4cG9ydFwiIGJ1dHRvbj9cclxuLy8gICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3N0YXR1cy1sb2FkaW5nXCIpLmNsYXNzTGlzdC5hZGQoXCJnb25lXCIpO1xyXG4vLyAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjc3RhdHVzLXJlYWR5XCIpLmNsYXNzTGlzdC5hZGQoXCJnb25lXCIpO1xyXG4vLyAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjc3RhdHVzXCIpLmNsYXNzTGlzdC5hZGQoXCJnb25lXCIpO1xyXG4vLyAgIChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI25ldy10aW1ldGFibGUtYnV0dG9uXCIpIGFzIEhUTUxCdXR0b25FbGVtZW50KS5kaXNhYmxlZCA9IGZhbHNlO1xyXG4vLyAgIChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2ltcG9ydC1idXR0b25cIikgYXMgSFRNTEJ1dHRvbkVsZW1lbnQpLmRpc2FibGVkID0gZmFsc2U7XHJcbi8vICAgKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjZXhwb3J0LWJ1dHRvblwiKSBhcyBIVE1MQnV0dG9uRWxlbWVudCkuZGlzYWJsZWQgPSBmYWxzZTtcclxuXHJcbi8vICAgY29uc3QgY29udGVudDogc3RyaW5nW11bXSA9IFtdO1xyXG4vLyAgIGZvciAobGV0IHggPSAwOyB4IDwgNTA7IHgrKykge1xyXG4vLyAgICAgY29udGVudFt4XSA9IFtdO1xyXG4vLyAgICAgZm9yIChsZXQgeSA9IDA7IHkgPCAzMDsgeSsrKSB7XHJcbi8vICAgICAgIGNvbnRlbnRbeF1beV0gPSBcIjAwOjAwXCI7XHJcbi8vICAgICB9XHJcbi8vICAgfVxyXG4vLyAgIGVkaXRvci5jb250ZW50ID0gY29udGVudDtcclxuLy8gfVxyXG4iLCJ0eXBlIE5ldHdvcmtBcGlWMVNjaGVtYSA9IHtcclxuICBoYXNoOiBzdHJpbmcsXHJcbiAgc3RvcHM6IHtcclxuICAgIGlkOiBudW1iZXIsXHJcbiAgICBuYW1lOiBzdHJpbmcsXHJcbiAgICBwbGF0Zm9ybXM6IHtcclxuICAgICAgaWQ6IHN0cmluZyxcclxuICAgICAgbmFtZTogc3RyaW5nXHJcbiAgICB9W10sXHJcbiAgICB1cmxOYW1lOiBzdHJpbmdcclxuICB9W10sXHJcbiAgbGluZXM6IHtcclxuICAgIGlkOiBudW1iZXIsXHJcbiAgICBuYW1lOiBzdHJpbmcsXHJcbiAgICBjb2xvcjogc3RyaW5nLFxyXG4gICAgc2VydmljZTogc3RyaW5nLFxyXG4gICAgcm91dGVUeXBlOiBzdHJpbmcsXHJcbiAgICBkaXJlY3Rpb25zOiB7XHJcbiAgICAgIGlkOiBzdHJpbmcsXHJcbiAgICAgIG5hbWU6IHN0cmluZyxcclxuICAgICAgc3RvcHM6IG51bWJlcltdXHJcbiAgICB9W11cclxuICB9W11cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIE5ldHdvcmsge1xyXG4gIGRvbWFpbjogc3RyaW5nO1xyXG4gIGpzb246IE5ldHdvcmtBcGlWMVNjaGVtYSB8IG51bGw7XHJcbiAgY29uc3RydWN0b3IoZG9tYWluID0gXCJhcGkudHJhaW5hcnJpdmVzLmluXCIpIHtcclxuICAgIHRoaXMuZG9tYWluID0gZG9tYWluO1xyXG4gICAgdGhpcy5qc29uID0gbnVsbDtcclxuICB9XHJcbiAgYXN5bmMgbG9hZCgpIHtcclxuICAgIGNvbnN0IGFwaSA9IFwibmV0d29yay92MVwiO1xyXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaChgaHR0cHM6Ly8ke3RoaXMuZG9tYWlufS8ke2FwaX1gKVxyXG4gICAgaWYgKHJlc3BvbnNlLnN0YXR1cyAhPSAyMDApIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBcIiR7dGhpcy5kb21haW59XCIgZGlkIG5vdCByZXNwb25kLmApO1xyXG4gICAgfVxyXG4gICAgdGhpcy5qc29uID0gYXdhaXQgcmVzcG9uc2UuanNvbigpIGFzIE5ldHdvcmtBcGlWMVNjaGVtYTtcclxuICB9XHJcbiAgZ2V0IGxpbmVzKCkge1xyXG4gICAgaWYgKHRoaXMuanNvbiA9PSBudWxsKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIk5ldHdvcmsgbm90IGxvYWRlZC5cIik7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGhpcy5qc29uLmxpbmVzO1xyXG4gIH1cclxufVxyXG4iLCJpbXBvcnQgeyBOZXR3b3JrIH0gZnJvbSBcIi4vbmV0d29ya1wiO1xyXG5cclxuLy8gSFRNTCBJRHMgZm9yIGRpYWxvZyBlbGVtZW50cy5cclxuY29uc3QgZGlhbG9nSUQgPSBcIiNuZXctdGltZXRhYmxlLWRpYWxvZ1wiXHJcbmNvbnN0IGNhbmNlbEJ1dHRvbklEID0gXCIjbmV3LXRpbWV0YWJsZS1kaWFsb2ctY2FuY2VsXCJcclxuY29uc3Qgc3VibWl0QnV0dG9uSUQgPSBcIiNuZXctdGltZXRhYmxlLWRpYWxvZy1zdWJtaXRcIlxyXG5jb25zdCBsaW5lc1NlbGVjdElEID0gXCIjbmV3LXRpbWV0YWJsZS1kaWFsb2ctbGluZXNcIlxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHNldHVwKCkge1xyXG4gIC8vIENsb3NlIGRpYWxvZyBvbiBjYW5jZWwgYnV0dG9uIChub3RlIHRoYXQgRVNDIGtleSBjYW4gYWxzbyBjbG9zZSBkaWFsb2dzKS5cclxuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGNhbmNlbEJ1dHRvbklEKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xyXG4gICAgLy8gUmVxdWlyZWQgdG8gY2FzdCB0byBhbnkgc2luY2UgdHlwZXNjcmlwdCBkb2VzIG5vdCBrbm93IGFib3V0IHNob3dNb2RhbCgpLlxyXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcclxuICAgIGNvbnN0IGRpYWxvZyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoZGlhbG9nSUQpIGFzIGFueTtcclxuICAgIGRpYWxvZy5jbG9zZSgpO1xyXG4gIH0pO1xyXG5cclxuICAvLyBDbG9zZSBkaWFsb2cgb24gc3VibWl0IGJ1dHRvbi5cclxuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHN1Ym1pdEJ1dHRvbklEKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xyXG4gICAgLy8gUmVxdWlyZWQgdG8gY2FzdCB0byBhbnkgc2luY2UgdHlwZXNjcmlwdCBkb2VzIG5vdCBrbm93IGFib3V0IHNob3dNb2RhbCgpLlxyXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcclxuICAgIGNvbnN0IGRpYWxvZyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoZGlhbG9nSUQpIGFzIGFueTtcclxuICAgIGRpYWxvZy5jbG9zZSgpO1xyXG4gIH0pO1xyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBzaG93KG5ldHdvcms6IE5ldHdvcmspIHtcclxuICAvLyBTb3J0IGxpbmVzIGJ5IG5hbWUgYWxwaGFiZXRpY2FsIG9yZGVyLlxyXG4gIGNvbnN0IGxpbmVzID0gWy4uLm5ldHdvcmsubGluZXNdLnNvcnQoKGEsIGIpID0+IGEubmFtZS5sb2NhbGVDb21wYXJlKGIubmFtZSkpO1xyXG5cclxuICAvLyBSZXF1aXJlZCB0byBjYXN0IHRvIGFueSBzaW5jZSB0eXBlc2NyaXB0IGRvZXMgbm90IGtub3cgYWJvdXQgc2hvd01vZGFsKCkuXHJcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcclxuICBjb25zdCBkaWFsb2cgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGRpYWxvZ0lEKSBhcyBhbnk7XHJcblxyXG4gIC8vIFJlbW92ZSBhbGwgZXhpc3Rpbmcgb3B0aW9ucyBmcm9tIGxpbmVzIHNlbGVjdCwgYW5kIGFkZCBlYWNoIGxpbmUgYXMgYW5cclxuICAvLyBvcHRpb24uXHJcbiAgY29uc3Qgc2VsZWN0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihsaW5lc1NlbGVjdElEKSBhcyBIVE1MU2VsZWN0RWxlbWVudDtcclxuICB3aGlsZSAoc2VsZWN0Lmxhc3RDaGlsZCkgeyBzZWxlY3QucmVtb3ZlQ2hpbGQoc2VsZWN0Lmxhc3RDaGlsZCk7IH1cclxuICBsaW5lcy5tYXAobGluZSA9PiB7XHJcbiAgICBjb25zdCBvcHRpb24gPSBuZXcgT3B0aW9uKGxpbmUubmFtZSwgbGluZS5pZC50b1N0cmluZygpKTtcclxuICAgIHNlbGVjdC5hcHBlbmRDaGlsZChvcHRpb24pO1xyXG4gIH0pXHJcblxyXG4gIGRpYWxvZy5zaG93TW9kYWwoKTtcclxufVxyXG4iXX0=
