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
let timetable = null;
// Initialize the editor.
const editor = new editor_1.Editor("editor", "grid", "grid-canvas", "stops", "services");
editor.init();
window.addEventListener("resize", () => editor.windowResized());
// Intialize the new timetable dialog.
const newTimetableDialog = new new_timetable_dialog_1.NewTimetableDialog("new-timetable-dialog", dialogSubmitted);
// Begin downloading the network information from the API.
const network = new network_1.Network();
network.load().then(() => {
    // When download is finished, initialize the new timetable dialog and show
    // the welcome screen.
    newTimetableDialog.init(network);
    showWelcome();
});
// Wire up the new timetable button to show the dialog when clicked. The new
// timetable button is disabled until the network is loaded.
const newTimetableButton = document.querySelector("#new-timetable-button");
const importButton = document.querySelector("#import-button");
const exportButton = document.querySelector("#export-button");
const status = document.querySelector("#status");
const statusLoading = document.querySelector("#status-loading");
const statusReady = document.querySelector("#status-ready");
newTimetableButton.addEventListener("click", () => {
    const result = timetable == null || confirm("Create a new timetable? " +
        "The existing one won't be saved anywhere.");
    if (result) {
        newTimetableDialog.show();
    }
});
function showWelcome() {
    // Clear the editor and hide the loading screen.
    editor.content = [];
    statusLoading.classList.add("gone");
    // Hide loading screen and enable header buttons for new timetable and import.
    status.classList.remove("gone");
    statusReady.classList.remove("gone");
    newTimetableButton.disabled = false;
    importButton.disabled = false;
    // Do not ask the user before leaving.
    window.onbeforeunload = null;
}
function dialogSubmitted(lineID, days, timetableID) {
    timetable = "Something!";
    showEditor();
    // throw new Error("Not implemented yet!");
}
function showEditor() {
    // Todo: Hide the welcome/loading screens, populate the sections in the
    // header. Maybe even enable the "export" button?
    statusLoading.classList.add("gone");
    statusReady.classList.add("gone");
    status.classList.add("gone");
    newTimetableButton.disabled = false;
    importButton.disabled = false;
    exportButton.disabled = true;
    const content = [];
    for (let x = 0; x < 50; x++) {
        content[x] = [];
        for (let y = 0; y < 30; y++) {
            content[x][y] = "00:00";
        }
    }
    editor.content = content;
    // Ask the user before leaving.
    window.onbeforeunload = function () {
        return true;
    };
}
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
exports.NewTimetableDialog = void 0;
class NewTimetableDialog {
    constructor(htmlID, submitted) {
        this.dialog = document.querySelector(`#${htmlID}`);
        this.cancelButton = document.querySelector(`#${htmlID}-cancel`);
        this.submitButton = document.querySelector(`#${htmlID}-submit`);
        this.linesSelect = document.querySelector(`#${htmlID}-lines`);
        this.daysSelect = document.querySelector(`#${htmlID}-days`);
        this.idFieldID = document.querySelector(`#${htmlID}-id`);
        this.submitted = submitted;
    }
    init(network) {
        // Sort lines by name alphabetical order, and add an option for each to the
        // lines select.
        const lines = [...network.lines]
            .sort((a, b) => a.name.localeCompare(b.name));
        lines.map(line => {
            const option = new Option(line.name, line.id.toString());
            this.linesSelect.appendChild(option);
        });
        // Close the dialog if the close button is clicked. Note that pressing ESC
        // also closes the dialog, so it cannot be assumed this will run.
        this.cancelButton.addEventListener("click", () => {
            this.dialog.close();
        });
        // Retrieve the values, run the callback, and close the dialog when the
        // submit button is pressed. If any error occurs, display the error and do
        // not close the dialog.
        this.submitButton.addEventListener("click", () => {
            const lineIDStr = this.linesSelect.value;
            const days = this.daysSelect.value;
            const timetableID = this.idFieldID.value;
            const lineIDNum = parseInt(lineIDStr);
            try {
                this.submitted(lineIDNum, days, timetableID);
                this.dialog.close();
            }
            catch (_a) {
                // todo: handle invalid input
            }
        });
    }
    show() {
        this.dialog.showModal();
    }
}
exports.NewTimetableDialog = NewTimetableDialog;
},{}]},{},[5])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJ0cy9jc3MudHMiLCJ0cy9lZGl0b3ItZHJhdy50cyIsInRzL2VkaXRvci1pbml0LnRzIiwidHMvZWRpdG9yLnRzIiwidHMvbWFpbi50cyIsInRzL25ldHdvcmsudHMiLCJ0cy9uZXctdGltZXRhYmxlLWRpYWxvZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7OztBQ0FhLFFBQUEsR0FBRyxHQUFHLENBQUMsR0FBRyxFQUFFO0lBQ3ZCLE9BQU87UUFDTCxJQUFJLEVBQUUsNkJBQTZCO1FBQ25DLE9BQU8sRUFBRSx5QkFBeUI7UUFDbEMsTUFBTSxFQUFFLFNBQVM7UUFDakIsY0FBYyxFQUFFLDhCQUE4QjtLQUMvQyxDQUFDO0FBQ0osQ0FBQyxDQUFDLEVBQUUsQ0FBQzs7Ozs7QUNOTCwrQkFBNEI7QUFFZixRQUFBLFFBQVEsR0FBRyxFQUFFLENBQUM7QUFDZCxRQUFBLFFBQVEsR0FBRyxFQUFFLENBQUM7QUFDM0IsTUFBTSxhQUFhLEdBQUcsQ0FBQyxDQUFDO0FBQ3hCLE1BQU0sYUFBYSxHQUFHLEVBQUUsQ0FBQztBQUV6QixTQUFnQixVQUFVLENBQUMsTUFBYzs7SUFDdkMsTUFBTSxNQUFNLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUM7SUFDbEMsTUFBTSxPQUFPLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUM7SUFDcEMsTUFBTSxPQUFPLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQztJQUUvQixNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDO0lBQzVCLE1BQU0sSUFBSSxHQUFHLE1BQUEsTUFBQSxPQUFPLENBQUMsQ0FBQyxDQUFDLDBDQUFFLE1BQU0sbUNBQUksQ0FBQyxDQUFDO0lBQ3JDLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sS0FBSyxJQUFJ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UUFDakUsSUFBSSxDQUFDLFlBQVksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsR0FBRyxFQUFFO1lBQy9DLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDdEIsQ0FBQyxDQUFDLENBQUM7UUFFSCx1RUFBdUU7UUFDdkUsMEVBQTBFO1FBQzFFLHdCQUF3QjtRQUN4QixJQUFJLENBQUMsWUFBWSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxHQUFHLEVBQUU7WUFDL0MsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUM7WUFDekMsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUM7WUFDbkMsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUM7WUFDekMsTUFBTSxTQUFTLEdBQUcsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBRXRDLElBQUk7Z0JBQ0YsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUUsSUFBSSxFQUFFLFdBQVcsQ0FBQyxDQUFBO2dCQUM1QyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDO2FBQ3JCO1lBQ0QsV0FBTTtnQkFDSiw2QkFBNkI7YUFDOUI7UUFDSCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFDRCxJQUFJO1FBQ0YsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQztJQUMxQixDQUFDO0NBQ0Y7QUE5REQsZ0RBOERDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiZXhwb3J0IGNvbnN0IGNzcyA9ICgoKSA9PiB7XHJcbiAgcmV0dXJuIHtcclxuICAgIHRleHQ6IFwiaHNsYSgyMjBkZWcsIDEwMCUsIDQlLCAwLjgpXCIsXHJcbiAgICBwYXBlcjEwOiBcImhzbCgyMjBkZWcsIDMwJSwgOTMuNSUpXCIsXHJcbiAgICBhY2NlbnQ6IFwiIzAwYTVjYVwiLFxyXG4gICAgaG92ZXJIaWdobGlnaHQ6IFwiaHNsYSgyMjBkZWcsIDEwMCUsIDE4JSwgMC4xKVwiLFxyXG4gIH07XHJcbn0pKCk7XHJcbiIsImltcG9ydCB7IEVkaXRvciB9IGZyb20gXCIuL2VkaXRvclwiO1xyXG5pbXBvcnQgeyBjc3MgfSBmcm9tIFwiLi9jc3NcIjtcclxuXHJcbmV4cG9ydCBjb25zdCBST1dfU0laRSA9IDIwO1xyXG5leHBvcnQgY29uc3QgQ09MX1NJWkUgPSA0ODtcclxuY29uc3QgVEVYVF9PRkZTRVRfWCA9IDc7XHJcbmNvbnN0IFRFWFRfT0ZGU0VUX1kgPSAxNDtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBlZGl0b3JEcmF3KGVkaXRvcjogRWRpdG9yKSB7XHJcbiAgY29uc3QgY2FudmFzID0gZWRpdG9yLmh0bWwuY2FudmFzO1xyXG4gIGNvbnN0IGNvbnRleHQgPSBlZGl0b3IuaHRtbC5jb250ZXh0O1xyXG4gIGNvbnN0IGNvbnRlbnQgPSBlZGl0b3IuY29udGVudDtcclxuXHJcbiAgY29uc3QgY29scyA9IGNvbnRlbnQubGVuZ3RoO1xyXG4gIGNvbnN0IHJvd3MgPSBjb250ZW50WzBdPy5sZW5ndGggPz8gMDtcclxuICBpZiAoY29udGVudC5zb21lKChjKSA9PiBjLmxlbmd0aCAhPT0gcm93cykpIHtcclxuICAgIHRocm93IFwiR3JpZCBpcyBqYWdnZWQgKHNvbWUgY29sdW1ucyBoYXZlIG1vcmUgcm93cyB0aGFuIG90aGVycylcIjtcclxuICB9XHJcblxyXG4gIGNvbnN0IGRwaVJhdGlvID0gY2FsY3VsYXRlRHBpUmF0aW8oY29udGV4dCk7XHJcbiAgY29uc3QgY2VsbHMgPSBnZXRPblNjcmVlbkNlbGxzKGVkaXRvciwgcm93cywgY29scyk7XHJcblxyXG4gIC8vIFNldCB0aGUgY29udGFpbmVyIGhvbGRpbmcgdGhlIGNhbnZhcyB0byB0aGUgZnVsbCBzaXplIChtYWtlcyB0aGUgc2Nyb2xsYmFyXHJcbiAgLy8gd29yayBwcm9wZXJseSlcclxuICBlZGl0b3IuaHRtbC5ncmlkLnN0eWxlLndpZHRoID0gQ09MX1NJWkUgKiBjb2xzICsgXCJweFwiO1xyXG4gIGVkaXRvci5odG1sLmdyaWQuc3R5bGUuaGVpZ2h0ID0gUk9XX1NJWkUgKiByb3dzICsgXCJweFwiO1xyXG5cclxuICAvLyBNYWtlIHRoZSBjYW52YXMgYmlnIGVub3VnaCB0byBmaXQgb25seSB0aGUgY2VsbHMgYWN0dWFsbHkgb24gc2NyZWVuXHJcbiAgLy8gU2hpZnQgdGhlIGNhbnZhcyB3aXRoaW4gaXQncyBwYXJlbnQgc28gd2hlbiBpdCdzIHNjcm9sbGVkLCBpdCBzdGlsbCBhcHBlYXJzXHJcbiAgLy8gb24gc2NyZWVuIGRlc3BpdGUgaXRzIHNtYWxsZXIgc2l6ZVxyXG4gIGNhbnZhcy53aWR0aCA9IENPTF9TSVpFICogY2VsbHMud2lkdGggKiBkcGlSYXRpbztcclxuICBjYW52YXMuaGVpZ2h0ID0gUk9XX1NJWkUgKiBjZWxscy5oZWlnaHQgKiBkcGlSYXRpbztcclxuICBjYW52YXMuc3R5bGUud2lkdGggPSBDT0xfU0laRSAqIGNlbGxzLndpZHRoICsgXCJweFwiO1xyXG4gIGNhbnZhcy5zdHlsZS5oZWlnaHQgPSBST1dfU0laRSAqIGNlbGxzLmhlaWdodCArIFwicHhcIjtcclxuICBjYW52YXMuc3R5bGUubGVmdCA9IENPTF9TSVpFICogY2VsbHMueDEgKyBcInB4XCI7XHJcbiAgY2FudmFzLnN0eWxlLnRvcCA9IFJPV19TSVpFICogY2VsbHMueTEgKyBcInB4XCI7XHJcblxyXG4gIC8vIENsZWFyIHRoZSBjYW52YXMsIGFuZCB0cmFuc2Zvcm0gdGhlIGNvb3JkaW5hdGUgc3BhY2UgdG8gYWNjb3VudCBmb3IgdGhlXHJcbiAgLy8gc2Nyb2xsaW5nXHJcbiAgY29udGV4dC5jbGVhclJlY3QoMCwgMCwgY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0KTtcclxuICBjb250ZXh0LnRyYW5zbGF0ZShcclxuICAgIC1jZWxscy54MSAqIENPTF9TSVpFICogZHBpUmF0aW8sXHJcbiAgICAtY2VsbHMueTEgKiBST1dfU0laRSAqIGRwaVJhdGlvXHJcbiAgKTtcclxuICBjb250ZXh0LnNjYWxlKGRwaVJhdGlvLCBkcGlSYXRpbyk7XHJcblxyXG4gIC8vIFJlbmRlciBhIGxpZ2h0ZXIgYmFja2dyb3VuZCBmb3IgZXZlcnkgc2Vjb25kIHJvd1xyXG4gIGNvbnRleHQuZmlsbFN0eWxlID0gY3NzLnBhcGVyMTA7XHJcbiAgZm9yIChsZXQgeSA9IGNlbGxzLnkxOyB5IDwgY2VsbHMueTI7IHkrKykge1xyXG4gICAgaWYgKHkgJSAyICE9IDApIHtcclxuICAgICAgY29udGludWU7XHJcbiAgICB9XHJcbiAgICBjb250ZXh0LmZpbGxSZWN0KFxyXG4gICAgICBjZWxscy54MSAqIENPTF9TSVpFLFxyXG4gICAgICB5ICogUk9XX1NJWkUsXHJcbiAgICAgIGNlbGxzLndpZHRoICogQ09MX1NJWkUsXHJcbiAgICAgIFJPV19TSVpFXHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgLy8gUmVuZGVyIHRoZSB0ZXh0IGZvciBlYWNoIGNlbGxcclxuICBjb250ZXh0LmZvbnQgPSBcIjAuN3JlbSAnUm9ib3RvIE1vbm8nLCBtb25vc3BhY2VcIjtcclxuICBjb250ZXh0LmZpbGxTdHlsZSA9IGNzcy50ZXh0O1xyXG4gIGZvciAobGV0IHggPSBjZWxscy54MTsgeCA8IGNlbGxzLngyOyB4KyspIHtcclxuICAgIGZvciAobGV0IHkgPSBjZWxscy55MTsgeSA8IGNlbGxzLnkyOyB5KyspIHtcclxuICAgICAgY29uc3Qgc3RyID0gY29udGVudFt4XVt5XTtcclxuICAgICAgY29udGV4dC5maWxsVGV4dChcclxuICAgICAgICBzdHIsXHJcbiAgICAgICAgeCAqIENPTF9TSVpFICsgVEVYVF9PRkZTRVRfWCxcclxuICAgICAgICB5ICogUk9XX1NJWkUgKyBURVhUX09GRlNFVF9ZXHJcbiAgICAgICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyBSZW5kZXIgYSBoaWdobGlnaHQgb24gdGhlIGNlbGwgdGhhdCB0aGUgbW91c2UgaXMgb3ZlclxyXG4gIGNvbnRleHQuZmlsbFN0eWxlID0gY3NzLmhvdmVySGlnaGxpZ2h0O1xyXG4gIGNvbnN0IG1vdXNlT3ZlciA9IGVkaXRvci5ldmVudHMubW91c2VPdmVyO1xyXG4gIGlmIChtb3VzZU92ZXIgIT0gbnVsbCkge1xyXG4gICAgY29udGV4dC5maWxsUmVjdChcclxuICAgICAgbW91c2VPdmVyLnggKiBDT0xfU0laRSxcclxuICAgICAgbW91c2VPdmVyLnkgKiBST1dfU0laRSxcclxuICAgICAgQ09MX1NJWkUsXHJcbiAgICAgIFJPV19TSVpFXHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgLy8gUmVuZGVyIGEgYm9yZGVyIG9uIHRoZSBjZWxsIHRoYXQgaXMgc2VsZWN0ZWRcclxuICBjb250ZXh0LmxpbmVXaWR0aCA9IE1hdGgucm91bmQoMS41ICogZHBpUmF0aW8pIC8gZHBpUmF0aW87XHJcbiAgY29udGV4dC5zdHJva2VTdHlsZSA9IGNzcy5hY2NlbnQ7XHJcbiAgY29uc3Qgc2VsZWN0ZWQgPSBlZGl0b3IuZXZlbnRzLnNlbGVjdGVkO1xyXG4gIGlmIChzZWxlY3RlZCAhPSBudWxsKSB7XHJcbiAgICBjb25zdCB4MSA9IE1hdGgubWluKHNlbGVjdGVkLnN0YXJ0WCwgc2VsZWN0ZWQuZW5kWCk7XHJcbiAgICBjb25zdCB3ID0gTWF0aC5tYXgoc2VsZWN0ZWQuc3RhcnRYLCBzZWxlY3RlZC5lbmRYKSAtIHgxICsgMTtcclxuICAgIGNvbnN0IHkxID0gTWF0aC5taW4oc2VsZWN0ZWQuc3RhcnRZLCBzZWxlY3RlZC5lbmRZKTtcclxuICAgIGNvbnN0IGggPSBNYXRoLm1heChzZWxlY3RlZC5zdGFydFksIHNlbGVjdGVkLmVuZFkpIC0geTEgKyAxO1xyXG4gICAgY29udGV4dC5zdHJva2VSZWN0KFxyXG4gICAgICB4MSAqIENPTF9TSVpFLFxyXG4gICAgICB5MSAqIFJPV19TSVpFLFxyXG4gICAgICB3ICogQ09MX1NJWkUsXHJcbiAgICAgIGggKiBST1dfU0laRVxyXG4gICAgKTtcclxuICB9XHJcbn07XHJcblxyXG5mdW5jdGlvbiBnZXRPblNjcmVlbkNlbGxzKGVkaXRvcjogRWRpdG9yLCByb3dzOiBudW1iZXIsIGNvbHM6IG51bWJlcikge1xyXG4gIGNvbnN0IGVkaXRvclNpemUgPSBlZGl0b3IuaHRtbC5lZGl0b3IuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcbiAgY29uc3QgZ3JpZFNjcmVlblggPSBlZGl0b3IuaHRtbC5zdG9wcy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS53aWR0aDtcclxuICBjb25zdCBncmlkU2NyZWVuWSA9IGVkaXRvci5odG1sLnNlcnZpY2VzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmhlaWdodDtcclxuICBjb25zdCBncmlkV2lkdGggPSBlZGl0b3JTaXplLndpZHRoIC0gZ3JpZFNjcmVlblg7XHJcbiAgY29uc3QgZ3JpZEhlaWdodCA9IGVkaXRvclNpemUuaGVpZ2h0IC0gZ3JpZFNjcmVlblk7XHJcblxyXG4gIGNvbnN0IHNjcm9sbFggPSBlZGl0b3IuaHRtbC5lZGl0b3Iuc2Nyb2xsTGVmdDtcclxuICBjb25zdCBzY3JvbGxZID0gZWRpdG9yLmh0bWwuZWRpdG9yLnNjcm9sbFRvcDtcclxuXHJcbiAgY29uc3Qgc3RhcnRSb3cgPSBNYXRoLm1heCgwLCBNYXRoLmZsb29yKHNjcm9sbFkgLyBST1dfU0laRSkpO1xyXG4gIGNvbnN0IGVuZFJvdyA9IE1hdGgubWluKHJvd3MsIHN0YXJ0Um93ICsgTWF0aC5jZWlsKGdyaWRIZWlnaHQgLyBST1dfU0laRSkgKyAxKTtcclxuICBjb25zdCByb3dzSGlnaCA9IGVuZFJvdyAtIHN0YXJ0Um93O1xyXG4gIGNvbnN0IHN0YXJ0Q29sID0gTWF0aC5tYXgoMCwgTWF0aC5mbG9vcihzY3JvbGxYIC8gQ09MX1NJWkUpKTtcclxuICBjb25zdCBlbmRDb2wgPSBNYXRoLm1pbihjb2xzLCBzdGFydENvbCArIE1hdGguY2VpbChncmlkV2lkdGggLyBDT0xfU0laRSkgKyAxKTtcclxuICBjb25zdCBjb2xzV2lkZSA9IGVuZENvbCAtIHN0YXJ0Q29sO1xyXG5cclxuICByZXR1cm4ge1xyXG4gICAgeDE6IHN0YXJ0Q29sLFxyXG4gICAgeDI6IGVuZENvbCxcclxuICAgIHkxOiBzdGFydFJvdyxcclxuICAgIHkyOiBlbmRSb3csXHJcbiAgICB3aWR0aDogY29sc1dpZGUsXHJcbiAgICBoZWlnaHQ6IHJvd3NIaWdoLFxyXG4gIH07XHJcbn07XHJcblxyXG5mdW5jdGlvbiBjYWxjdWxhdGVEcGlSYXRpbyhncmlkQ2FudmFzMmQ6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCkge1xyXG4gIGNvbnN0IGRwciA9IHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvIHx8IDE7XHJcblxyXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XHJcbiAgY29uc3QgYnNyID0gKGdyaWRDYW52YXMyZCBhcyBhbnkpLmJhY2tpbmdTdG9yZVBpeGVsUmF0aW8gfHwgMTtcclxuXHJcbiAgcmV0dXJuIGRwciAvIGJzcjtcclxufTtcclxuIiwiaW1wb3J0IHsgRWRpdG9yIH0gZnJvbSBcIi4vZWRpdG9yXCI7XHJcbmltcG9ydCB7IENPTF9TSVpFLCBST1dfU0laRSB9IGZyb20gXCIuL2VkaXRvci1kcmF3XCI7XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZWRpdG9ySW5pdChlZGl0b3I6IEVkaXRvcikge1xyXG4gIGVkaXRvci5kcmF3KCk7XHJcblxyXG4gIGVkaXRvci5odG1sLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIChlKSA9PiB7XHJcbiAgICBjb25zdCBtID0gcmVsYXRpdmVDb29yZHMoZSwgZWRpdG9yKTtcclxuICAgIGVkaXRvci5ldmVudHMuc2VsZWN0ZWQgPSB7IHN0YXJ0WDogbS54LCBzdGFydFk6IG0ueSwgZW5kWDogbS54LCBlbmRZOiBtLnkgfTtcclxuICAgIGVkaXRvci5ldmVudHMuZHJhZ2dpbmcgPSB0cnVlO1xyXG4gICAgZWRpdG9yLmRyYXcoKTtcclxuICB9KTtcclxuICBlZGl0b3IuaHRtbC5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgKGUpID0+IHtcclxuICAgIGNvbnN0IG0gPSByZWxhdGl2ZUNvb3JkcyhlLCBlZGl0b3IpO1xyXG4gICAgZWRpdG9yLmV2ZW50cy5zZWxlY3RlZC5lbmRYID0gbS54O1xyXG4gICAgZWRpdG9yLmV2ZW50cy5zZWxlY3RlZC5lbmRZID0gbS55O1xyXG4gICAgZWRpdG9yLmV2ZW50cy5kcmFnZ2luZyA9IGZhbHNlO1xyXG4gICAgZWRpdG9yLmRyYXcoKTtcclxuICB9KTtcclxuXHJcbiAgZWRpdG9yLmh0bWwuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgKGUpID0+XHJcbiAgICBjYW52YXNNb3VzZU1vdmVFdmVudChlLCBlZGl0b3IpXHJcbiAgKTtcclxuICBlZGl0b3IuaHRtbC5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZW50ZXJcIiwgKGUpID0+XHJcbiAgICBjYW52YXNNb3VzZU1vdmVFdmVudChlLCBlZGl0b3IpXHJcbiAgKTtcclxuICBlZGl0b3IuaHRtbC5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbGVhdmVcIiwgKCkgPT4ge1xyXG4gICAgZWRpdG9yLmV2ZW50cy5tb3VzZU92ZXIgPSBudWxsO1xyXG4gICAgZWRpdG9yLmRyYXcoKTtcclxuICB9KTtcclxuICBlZGl0b3IuaHRtbC5lZGl0b3IuYWRkRXZlbnRMaXN0ZW5lcihcInNjcm9sbFwiLCAoKSA9PiB7XHJcbiAgICBlZGl0b3IuZXZlbnRzLm1vdXNlT3ZlciA9IG51bGw7XHJcbiAgICBlZGl0b3IuZHJhdygpO1xyXG4gIH0pO1xyXG5cclxuICAvLyBNYWtlIHRoZSBzY3JvbGx3aGVlbCBjYXVzZSBob3Jpem9udGFsIHNjcm9sbGluZyBpbiB0aGUgZWRpdG9yLCBub3QgdmVydGljYWxcclxuICAvLyBGaXJlZm94IGlzICdET01Nb3VzZVNjcm9sbCcgYW5kIGJhc2ljYWxseSBldmVyeXRoaW5nIGVsc2UgaXMgJ21vdXNld2hlZWwnXHJcbiAgZWRpdG9yLmh0bWwuZWRpdG9yLmFkZEV2ZW50TGlzdGVuZXIoXHJcbiAgICBcIm1vdXNld2hlZWxcIixcclxuICAgIChlKSA9PiBlZGl0b3JTY3JvbGxFdmVudChlLCBlZGl0b3IpLFxyXG4gICAgZmFsc2VcclxuICApO1xyXG4gIGVkaXRvci5odG1sLmVkaXRvci5hZGRFdmVudExpc3RlbmVyKFxyXG4gICAgXCJET01Nb3VzZVNjcm9sbFwiLFxyXG4gICAgKGUpID0+IGVkaXRvclNjcm9sbEV2ZW50KGUsIGVkaXRvciksXHJcbiAgICBmYWxzZVxyXG4gICk7XHJcblxyXG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJwYXN0ZVwiLCAoZSkgPT4ge1xyXG4gICAgY29uc3QgY2xpcGJvYXJkVGV4dCA9IGUuY2xpcGJvYXJkRGF0YS5nZXREYXRhKCd0ZXh0Jyk7XHJcbiAgICBjb25zb2xlLmxvZyhjbGlwYm9hcmRUZXh0KTtcclxuICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICB9KTtcclxufTtcclxuXHJcbmZ1bmN0aW9uIGVkaXRvclNjcm9sbEV2ZW50KGU6IEV2ZW50LCBlZGl0b3I6IEVkaXRvcikge1xyXG4gIGUgPSB3aW5kb3cuZXZlbnQgfHwgZTtcclxuXHJcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcclxuICBjb25zdCB3aGVlbEV2ZW50ID0gZSBhcyBhbnk7XHJcblxyXG4gIGNvbnN0IGRlbHRhID0gTWF0aC5tYXgoLTEsIE1hdGgubWluKDEsIHdoZWVsRXZlbnQud2hlZWxEZWx0YSB8fCAtd2hlZWxFdmVudC5kZXRhaWwpKTtcclxuICBlZGl0b3IuaHRtbC5lZGl0b3Iuc2Nyb2xsTGVmdCAtPSBkZWx0YSAqIDY0O1xyXG4gIGUucHJldmVudERlZmF1bHQoKTtcclxufTtcclxuXHJcbmZ1bmN0aW9uIGNhbnZhc01vdXNlTW92ZUV2ZW50KGU6IE1vdXNlRXZlbnQsIGVkaXRvcjogRWRpdG9yKSB7XHJcbiAgZWRpdG9yLmV2ZW50cy5tb3VzZU92ZXIgPSByZWxhdGl2ZUNvb3JkcyhlLCBlZGl0b3IpO1xyXG4gIGlmIChlZGl0b3IuZXZlbnRzLmRyYWdnaW5nKSB7XHJcbiAgICBpZiAoZS5idXR0b25zICE9IDEpIHtcclxuICAgICAgZWRpdG9yLmV2ZW50cy5kcmFnZ2luZyA9IGZhbHNlO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgZWRpdG9yLmV2ZW50cy5zZWxlY3RlZC5lbmRYID0gZWRpdG9yLmV2ZW50cy5tb3VzZU92ZXIueDtcclxuICAgICAgZWRpdG9yLmV2ZW50cy5zZWxlY3RlZC5lbmRZID0gZWRpdG9yLmV2ZW50cy5tb3VzZU92ZXIueTtcclxuICAgIH1cclxuICB9XHJcbiAgZWRpdG9yLmRyYXcoKTtcclxufTtcclxuXHJcbmZ1bmN0aW9uIHJlbGF0aXZlQ29vcmRzKGU6IE1vdXNlRXZlbnQsIGVkaXRvcjogRWRpdG9yKSB7XHJcbiAgY29uc3QgYm91bmRzID0gZWRpdG9yLmh0bWwuZ3JpZC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuICBjb25zdCB4ID0gZS5jbGllbnRYIC0gYm91bmRzLmxlZnQ7XHJcbiAgY29uc3QgeSA9IGUuY2xpZW50WSAtIGJvdW5kcy50b3A7XHJcbiAgcmV0dXJuIHtcclxuICAgIHg6IE1hdGguZmxvb3IoeCAvIENPTF9TSVpFKSxcclxuICAgIHk6IE1hdGguZmxvb3IoeSAvIFJPV19TSVpFKSxcclxuICB9O1xyXG59O1xyXG4iLCJpbXBvcnQgeyBlZGl0b3JEcmF3IH0gZnJvbSBcIi4vZWRpdG9yLWRyYXdcIlxyXG5pbXBvcnQgeyBlZGl0b3JJbml0IH0gZnJvbSBcIi4vZWRpdG9yLWluaXRcIlxyXG5cclxuZXhwb3J0IGNsYXNzIEVkaXRvciB7XHJcbiAgaHRtbDoge1xyXG4gICAgZWRpdG9yOiBIVE1MRWxlbWVudCxcclxuICAgIGdyaWQ6IEhUTUxFbGVtZW50LFxyXG4gICAgY2FudmFzOiBIVE1MQ2FudmFzRWxlbWVudCxcclxuICAgIGNvbnRleHQ6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCxcclxuICAgIHN0b3BzOiBIVE1MRWxlbWVudCxcclxuICAgIHNlcnZpY2VzOiBIVE1MRWxlbWVudFxyXG4gIH07XHJcblxyXG4gIHByaXZhdGUgX2NvbnRlbnQ6IHN0cmluZ1tdW107XHJcblxyXG4gIGV2ZW50czoge1xyXG4gICAgbW91c2VPdmVyOiB7XHJcbiAgICAgIHg6IG51bWJlcixcclxuICAgICAgeTogbnVtYmVyXHJcbiAgICB9IHwgbnVsbCxcclxuICAgIHNlbGVjdGVkOiB7XHJcbiAgICAgIHN0YXJ0WDogbnVtYmVyLFxyXG4gICAgICBzdGFydFk6IG51bWJlcixcclxuICAgICAgZW5kWDogbnVtYmVyLFxyXG4gICAgICBlbmRZOiBudW1iZXJcclxuICAgIH0gfCBudWxsLFxyXG4gICAgZHJhZ2dpbmc6IGJvb2xlYW5cclxuICB9O1xyXG5cclxuICBjb25zdHJ1Y3RvcihlZGl0b3JJRDogc3RyaW5nLCBncmlkSUQ6IHN0cmluZywgY2FudmFzSUQ6IHN0cmluZywgc3RvcHNJRDogc3RyaW5nLCBzZXJ2aWNlc0lEOiBzdHJpbmcpIHtcclxuICAgIGNvbnN0IGVkaXRvciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGVkaXRvcklEKTtcclxuICAgIGNvbnN0IGdyaWQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChncmlkSUQpO1xyXG4gICAgY29uc3QgY2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoY2FudmFzSUQpIGFzIEhUTUxDYW52YXNFbGVtZW50O1xyXG4gICAgY29uc3QgY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KFwiMmRcIik7XHJcbiAgICBjb25zdCBzdG9wcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHN0b3BzSUQpO1xyXG4gICAgY29uc3Qgc2VydmljZXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChzZXJ2aWNlc0lEKTtcclxuICAgIHRoaXMuaHRtbCA9IHtcclxuICAgICAgZWRpdG9yOiBlZGl0b3IsXHJcbiAgICAgIGdyaWQ6IGdyaWQsXHJcbiAgICAgIGNhbnZhczogY2FudmFzLFxyXG4gICAgICBjb250ZXh0OiBjb250ZXh0LFxyXG4gICAgICBzdG9wczogc3RvcHMsXHJcbiAgICAgIHNlcnZpY2VzOiBzZXJ2aWNlcyxcclxuICAgIH07XHJcbiAgICB0aGlzLl9jb250ZW50ID0gW107XHJcbiAgICB0aGlzLmV2ZW50cyA9IHtcclxuICAgICAgbW91c2VPdmVyOiBudWxsLFxyXG4gICAgICBzZWxlY3RlZDogbnVsbCxcclxuICAgICAgZHJhZ2dpbmc6IGZhbHNlLFxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIHdpbmRvd1Jlc2l6ZWQoKSB7XHJcbiAgICB0aGlzLmV2ZW50cy5tb3VzZU92ZXIgPSBudWxsO1xyXG4gICAgdGhpcy5kcmF3KCk7XHJcbiAgfVxyXG5cclxuICBpbml0KCkge1xyXG4gICAgZWRpdG9ySW5pdCh0aGlzKTtcclxuICB9XHJcbiAgZHJhdygpIHtcclxuICAgIGVkaXRvckRyYXcodGhpcyk7XHJcbiAgfVxyXG4gIHNldCBjb250ZW50KG5ld0NvbnRlbnQ6IHN0cmluZ1tdW10pIHtcclxuICAgIHRoaXMuX2NvbnRlbnQgPSBuZXdDb250ZW50O1xyXG4gICAgdGhpcy5kcmF3KCk7XHJcbiAgfVxyXG4gIGdldCBjb250ZW50KCk6IHN0cmluZ1tdW10ge1xyXG4gICAgcmV0dXJuIHRoaXMuX2NvbnRlbnQ7XHJcbiAgfVxyXG59XHJcbiIsImltcG9ydCB7IEVkaXRvciB9IGZyb20gXCIuL2VkaXRvclwiO1xyXG5pbXBvcnQgeyBOZXR3b3JrIH0gZnJvbSBcIi4vbmV0d29ya1wiO1xyXG5pbXBvcnQgeyBOZXdUaW1ldGFibGVEaWFsb2cgfSBmcm9tIFwiLi9uZXctdGltZXRhYmxlLWRpYWxvZ1wiO1xyXG5cclxubGV0IHRpbWV0YWJsZTogc3RyaW5nID0gbnVsbDtcclxuXHJcbi8vIEluaXRpYWxpemUgdGhlIGVkaXRvci5cclxuY29uc3QgZWRpdG9yID0gbmV3IEVkaXRvcihcImVkaXRvclwiLCBcImdyaWRcIiwgXCJncmlkLWNhbnZhc1wiLCBcInN0b3BzXCIsIFwic2VydmljZXNcIik7XHJcbmVkaXRvci5pbml0KCk7XHJcbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwicmVzaXplXCIsICgpID0+IGVkaXRvci53aW5kb3dSZXNpemVkKCkpO1xyXG5cclxuLy8gSW50aWFsaXplIHRoZSBuZXcgdGltZXRhYmxlIGRpYWxvZy5cclxuY29uc3QgbmV3VGltZXRhYmxlRGlhbG9nID0gbmV3IE5ld1RpbWV0YWJsZURpYWxvZyhcIm5ldy10aW1ldGFibGUtZGlhbG9nXCIsXHJcbiAgZGlhbG9nU3VibWl0dGVkKTtcclxuXHJcbi8vIEJlZ2luIGRvd25sb2FkaW5nIHRoZSBuZXR3b3JrIGluZm9ybWF0aW9uIGZyb20gdGhlIEFQSS5cclxuY29uc3QgbmV0d29yayA9IG5ldyBOZXR3b3JrKCk7XHJcbm5ldHdvcmsubG9hZCgpLnRoZW4oKCkgPT4ge1xyXG4gIC8vIFdoZW4gZG93bmxvYWQgaXMgZmluaXNoZWQsIGluaXRpYWxpemUgdGhlIG5ldyB0aW1ldGFibGUgZGlhbG9nIGFuZCBzaG93XHJcbiAgLy8gdGhlIHdlbGNvbWUgc2NyZWVuLlxyXG4gIG5ld1RpbWV0YWJsZURpYWxvZy5pbml0KG5ldHdvcmspO1xyXG4gIHNob3dXZWxjb21lKCk7XHJcbn0pO1xyXG5cclxuLy8gV2lyZSB1cCB0aGUgbmV3IHRpbWV0YWJsZSBidXR0b24gdG8gc2hvdyB0aGUgZGlhbG9nIHdoZW4gY2xpY2tlZC4gVGhlIG5ld1xyXG4vLyB0aW1ldGFibGUgYnV0dG9uIGlzIGRpc2FibGVkIHVudGlsIHRoZSBuZXR3b3JrIGlzIGxvYWRlZC5cclxuY29uc3QgbmV3VGltZXRhYmxlQnV0dG9uOiBIVE1MQnV0dG9uRWxlbWVudCA9XHJcbiAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNuZXctdGltZXRhYmxlLWJ1dHRvblwiKVxyXG5jb25zdCBpbXBvcnRCdXR0b246IEhUTUxCdXR0b25FbGVtZW50ID1cclxuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2ltcG9ydC1idXR0b25cIik7XHJcbmNvbnN0IGV4cG9ydEJ1dHRvbjogSFRNTEJ1dHRvbkVsZW1lbnQgPVxyXG4gIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjZXhwb3J0LWJ1dHRvblwiKTtcclxuXHJcbmNvbnN0IHN0YXR1cyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjc3RhdHVzXCIpO1xyXG5jb25zdCBzdGF0dXNMb2FkaW5nID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNzdGF0dXMtbG9hZGluZ1wiKTtcclxuY29uc3Qgc3RhdHVzUmVhZHkgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3N0YXR1cy1yZWFkeVwiKTtcclxuXHJcbm5ld1RpbWV0YWJsZUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xyXG4gIGNvbnN0IHJlc3VsdCA9IHRpbWV0YWJsZSA9PSBudWxsIHx8IGNvbmZpcm0oXCJDcmVhdGUgYSBuZXcgdGltZXRhYmxlPyBcIiArXHJcbiAgICBcIlRoZSBleGlzdGluZyBvbmUgd29uJ3QgYmUgc2F2ZWQgYW55d2hlcmUuXCIpO1xyXG5cclxuICBpZiAocmVzdWx0KSB7XHJcbiAgICBuZXdUaW1ldGFibGVEaWFsb2cuc2hvdygpO1xyXG4gIH1cclxufSk7XHJcblxyXG5mdW5jdGlvbiBzaG93V2VsY29tZSgpIHtcclxuICAvLyBDbGVhciB0aGUgZWRpdG9yIGFuZCBoaWRlIHRoZSBsb2FkaW5nIHNjcmVlbi5cclxuICBlZGl0b3IuY29udGVudCA9IFtdO1xyXG4gIHN0YXR1c0xvYWRpbmcuY2xhc3NMaXN0LmFkZChcImdvbmVcIik7XHJcblxyXG4gIC8vIEhpZGUgbG9hZGluZyBzY3JlZW4gYW5kIGVuYWJsZSBoZWFkZXIgYnV0dG9ucyBmb3IgbmV3IHRpbWV0YWJsZSBhbmQgaW1wb3J0LlxyXG4gIHN0YXR1cy5jbGFzc0xpc3QucmVtb3ZlKFwiZ29uZVwiKTtcclxuICBzdGF0dXNSZWFkeS5jbGFzc0xpc3QucmVtb3ZlKFwiZ29uZVwiKTtcclxuICBuZXdUaW1ldGFibGVCdXR0b24uZGlzYWJsZWQgPSBmYWxzZTtcclxuICBpbXBvcnRCdXR0b24uZGlzYWJsZWQgPSBmYWxzZTtcclxuXHJcbiAgLy8gRG8gbm90IGFzayB0aGUgdXNlciBiZWZvcmUgbGVhdmluZy5cclxuICB3aW5kb3cub25iZWZvcmV1bmxvYWQgPSBudWxsO1xyXG59XHJcbmZ1bmN0aW9uIGRpYWxvZ1N1Ym1pdHRlZChsaW5lSUQ6IG51bWJlciwgZGF5czogc3RyaW5nLCB0aW1ldGFibGVJRDogc3RyaW5nKSB7XHJcbiAgdGltZXRhYmxlID0gXCJTb21ldGhpbmchXCI7XHJcbiAgc2hvd0VkaXRvcigpO1xyXG4gIC8vIHRocm93IG5ldyBFcnJvcihcIk5vdCBpbXBsZW1lbnRlZCB5ZXQhXCIpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBzaG93RWRpdG9yKCkge1xyXG4gIC8vIFRvZG86IEhpZGUgdGhlIHdlbGNvbWUvbG9hZGluZyBzY3JlZW5zLCBwb3B1bGF0ZSB0aGUgc2VjdGlvbnMgaW4gdGhlXHJcbiAgLy8gaGVhZGVyLiBNYXliZSBldmVuIGVuYWJsZSB0aGUgXCJleHBvcnRcIiBidXR0b24/XHJcbiAgc3RhdHVzTG9hZGluZy5jbGFzc0xpc3QuYWRkKFwiZ29uZVwiKTtcclxuICBzdGF0dXNSZWFkeS5jbGFzc0xpc3QuYWRkKFwiZ29uZVwiKTtcclxuICBzdGF0dXMuY2xhc3NMaXN0LmFkZChcImdvbmVcIik7XHJcbiAgbmV3VGltZXRhYmxlQnV0dG9uLmRpc2FibGVkID0gZmFsc2U7XHJcbiAgaW1wb3J0QnV0dG9uLmRpc2FibGVkID0gZmFsc2U7XHJcbiAgZXhwb3J0QnV0dG9uLmRpc2FibGVkID0gdHJ1ZTtcclxuXHJcbiAgY29uc3QgY29udGVudDogc3RyaW5nW11bXSA9IFtdO1xyXG4gIGZvciAobGV0IHggPSAwOyB4IDwgNTA7IHgrKykge1xyXG4gICAgY29udGVudFt4XSA9IFtdO1xyXG4gICAgZm9yIChsZXQgeSA9IDA7IHkgPCAzMDsgeSsrKSB7XHJcbiAgICAgIGNvbnRlbnRbeF1beV0gPSBcIjAwOjAwXCI7XHJcbiAgICB9XHJcbiAgfVxyXG4gIGVkaXRvci5jb250ZW50ID0gY29udGVudDtcclxuXHJcbiAgLy8gQXNrIHRoZSB1c2VyIGJlZm9yZSBsZWF2aW5nLlxyXG4gIHdpbmRvdy5vbmJlZm9yZXVubG9hZCA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH07XHJcbn1cclxuIiwidHlwZSBOZXR3b3JrQXBpVjFTY2hlbWEgPSB7XHJcbiAgaGFzaDogc3RyaW5nLFxyXG4gIHN0b3BzOiB7XHJcbiAgICBpZDogbnVtYmVyLFxyXG4gICAgbmFtZTogc3RyaW5nLFxyXG4gICAgcGxhdGZvcm1zOiB7XHJcbiAgICAgIGlkOiBzdHJpbmcsXHJcbiAgICAgIG5hbWU6IHN0cmluZ1xyXG4gICAgfVtdLFxyXG4gICAgdXJsTmFtZTogc3RyaW5nXHJcbiAgfVtdLFxyXG4gIGxpbmVzOiB7XHJcbiAgICBpZDogbnVtYmVyLFxyXG4gICAgbmFtZTogc3RyaW5nLFxyXG4gICAgY29sb3I6IHN0cmluZyxcclxuICAgIHNlcnZpY2U6IHN0cmluZyxcclxuICAgIHJvdXRlVHlwZTogc3RyaW5nLFxyXG4gICAgZGlyZWN0aW9uczoge1xyXG4gICAgICBpZDogc3RyaW5nLFxyXG4gICAgICBuYW1lOiBzdHJpbmcsXHJcbiAgICAgIHN0b3BzOiBudW1iZXJbXVxyXG4gICAgfVtdXHJcbiAgfVtdXHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBOZXR3b3JrIHtcclxuICBkb21haW46IHN0cmluZztcclxuICBqc29uOiBOZXR3b3JrQXBpVjFTY2hlbWEgfCBudWxsO1xyXG4gIGNvbnN0cnVjdG9yKGRvbWFpbiA9IFwiYXBpLnRyYWluYXJyaXZlcy5pblwiKSB7XHJcbiAgICB0aGlzLmRvbWFpbiA9IGRvbWFpbjtcclxuICAgIHRoaXMuanNvbiA9IG51bGw7XHJcbiAgfVxyXG4gIGFzeW5jIGxvYWQoKSB7XHJcbiAgICBjb25zdCBhcGkgPSBcIm5ldHdvcmsvdjFcIjtcclxuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goYGh0dHBzOi8vJHt0aGlzLmRvbWFpbn0vJHthcGl9YClcclxuICAgIGlmIChyZXNwb25zZS5zdGF0dXMgIT0gMjAwKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcihgXCIke3RoaXMuZG9tYWlufVwiIGRpZCBub3QgcmVzcG9uZC5gKTtcclxuICAgIH1cclxuICAgIHRoaXMuanNvbiA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKSBhcyBOZXR3b3JrQXBpVjFTY2hlbWE7XHJcbiAgfVxyXG4gIGdldCBsaW5lcygpIHtcclxuICAgIGlmICh0aGlzLmpzb24gPT0gbnVsbCkge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJOZXR3b3JrIG5vdCBsb2FkZWQuXCIpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRoaXMuanNvbi5saW5lcztcclxuICB9XHJcbn1cclxuIiwiaW1wb3J0IHsgTmV0d29yayB9IGZyb20gXCIuL25ldHdvcmtcIjtcclxuXHJcbmV4cG9ydCB0eXBlIE5ld1RpbWV0YWJsZURpYWxvZ0NhbGxiYWNrID1cclxuICAobGluZUlEOiBudW1iZXIsIGRheXM6IHN0cmluZywgdGltZXRhYmxlSUQ6IHN0cmluZykgPT4gdm9pZFxyXG5cclxuZXhwb3J0IGNsYXNzIE5ld1RpbWV0YWJsZURpYWxvZyB7XHJcbiAgLy8gVHlwZXNjcmlwdCBkb2VzIG5vdCBoYXZlIHVwIHRvIGRhdGUgZGlhbG9nIHR5cGUgaW5mb3JtYXRpb24sIHNvIHRoaXMgaXNcclxuICAvLyBuZWVkZWQgdG8gYmUgYWJsZSB0byBjYWxsIHNob3dNb2RhbCgpLlxyXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XHJcbiAgcHJpdmF0ZSBkaWFsb2c6IGFueTtcclxuXHJcbiAgcHJpdmF0ZSBjYW5jZWxCdXR0b246IEhUTUxCdXR0b25FbGVtZW50O1xyXG4gIHByaXZhdGUgc3VibWl0QnV0dG9uOiBIVE1MQnV0dG9uRWxlbWVudDtcclxuICBwcml2YXRlIGxpbmVzU2VsZWN0OiBIVE1MU2VsZWN0RWxlbWVudDtcclxuICBwcml2YXRlIGRheXNTZWxlY3Q6IEhUTUxTZWxlY3RFbGVtZW50O1xyXG4gIHByaXZhdGUgaWRGaWVsZElEOiBIVE1MSW5wdXRFbGVtZW50O1xyXG5cclxuICBwcml2YXRlIHN1Ym1pdHRlZDogTmV3VGltZXRhYmxlRGlhbG9nQ2FsbGJhY2s7XHJcblxyXG4gIGNvbnN0cnVjdG9yKGh0bWxJRDogc3RyaW5nLCBzdWJtaXR0ZWQ6IE5ld1RpbWV0YWJsZURpYWxvZ0NhbGxiYWNrKSB7XHJcblxyXG4gICAgdGhpcy5kaWFsb2cgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAjJHtodG1sSUR9YCk7XHJcbiAgICB0aGlzLmNhbmNlbEJ1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYCMke2h0bWxJRH0tY2FuY2VsYCk7XHJcbiAgICB0aGlzLnN1Ym1pdEJ1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYCMke2h0bWxJRH0tc3VibWl0YCk7XHJcbiAgICB0aGlzLmxpbmVzU2VsZWN0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgIyR7aHRtbElEfS1saW5lc2ApO1xyXG4gICAgdGhpcy5kYXlzU2VsZWN0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgIyR7aHRtbElEfS1kYXlzYCk7XHJcbiAgICB0aGlzLmlkRmllbGRJRCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYCMke2h0bWxJRH0taWRgKTtcclxuXHJcbiAgICB0aGlzLnN1Ym1pdHRlZCA9IHN1Ym1pdHRlZDtcclxuICB9XHJcbiAgaW5pdChuZXR3b3JrOiBOZXR3b3JrKSB7XHJcbiAgICAvLyBTb3J0IGxpbmVzIGJ5IG5hbWUgYWxwaGFiZXRpY2FsIG9yZGVyLCBhbmQgYWRkIGFuIG9wdGlvbiBmb3IgZWFjaCB0byB0aGVcclxuICAgIC8vIGxpbmVzIHNlbGVjdC5cclxuICAgIGNvbnN0IGxpbmVzID0gWy4uLm5ldHdvcmsubGluZXNdXHJcbiAgICAgIC5zb3J0KChhLCBiKSA9PiBhLm5hbWUubG9jYWxlQ29tcGFyZShiLm5hbWUpKTtcclxuICAgIGxpbmVzLm1hcChsaW5lID0+IHtcclxuICAgICAgY29uc3Qgb3B0aW9uID0gbmV3IE9wdGlvbihsaW5lLm5hbWUsIGxpbmUuaWQudG9TdHJpbmcoKSk7XHJcbiAgICAgIHRoaXMubGluZXNTZWxlY3QuYXBwZW5kQ2hpbGQob3B0aW9uKTtcclxuICAgIH0pXHJcblxyXG4gICAgLy8gQ2xvc2UgdGhlIGRpYWxvZyBpZiB0aGUgY2xvc2UgYnV0dG9uIGlzIGNsaWNrZWQuIE5vdGUgdGhhdCBwcmVzc2luZyBFU0NcclxuICAgIC8vIGFsc28gY2xvc2VzIHRoZSBkaWFsb2csIHNvIGl0IGNhbm5vdCBiZSBhc3N1bWVkIHRoaXMgd2lsbCBydW4uXHJcbiAgICB0aGlzLmNhbmNlbEJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xyXG4gICAgICB0aGlzLmRpYWxvZy5jbG9zZSgpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gUmV0cmlldmUgdGhlIHZhbHVlcywgcnVuIHRoZSBjYWxsYmFjaywgYW5kIGNsb3NlIHRoZSBkaWFsb2cgd2hlbiB0aGVcclxuICAgIC8vIHN1Ym1pdCBidXR0b24gaXMgcHJlc3NlZC4gSWYgYW55IGVycm9yIG9jY3VycywgZGlzcGxheSB0aGUgZXJyb3IgYW5kIGRvXHJcbiAgICAvLyBub3QgY2xvc2UgdGhlIGRpYWxvZy5cclxuICAgIHRoaXMuc3VibWl0QnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAgIGNvbnN0IGxpbmVJRFN0ciA9IHRoaXMubGluZXNTZWxlY3QudmFsdWU7XHJcbiAgICAgIGNvbnN0IGRheXMgPSB0aGlzLmRheXNTZWxlY3QudmFsdWU7XHJcbiAgICAgIGNvbnN0IHRpbWV0YWJsZUlEID0gdGhpcy5pZEZpZWxkSUQudmFsdWU7XHJcbiAgICAgIGNvbnN0IGxpbmVJRE51bSA9IHBhcnNlSW50KGxpbmVJRFN0cik7XHJcblxyXG4gICAgICB0cnkge1xyXG4gICAgICAgIHRoaXMuc3VibWl0dGVkKGxpbmVJRE51bSwgZGF5cywgdGltZXRhYmxlSUQpXHJcbiAgICAgICAgdGhpcy5kaWFsb2cuY2xvc2UoKTtcclxuICAgICAgfVxyXG4gICAgICBjYXRjaCB7XHJcbiAgICAgICAgLy8gdG9kbzogaGFuZGxlIGludmFsaWQgaW5wdXRcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfVxyXG4gIHNob3coKSB7XHJcbiAgICB0aGlzLmRpYWxvZy5zaG93TW9kYWwoKTtcclxuICB9XHJcbn1cclxuIl19
