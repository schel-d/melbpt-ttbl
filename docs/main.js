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
exports.Header = void 0;
class Header {
    constructor(newTimetableButton, importButton, exportButton) {
        this.newTimetableButton = document.querySelector("#" + newTimetableButton);
        this.importButton = document.querySelector("#" + importButton);
        this.exportButton = document.querySelector("#" + exportButton);
    }
    set newTimetableButtonEnabled(value) {
        this.newTimetableButton.disabled = !value;
    }
    set importButtonEnabled(value) {
        this.importButton.disabled = !value;
    }
    set exportButtonEnabled(value) {
        this.exportButton.disabled = !value;
    }
}
exports.Header = Header;
},{}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const editor_1 = require("./editor");
const header_1 = require("./header");
const network_1 = require("./network");
const new_timetable_dialog_1 = require("./new-timetable-dialog");
const status_screens_1 = require("./status-screens");
let timetable = null;
// Initialize the editor.
const editor = new editor_1.Editor("editor", "grid", "grid-canvas", "stops", "services");
editor.init();
window.addEventListener("resize", () => editor.windowResized());
// Initialize the new timetable dialog.
const newTimetableDialog = new new_timetable_dialog_1.NewTimetableDialog("new-timetable-dialog", dialogSubmitted);
// Initialize the header and status screens, and ensuring the loading screen is
// displaying correctly (should be default in markup anyway - that way it shows
// before the script is loaded too).
const header = new header_1.Header("new-timetable-button", "import-button", "export-button");
const status = new status_screens_1.StatusScreens("status", editor, header);
status.loading();
// Begin downloading the network information from the API.
const network = new network_1.Network();
network.load().then(() => {
    // When download is finished, initialize the new timetable dialog and show
    // the welcome screen.
    newTimetableDialog.init(network);
    status.ready();
});
// Wire up the new timetable button to show the dialog when clicked. The new
// timetable button is disabled until the network is loaded.
header.newTimetableButton.addEventListener("click", () => {
    const result = timetable == null ||
        confirm("Create a new timetable? This one won't be saved anywhere.");
    if (result) {
        newTimetableDialog.show();
    }
});
function dialogSubmitted(lineID, days, timetableID) {
    timetable = "Something!";
    status.editing();
    const content = [];
    for (let x = 0; x < 50; x++) {
        content[x] = [];
        for (let y = 0; y < 30; y++) {
            content[x][y] = "00:00";
        }
    }
    editor.content = content;
    // throw new Error("Not implemented yet!");
}
},{"./editor":4,"./header":5,"./network":7,"./new-timetable-dialog":8,"./status-screens":9}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Network = void 0;
class Network {
    constructor(domain = "api.trainarrives.in") {
        this.domain = domain;
        this._json = null;
    }
    async load() {
        const api = "network/v1";
        const response = await fetch(`https://${this.domain}/${api}`);
        if (response.status != 200) {
            throw new Error(`"${this.domain}" did not respond.`);
        }
        this._json = await response.json();
    }
    get lines() {
        if (this._json == null) {
            throw new Error("Network not loaded.");
        }
        return this._json.lines;
    }
}
exports.Network = Network;
},{}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewTimetableDialog = void 0;
class NewTimetableDialog {
    constructor(htmlID, submitted) {
        this._dialog = document.querySelector(`#${htmlID}`);
        this._cancelButton = document.querySelector(`#${htmlID}-cancel`);
        this._submitButton = document.querySelector(`#${htmlID}-submit`);
        this._linesSelect = document.querySelector(`#${htmlID}-lines`);
        this._daysSelect = document.querySelector(`#${htmlID}-days`);
        this._idFieldID = document.querySelector(`#${htmlID}-id`);
        this.submitted = submitted;
    }
    init(network) {
        // Sort lines by name alphabetical order, and add an option for each to the
        // lines select.
        const lines = [...network.lines]
            .sort((a, b) => a.name.localeCompare(b.name));
        lines.map(line => {
            const option = new Option(line.name, line.id.toString());
            this._linesSelect.appendChild(option);
        });
        // Close the dialog if the close button is clicked. Note that pressing ESC
        // also closes the dialog, so it cannot be assumed this will run.
        this._cancelButton.addEventListener("click", () => {
            this._dialog.close();
        });
        // Retrieve the values, run the callback, and close the dialog when the
        // submit button is pressed. If any error occurs, display the error and do
        // not close the dialog.
        this._submitButton.addEventListener("click", () => {
            const lineIDStr = this._linesSelect.value;
            const days = this._daysSelect.value;
            const timetableID = this._idFieldID.value;
            const lineIDNum = parseInt(lineIDStr);
            try {
                this.submitted(lineIDNum, days, timetableID);
                this._dialog.close();
            }
            catch (_a) {
                // todo: handle invalid input
            }
        });
    }
    show() {
        this._dialog.showModal();
    }
}
exports.NewTimetableDialog = NewTimetableDialog;
},{}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatusScreens = void 0;
class StatusScreens {
    constructor(htmlID, editor, header) {
        this._status = document.querySelector(`#${htmlID}`);
        this._statusLoading = document.querySelector(`#${htmlID}-loading`);
        this._statusReady = document.querySelector(`#${htmlID}-ready`);
        this._editor = editor;
        this._header = header;
    }
    loading() {
        this._status.classList.remove("gone");
        this._statusLoading.classList.remove("gone");
        this._statusReady.classList.add("gone");
        this._header.newTimetableButtonEnabled = false;
        this._header.importButtonEnabled = false;
        this._header.exportButtonEnabled = false;
        this._editor.content = [];
        window.onbeforeunload = null;
    }
    ready() {
        this._status.classList.remove("gone");
        this._statusLoading.classList.add("gone");
        this._statusReady.classList.remove("gone");
        this._header.newTimetableButtonEnabled = true;
        this._header.importButtonEnabled = true;
        this._header.exportButtonEnabled = false;
        this._editor.content = [];
        window.onbeforeunload = null;
    }
    editing() {
        this._status.classList.add("gone");
        this._header.newTimetableButtonEnabled = true;
        this._header.importButtonEnabled = true;
        this._header.exportButtonEnabled = true;
        window.onbeforeunload = function () {
            return true;
        };
    }
}
exports.StatusScreens = StatusScreens;
},{}]},{},[6])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJ0cy9jc3MudHMiLCJ0cy9lZGl0b3ItZHJhdy50cyIsInRzL2VkaXRvci1pbml0LnRzIiwidHMvZWRpdG9yLnRzIiwidHMvaGVhZGVyLnRzIiwidHMvbWFpbi50cyIsInRzL25ldHdvcmsudHMiLCJ0cy9uZXctdGltZXRhYmxlLWRpYWxvZy50cyIsInRzL3N0YXR1cy1zY3JlZW5zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7O0FDQWEsUUFBQSxHQUFHLEdBQUcsQ0FBQyxHQUFHLEVBQUU7SUFDdkIsT0FBTztRQUNMLElBQUksRUFBRSw2QkFBNkI7UUFDbkMsT0FBTyxFQUFFLHlCQUF5QjtRQUNsQyxNQUFNLEVBQUUsU0FBUztRQUNqQixjQUFjLEVBQUUsOEJBQThCO0tBQy9DLENBQUM7QUFDSixDQUFDLENBQUMsRUFBRSxDQUFDOzs7OztBQ05MLCtCQUE0QjtBQUVmLFFBQUEsUUFBUSxHQUFHLEVBQUUsQ0FBQztBQUNkLFFBQUEsUUFBUSxHQUFHLEVBQUUsQ0FBQztBQUMzQixNQUFNLGFBQWEsR0FBRyxDQUFDLENBQUM7QUFDeEIsTUFBTSxhQUFhLEdBQUcsRUFBRSxDQUFDO0FBRXpCLFNBQWdCLFVBQVUsQ0FBQyxNQUFjOztJQUN2QyxNQUFNLE1BQU0sR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQztJQUNsQyxNQUFNLE9BQU8sR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQztJQUNwQyxNQUFNLE9BQU8sR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDO0lBRS9CLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUM7SUFDNUIsTUFBTSxJQUFJLEdBQUcsTUFBQSxNQUFBLE9BQU8sQ0FBQyxDQUFDLENBQUMsMENBQUUsTUFBTSxtQ0FBSSxDQUFDLENBQUM7SUFDckMsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxLQUFLLElBQUksQ0FBQyxFQUFFO1FBQzFDLE1BQU0sMERBQTBELENBQUM7S0FDbEU7SUFFRCxNQUFNLFFBQVEsR0FBRyxpQkFBaUIsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUM1QyxNQUFNLEtBQUssR0FBRyxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBRW5ELDZFQUE2RTtJQUM3RSxpQkFBaUI7SUFDakIsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxnQkFBUSxHQUFHLElBQUksR0FBRyxJQUFJLENBQUM7SUFDdEQsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxnQkFBUSxHQUFHLElBQUksR0FBRyxJQUFJLENBQUM7SUFFdkQsc0VBQXNFO0lBQ3RFLDhFQUE4RTtJQUM5RSxxQ0FBcUM7SUFDckMsTUFBTSxDQUFDLEtBQUssR0FBRyxnQkFBUSxHQUFHLEtBQUssQ0FBQyxLQUFLLEdBQUcsUUFBUSxDQUFDO0lBQ2pELE1BQU0sQ0FBQyxNQUFNLEdBQUcsZ0JBQVEsR0FBRyxLQUFLLENBQUMsTUFBTSxHQUFHLFFBQVEsQ0FBQztJQUNuRCxNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxnQkFBUSxHQUFHLEtBQUssQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO0lBQ25ELE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLGdCQUFRLEdBQUcsS0FBSyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7SUFDckQsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUcsZ0JBQVEsR0FBRyxLQUFLLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQztJQUMvQyxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBRyxnQkFBUSxHQUFHLEtBQUssQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDO0lBRTlDLDBFQUEwRTtJQUMxRSxZQUFZO0lBQ1osT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3JELE9BQU8sQ0FBQyxTQUFTLENBQ2YsQ0FBQyxLQUFLLENBQUMsRUFBRSxHQUFHLGdCQUFRLEdBQUcsUUFBUSxFQUMvQixDQUFDLEtBQUssQ0FBQyxFQUFFLEdBQUcsZ0JBQVEsR0FBRyxRQUFRLENBQ2hDLENBQUM7SUFDRixPQUFPLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQztJQUVsQyxtREFBbUQ7SUFDbkQsT0FBTyxDQUFDLFNBQVMsR0FBRyxTQUFHLENBQUMsT0FBTyxDQUFDO0lBQ2hDLEtBQUssSUFBSSxDQUFDLEdBQUcsS0FBSyxDQUFDLEVBQUUsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRTtRQUN4QyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQ2QsU0FBUztTQUNWO1FBQ0QsT0FBTyxDQUFDLFFBQVEsQ0FDZCxLQUFLLENBQUMsRUFBRSxHQUFHLGdCQUFRLEVBQ25CLENBQUMsR0FBRyxnQkFBUSxFQUNaLEtBQUssQ0FBQyxLQUFLLEdBQUcsZ0JBQVEsRUFDdEIsZ0JBQVEsQ0FDVCxDQUFDO0tBQ0g7SUFFRCxnQ0FBZ0M7SUFDaEMsT0FBTyxDQUFDLElBQUksR0FBRyxpQ0FBaUMsQ0FBQztJQUNqRCxPQUFPLENBQUMsU0FBUyxHQUFHLFNBQUcsQ0FBQyxJQUFJLENBQUM7SUFDN0IsS0FBSyxJQUFJLENBQUMsR0FBRyxLQUFLLENBQUMsRUFBRSxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFO1FBQ3hDLEtBQUssSUFBSSxDQUFDLEdBQUcsS0FBSyxDQUFDLEVBQUUsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUN4QyxNQUFNLEdBQUcsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDMUIsT0FBTyxDQUFDLFFBQVEsQ0FDZCxHQUFHLEVBQ0gsQ0FBQyxHQUFHLGdCQUFRLEdBQUcsYUFBYSxFQUM1QixDQUFDLEdBQUcsZ0JBQVEsR0FBRyxhQUFhLENBQzdCLENBQUM7U0FDSDtLQUNGO0lBRUQsd0RBQXdEO0lBQ3hELE9BQU8sQ0FBQyxTQUFTLEdBQUcsU0FBRyxDQUFDLGNBQWMsQ0FBQztJQUN2QyxNQUFNLFNBQVMsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQztJQUMxQyxJQUFJLFNBQVMsSUFBSSxJQUFJLEVBQUU7UUFDckIsT0FBTyxDQUFDLFFBQVEsQ0FDZCxTQUFTLENBQUMsQ0FBQyxHQUFHLGdCQUFRLEVBQ3RCLFNBQVMsQ0FBQyxDQUFDLEdBQUcsZ0JBQVEsRUFDdEIsZ0JBQVEsRUFDUixnQkFBUSxDQUNULENBQUM7S0FDSDtJQUVELCtDQUErQztJQUMvQyxPQUFPLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxHQUFHLFFBQVEsQ0FBQyxHQUFHLFFBQVEsQ0FBQztJQUMxRCxPQUFPLENBQUMsV0FBVyxHQUFHLFNBQUcsQ0FBQyxNQUFNLENBQUM7SUFDakMsTUFBTSxRQUFRLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUM7SUFDeEMsSUFBSSxRQUFRLElBQUksSUFBSSxFQUFFO1FBQ3BCLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDcEQsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQzVELE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDcEQsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQzVELE9BQU8sQ0FBQyxVQUFVLENBQ2hCLEVBQUUsR0FBRyxnQkFBUSxFQUNiLEVBQUUsR0FBRyxnQkFBUSxFQUNiLENBQUMsR0FBRyxnQkFBUSxFQUNaLENBQUMsR0FBRyxnQkFBUSxDQUNiLENBQUM7S0FDSDtBQUNILENBQUM7QUE5RkQsZ0NBOEZDO0FBQUEsQ0FBQztBQUVGLFNBQVMsZ0JBQWdCLENBQUMsTUFBYyxFQUFFLElBQVksRUFBRSxJQUFZO0lBQ2xFLE1BQU0sVUFBVSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLHFCQUFxQixFQUFFLENBQUM7SUFDOUQsTUFBTSxXQUFXLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMscUJBQXFCLEVBQUUsQ0FBQyxLQUFLLENBQUM7SUFDcEUsTUFBTSxXQUFXLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMscUJBQXFCLEVBQUUsQ0FBQyxNQUFNLENBQUM7SUFDeEUsTUFBTSxTQUFTLEdBQUcsVUFBVSxDQUFDLEtBQUssR0FBRyxXQUFXLENBQUM7SUFDakQsTUFBTSxVQUFVLEdBQUcsVUFBVSxDQUFDLE1BQU0sR0FBRyxXQUFXLENBQUM7SUFFbkQsTUFBTSxPQUFPLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDO0lBQzlDLE1BQU0sT0FBTyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQztJQUU3QyxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxnQkFBUSxDQUFDLENBQUMsQ0FBQztJQUM3RCxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxRQUFRLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEdBQUcsZ0JBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQy9FLE1BQU0sUUFBUSxHQUFHLE1BQU0sR0FBRyxRQUFRLENBQUM7SUFDbkMsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsZ0JBQVEsQ0FBQyxDQUFDLENBQUM7SUFDN0QsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsUUFBUSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxHQUFHLGdCQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUM5RSxNQUFNLFFBQVEsR0FBRyxNQUFNLEdBQUcsUUFBUSxDQUFDO0lBRW5DLE9BQU87UUFDTCxFQUFFLEVBQUUsUUFBUTtRQUNaLEVBQUUsRUFBRSxNQUFNO1FBQ1YsRUFBRSxFQUFFLFFBQVE7UUFDWixFQUFFLEVBQUUsTUFBTTtRQUNWLEtBQUssRUFBRSxRQUFRO1FBQ2YsTUFBTSxFQUFFLFFBQVE7S0FDakIsQ0FBQztBQUNKLENBQUM7QUFBQSxDQUFDO0FBRUYsU0FBUyxpQkFBaUIsQ0FBQyxZQUFzQztJQUMvRCxNQUFNLEdBQUcsR0FBRyxNQUFNLENBQUMsZ0JBQWdCLElBQUksQ0FBQyxDQUFDO0lBRXpDLDhEQUE4RDtJQUM5RCxNQUFNLEdBQUcsR0FBSSxZQUFvQixDQUFDLHNCQUFzQixJQUFJLENBQUMsQ0FBQztJQUU5RCxPQUFPLEdBQUcsR0FBRyxHQUFHLENBQUM7QUFDbkIsQ0FBQztBQUFBLENBQUM7Ozs7O0FDeklGLCtDQUFtRDtBQUVuRCxTQUFnQixVQUFVLENBQUMsTUFBYztJQUN2QyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7SUFFZCxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRTtRQUNyRCxNQUFNLENBQUMsR0FBRyxjQUFjLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ3BDLE1BQU0sQ0FBQyxNQUFNLENBQUMsUUFBUSxHQUFHLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUM1RSxNQUFNLENBQUMsTUFBTSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7UUFDOUIsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ2hCLENBQUMsQ0FBQyxDQUFDO0lBQ0gsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUU7UUFDbkQsTUFBTSxDQUFDLEdBQUcsY0FBYyxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUNwQyxNQUFNLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNsQyxNQUFNLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNsQyxNQUFNLENBQUMsTUFBTSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7UUFDL0IsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ2hCLENBQUMsQ0FBQyxDQUFDO0lBRUgsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FDckQsb0JBQW9CLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUNoQyxDQUFDO0lBQ0YsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FDdEQsb0JBQW9CLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUNoQyxDQUFDO0lBQ0YsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsWUFBWSxFQUFFLEdBQUcsRUFBRTtRQUNyRCxNQUFNLENBQUMsTUFBTSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7UUFDL0IsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ2hCLENBQUMsQ0FBQyxDQUFDO0lBQ0gsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxFQUFFLEdBQUcsRUFBRTtRQUNqRCxNQUFNLENBQUMsTUFBTSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7UUFDL0IsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ2hCLENBQUMsQ0FBQyxDQUFDO0lBRUgsOEVBQThFO0lBQzlFLDRFQUE0RTtJQUM1RSxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FDakMsWUFBWSxFQUNaLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLEVBQ25DLEtBQUssQ0FDTixDQUFDO0lBQ0YsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQ2pDLGdCQUFnQixFQUNoQixDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxFQUNuQyxLQUFLLENBQ04sQ0FBQztJQUVGLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRTtRQUN2QyxNQUFNLGFBQWEsR0FBRyxDQUFDLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN0RCxPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQzNCLENBQUMsQ0FBQyxjQUFjLEVBQUUsQ0FBQztJQUNyQixDQUFDLENBQUMsQ0FBQztBQUNMLENBQUM7QUFsREQsZ0NBa0RDO0FBQUEsQ0FBQztBQUVGLFNBQVMsaUJBQWlCLENBQUMsQ0FBUSxFQUFFLE1BQWM7SUFDakQsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDO0lBRXRCLDhEQUE4RDtJQUM5RCxNQUFNLFVBQVUsR0FBRyxDQUFRLENBQUM7SUFFNUIsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxVQUFVLENBQUMsVUFBVSxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7SUFDckYsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxJQUFJLEtBQUssR0FBRyxFQUFFLENBQUM7SUFDNUMsQ0FBQyxDQUFDLGNBQWMsRUFBRSxDQUFDO0FBQ3JCLENBQUM7QUFBQSxDQUFDO0FBRUYsU0FBUyxvQkFBb0IsQ0FBQyxDQUFhLEVBQUUsTUFBYztJQUN6RCxNQUFNLENBQUMsTUFBTSxDQUFDLFNBQVMsR0FBRyxjQUFjLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQ3BELElBQUksTUFBTSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUU7UUFDMUIsSUFBSSxDQUFDLENBQUMsT0FBTyxJQUFJLENBQUMsRUFBRTtZQUNsQixNQUFNLENBQUMsTUFBTSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7U0FDaEM7YUFBTTtZQUNMLE1BQU0sQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFDeEQsTUFBTSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztTQUN6RDtLQUNGO0lBQ0QsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ2hCLENBQUM7QUFBQSxDQUFDO0FBRUYsU0FBUyxjQUFjLENBQUMsQ0FBYSxFQUFFLE1BQWM7SUFDbkQsTUFBTSxNQUFNLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMscUJBQXFCLEVBQUUsQ0FBQztJQUN4RCxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUM7SUFDbEMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDO0lBQ2pDLE9BQU87UUFDTCxDQUFDLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsc0JBQVEsQ0FBQztRQUMzQixDQUFDLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsc0JBQVEsQ0FBQztLQUM1QixDQUFDO0FBQ0osQ0FBQztBQUFBLENBQUM7Ozs7O0FDdkZGLCtDQUEwQztBQUMxQywrQ0FBMEM7QUFFMUMsTUFBYSxNQUFNO0lBMEJqQixZQUFZLFFBQWdCLEVBQUUsTUFBYyxFQUFFLFFBQWdCLEVBQUUsT0FBZSxFQUFFLFVBQWtCO1FBQ2pHLE1BQU0sTUFBTSxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDakQsTUFBTSxJQUFJLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUM3QyxNQUFNLE1BQU0sR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBc0IsQ0FBQztRQUN0RSxNQUFNLE9BQU8sR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3hDLE1BQU0sS0FBSyxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDL0MsTUFBTSxRQUFRLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUNyRCxJQUFJLENBQUMsSUFBSSxHQUFHO1lBQ1YsTUFBTSxFQUFFLE1BQU07WUFDZCxJQUFJLEVBQUUsSUFBSTtZQUNWLE1BQU0sRUFBRSxNQUFNO1lBQ2QsT0FBTyxFQUFFLE9BQU87WUFDaEIsS0FBSyxFQUFFLEtBQUs7WUFDWixRQUFRLEVBQUUsUUFBUTtTQUNuQixDQUFDO1FBQ0YsSUFBSSxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUM7UUFDbkIsSUFBSSxDQUFDLE1BQU0sR0FBRztZQUNaLFNBQVMsRUFBRSxJQUFJO1lBQ2YsUUFBUSxFQUFFLElBQUk7WUFDZCxRQUFRLEVBQUUsS0FBSztTQUNoQixDQUFDO0lBQ0osQ0FBQztJQUVELGFBQWE7UUFDWCxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7UUFDN0IsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ2QsQ0FBQztJQUVELElBQUk7UUFDRixJQUFBLHdCQUFVLEVBQUMsSUFBSSxDQUFDLENBQUM7SUFDbkIsQ0FBQztJQUNELElBQUk7UUFDRixJQUFBLHdCQUFVLEVBQUMsSUFBSSxDQUFDLENBQUM7SUFDbkIsQ0FBQztJQUNELElBQUksT0FBTyxDQUFDLFVBQXNCO1FBQ2hDLElBQUksQ0FBQyxRQUFRLEdBQUcsVUFBVSxDQUFDO1FBQzNCLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUNkLENBQUM7SUFDRCxJQUFJLE9BQU87UUFDVCxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUM7SUFDdkIsQ0FBQztDQUNGO0FBbkVELHdCQW1FQzs7Ozs7QUN0RUQsTUFBYSxNQUFNO0lBS2pCLFlBQVksa0JBQTBCLEVBQUUsWUFBb0IsRUFDMUQsWUFBb0I7UUFFcEIsSUFBSSxDQUFDLGtCQUFrQixHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsR0FBRyxHQUFHLGtCQUFrQixDQUFDLENBQUM7UUFDM0UsSUFBSSxDQUFDLFlBQVksR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEdBQUcsR0FBRyxZQUFZLENBQUMsQ0FBQztRQUMvRCxJQUFJLENBQUMsWUFBWSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsR0FBRyxHQUFHLFlBQVksQ0FBQyxDQUFDO0lBQ2pFLENBQUM7SUFDRCxJQUFJLHlCQUF5QixDQUFDLEtBQWM7UUFDMUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFFBQVEsR0FBRyxDQUFDLEtBQUssQ0FBQztJQUM1QyxDQUFDO0lBQ0QsSUFBSSxtQkFBbUIsQ0FBQyxLQUFjO1FBQ3BDLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxHQUFHLENBQUMsS0FBSyxDQUFDO0lBQ3RDLENBQUM7SUFDRCxJQUFJLG1CQUFtQixDQUFDLEtBQWM7UUFDcEMsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxLQUFLLENBQUM7SUFDdEMsQ0FBQztDQUNGO0FBckJELHdCQXFCQzs7OztBQ3JCRCxxQ0FBa0M7QUFDbEMscUNBQWtDO0FBQ2xDLHVDQUFvQztBQUNwQyxpRUFBNEQ7QUFDNUQscURBQWlEO0FBRWpELElBQUksU0FBUyxHQUFXLElBQUksQ0FBQztBQUU3Qix5QkFBeUI7QUFDekIsTUFBTSxNQUFNLEdBQUcsSUFBSSxlQUFNLENBQUMsUUFBUSxFQUFFLE1BQU0sRUFBRSxhQUFhLEVBQUUsT0FBTyxFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBQ2hGLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUNkLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLEVBQUUsR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUM7QUFFaEUsdUNBQXVDO0FBQ3ZDLE1BQU0sa0JBQWtCLEdBQUcsSUFBSSx5Q0FBa0IsQ0FBQyxzQkFBc0IsRUFDdEUsZUFBZSxDQUFDLENBQUM7QUFFbkIsK0VBQStFO0FBQy9FLCtFQUErRTtBQUMvRSxvQ0FBb0M7QUFDcEMsTUFBTSxNQUFNLEdBQUcsSUFBSSxlQUFNLENBQUMsc0JBQXNCLEVBQUUsZUFBZSxFQUFFLGVBQWUsQ0FBQyxDQUFDO0FBQ3BGLE1BQU0sTUFBTSxHQUFHLElBQUksOEJBQWEsQ0FBQyxRQUFRLEVBQUUsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQzNELE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUVqQiwwREFBMEQ7QUFDMUQsTUFBTSxPQUFPLEdBQUcsSUFBSSxpQkFBTyxFQUFFLENBQUM7QUFDOUIsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUU7SUFDdkIsMEVBQTBFO0lBQzFFLHNCQUFzQjtJQUN0QixrQkFBa0IsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDakMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDO0FBQ2pCLENBQUMsQ0FBQyxDQUFDO0FBRUgsNEVBQTRFO0FBQzVFLDREQUE0RDtBQUM1RCxNQUFNLENBQUMsa0JBQWtCLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLEdBQUcsRUFBRTtJQUN2RCxNQUFNLE1BQU0sR0FBRyxTQUFTLElBQUksSUFBSTtRQUM5QixPQUFPLENBQUMsMkRBQTJELENBQUMsQ0FBQztJQUV2RSxJQUFJLE1BQU0sRUFBRTtRQUNWLGtCQUFrQixDQUFDLElBQUksRUFBRSxDQUFDO0tBQzNCO0FBQ0gsQ0FBQyxDQUFDLENBQUM7QUFFSCxTQUFTLGVBQWUsQ0FBQyxNQUFjLEVBQUUsSUFBWSxFQUFFLFdBQW1CO0lBQ3hFLFNBQVMsR0FBRyxZQUFZLENBQUM7SUFFekIsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBRWpCLE1BQU0sT0FBTyxHQUFlLEVBQUUsQ0FBQztJQUMvQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFO1FBQzNCLE9BQU8sQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDaEIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUMzQixPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDO1NBQ3pCO0tBQ0Y7SUFDRCxNQUFNLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztJQUV6QiwyQ0FBMkM7QUFDN0MsQ0FBQzs7Ozs7QUNsQ0QsTUFBYSxPQUFPO0lBSWxCLFlBQVksTUFBTSxHQUFHLHFCQUFxQjtRQUN4QyxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztRQUNyQixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztJQUNwQixDQUFDO0lBRUQsS0FBSyxDQUFDLElBQUk7UUFDUixNQUFNLEdBQUcsR0FBRyxZQUFZLENBQUM7UUFDekIsTUFBTSxRQUFRLEdBQUcsTUFBTSxLQUFLLENBQUMsV0FBVyxJQUFJLENBQUMsTUFBTSxJQUFJLEdBQUcsRUFBRSxDQUFDLENBQUE7UUFDN0QsSUFBSSxRQUFRLENBQUMsTUFBTSxJQUFJLEdBQUcsRUFBRTtZQUMxQixNQUFNLElBQUksS0FBSyxDQUFDLElBQUksSUFBSSxDQUFDLE1BQU0sb0JBQW9CLENBQUMsQ0FBQztTQUN0RDtRQUNELElBQUksQ0FBQyxLQUFLLEdBQUcsTUFBTSxRQUFRLENBQUMsSUFBSSxFQUF3QixDQUFDO0lBQzNELENBQUM7SUFFRCxJQUFJLEtBQUs7UUFDUCxJQUFJLElBQUksQ0FBQyxLQUFLLElBQUksSUFBSSxFQUFFO1lBQ3RCLE1BQU0sSUFBSSxLQUFLLENBQUMscUJBQXFCLENBQUMsQ0FBQztTQUN4QztRQUNELE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUM7SUFDMUIsQ0FBQztDQUNGO0FBeEJELDBCQXdCQzs7Ozs7QUM1Q0QsTUFBYSxrQkFBa0I7SUFjN0IsWUFBWSxNQUFjLEVBQUUsU0FBcUM7UUFFL0QsSUFBSSxDQUFDLE9BQU8sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLElBQUksTUFBTSxFQUFFLENBQUMsQ0FBQztRQUNwRCxJQUFJLENBQUMsYUFBYSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsSUFBSSxNQUFNLFNBQVMsQ0FBQyxDQUFDO1FBQ2pFLElBQUksQ0FBQyxhQUFhLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxJQUFJLE1BQU0sU0FBUyxDQUFDLENBQUM7UUFDakUsSUFBSSxDQUFDLFlBQVksR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLElBQUksTUFBTSxRQUFRLENBQUMsQ0FBQztRQUMvRCxJQUFJLENBQUMsV0FBVyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsSUFBSSxNQUFNLE9BQU8sQ0FBQyxDQUFDO1FBQzdELElBQUksQ0FBQyxVQUFVLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxJQUFJLE1BQU0sS0FBSyxDQUFDLENBQUM7UUFFMUQsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7SUFDN0IsQ0FBQztJQUNELElBQUksQ0FBQyxPQUFnQjtRQUNuQiwyRUFBMkU7UUFDM0UsZ0JBQWdCO1FBQ2hCLE1BQU0sS0FBSyxHQUFHLENBQUMsR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDO2FBQzdCLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ2hELEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDZixNQUFNLE1BQU0sR0FBRyxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztZQUN6RCxJQUFJLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN4QyxDQUFDLENBQUMsQ0FBQTtRQUVGLDBFQUEwRTtRQUMxRSxpRUFBaUU7UUFDakUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsR0FBRyxFQUFFO1lBQ2hELElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDdkIsQ0FBQyxDQUFDLENBQUM7UUFFSCx1RUFBdUU7UUFDdkUsMEVBQTBFO1FBQzFFLHdCQUF3QjtRQUN4QixJQUFJLENBQUMsYUFBYSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxHQUFHLEVBQUU7WUFDaEQsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUM7WUFDMUMsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUM7WUFDcEMsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUM7WUFDMUMsTUFBTSxTQUFTLEdBQUcsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBRXRDLElBQUk7Z0JBQ0YsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUUsSUFBSSxFQUFFLFdBQVcsQ0FBQyxDQUFBO2dCQUM1QyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDO2FBQ3RCO1lBQ0QsV0FBTTtnQkFDSiw2QkFBNkI7YUFDOUI7UUFDSCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFDRCxJQUFJO1FBQ0YsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsQ0FBQztJQUMzQixDQUFDO0NBQ0Y7QUE5REQsZ0RBOERDOzs7OztBQ2hFRCxNQUFhLGFBQWE7SUFPeEIsWUFBWSxNQUFjLEVBQUUsTUFBYyxFQUFFLE1BQWM7UUFDeEQsSUFBSSxDQUFDLE9BQU8sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLElBQUksTUFBTSxFQUFFLENBQUMsQ0FBQztRQUNwRCxJQUFJLENBQUMsY0FBYyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsSUFBSSxNQUFNLFVBQVUsQ0FBQyxDQUFDO1FBQ25FLElBQUksQ0FBQyxZQUFZLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxJQUFJLE1BQU0sUUFBUSxDQUFDLENBQUM7UUFDL0QsSUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7UUFDdEIsSUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7SUFDeEIsQ0FBQztJQUNELE9BQU87UUFDTCxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDdEMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzdDLElBQUksQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUV4QyxJQUFJLENBQUMsT0FBTyxDQUFDLHlCQUF5QixHQUFHLEtBQUssQ0FBQztRQUMvQyxJQUFJLENBQUMsT0FBTyxDQUFDLG1CQUFtQixHQUFHLEtBQUssQ0FBQztRQUN6QyxJQUFJLENBQUMsT0FBTyxDQUFDLG1CQUFtQixHQUFHLEtBQUssQ0FBQztRQUV6QyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7UUFDMUIsTUFBTSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUM7SUFDL0IsQ0FBQztJQUNELEtBQUs7UUFDSCxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDdEMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzFDLElBQUksQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUUzQyxJQUFJLENBQUMsT0FBTyxDQUFDLHlCQUF5QixHQUFHLElBQUksQ0FBQztRQUM5QyxJQUFJLENBQUMsT0FBTyxDQUFDLG1CQUFtQixHQUFHLElBQUksQ0FBQztRQUN4QyxJQUFJLENBQUMsT0FBTyxDQUFDLG1CQUFtQixHQUFHLEtBQUssQ0FBQztRQUV6QyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7UUFDMUIsTUFBTSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUM7SUFDL0IsQ0FBQztJQUNELE9BQU87UUFDTCxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7UUFFbkMsSUFBSSxDQUFDLE9BQU8sQ0FBQyx5QkFBeUIsR0FBRyxJQUFJLENBQUM7UUFDOUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsR0FBRyxJQUFJLENBQUM7UUFDeEMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsR0FBRyxJQUFJLENBQUM7UUFFeEMsTUFBTSxDQUFDLGNBQWMsR0FBRztZQUN0QixPQUFPLElBQUksQ0FBQztRQUNkLENBQUMsQ0FBQztJQUNKLENBQUM7Q0FDRjtBQWpERCxzQ0FpREMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJleHBvcnQgY29uc3QgY3NzID0gKCgpID0+IHtcclxuICByZXR1cm4ge1xyXG4gICAgdGV4dDogXCJoc2xhKDIyMGRlZywgMTAwJSwgNCUsIDAuOClcIixcclxuICAgIHBhcGVyMTA6IFwiaHNsKDIyMGRlZywgMzAlLCA5My41JSlcIixcclxuICAgIGFjY2VudDogXCIjMDBhNWNhXCIsXHJcbiAgICBob3ZlckhpZ2hsaWdodDogXCJoc2xhKDIyMGRlZywgMTAwJSwgMTglLCAwLjEpXCIsXHJcbiAgfTtcclxufSkoKTtcclxuIiwiaW1wb3J0IHsgRWRpdG9yIH0gZnJvbSBcIi4vZWRpdG9yXCI7XHJcbmltcG9ydCB7IGNzcyB9IGZyb20gXCIuL2Nzc1wiO1xyXG5cclxuZXhwb3J0IGNvbnN0IFJPV19TSVpFID0gMjA7XHJcbmV4cG9ydCBjb25zdCBDT0xfU0laRSA9IDQ4O1xyXG5jb25zdCBURVhUX09GRlNFVF9YID0gNztcclxuY29uc3QgVEVYVF9PRkZTRVRfWSA9IDE0O1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGVkaXRvckRyYXcoZWRpdG9yOiBFZGl0b3IpIHtcclxuICBjb25zdCBjYW52YXMgPSBlZGl0b3IuaHRtbC5jYW52YXM7XHJcbiAgY29uc3QgY29udGV4dCA9IGVkaXRvci5odG1sLmNvbnRleHQ7XHJcbiAgY29uc3QgY29udGVudCA9IGVkaXRvci5jb250ZW50O1xyXG5cclxuICBjb25zdCBjb2xzID0gY29udGVudC5sZW5ndGg7XHJcbiAgY29uc3Qgcm93cyA9IGNvbnRlbnRbMF0/Lmxlbmd0aCA/PyAwO1xyXG4gIGlmIChjb250ZW50LnNvbWUoKGMpID0+IGMubGVuZ3RoICE9PSByb3dzKSkge1xyXG4gICAgdGhyb3cgXCJHcmlkIGlzIGphZ2dlZCAoc29tZSBjb2x1bW5zIGhhdmUgbW9yZSByb3dzIHRoYW4gb3RoZXJzKVwiO1xyXG4gIH1cclxuXHJcbiAgY29uc3QgZHBpUmF0aW8gPSBjYWxjdWxhdGVEcGlSYXRpbyhjb250ZXh0KTtcclxuICBjb25zdCBjZWxscyA9IGdldE9uU2NyZWVuQ2VsbHMoZWRpdG9yLCByb3dzLCBjb2xzKTtcclxuXHJcbiAgLy8gU2V0IHRoZSBjb250YWluZXIgaG9sZGluZyB0aGUgY2FudmFzIHRvIHRoZSBmdWxsIHNpemUgKG1ha2VzIHRoZSBzY3JvbGxiYXJcclxuICAvLyB3b3JrIHByb3Blcmx5KVxyXG4gIGVkaXRvci5odG1sLmdyaWQuc3R5bGUud2lkdGggPSBDT0xfU0laRSAqIGNvbHMgKyBcInB4XCI7XHJcbiAgZWRpdG9yLmh0bWwuZ3JpZC5zdHlsZS5oZWlnaHQgPSBST1dfU0laRSAqIHJvd3MgKyBcInB4XCI7XHJcblxyXG4gIC8vIE1ha2UgdGhlIGNhbnZhcyBiaWcgZW5vdWdoIHRvIGZpdCBvbmx5IHRoZSBjZWxscyBhY3R1YWxseSBvbiBzY3JlZW5cclxuICAvLyBTaGlmdCB0aGUgY2FudmFzIHdpdGhpbiBpdCdzIHBhcmVudCBzbyB3aGVuIGl0J3Mgc2Nyb2xsZWQsIGl0IHN0aWxsIGFwcGVhcnNcclxuICAvLyBvbiBzY3JlZW4gZGVzcGl0ZSBpdHMgc21hbGxlciBzaXplXHJcbiAgY2FudmFzLndpZHRoID0gQ09MX1NJWkUgKiBjZWxscy53aWR0aCAqIGRwaVJhdGlvO1xyXG4gIGNhbnZhcy5oZWlnaHQgPSBST1dfU0laRSAqIGNlbGxzLmhlaWdodCAqIGRwaVJhdGlvO1xyXG4gIGNhbnZhcy5zdHlsZS53aWR0aCA9IENPTF9TSVpFICogY2VsbHMud2lkdGggKyBcInB4XCI7XHJcbiAgY2FudmFzLnN0eWxlLmhlaWdodCA9IFJPV19TSVpFICogY2VsbHMuaGVpZ2h0ICsgXCJweFwiO1xyXG4gIGNhbnZhcy5zdHlsZS5sZWZ0ID0gQ09MX1NJWkUgKiBjZWxscy54MSArIFwicHhcIjtcclxuICBjYW52YXMuc3R5bGUudG9wID0gUk9XX1NJWkUgKiBjZWxscy55MSArIFwicHhcIjtcclxuXHJcbiAgLy8gQ2xlYXIgdGhlIGNhbnZhcywgYW5kIHRyYW5zZm9ybSB0aGUgY29vcmRpbmF0ZSBzcGFjZSB0byBhY2NvdW50IGZvciB0aGVcclxuICAvLyBzY3JvbGxpbmdcclxuICBjb250ZXh0LmNsZWFyUmVjdCgwLCAwLCBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpO1xyXG4gIGNvbnRleHQudHJhbnNsYXRlKFxyXG4gICAgLWNlbGxzLngxICogQ09MX1NJWkUgKiBkcGlSYXRpbyxcclxuICAgIC1jZWxscy55MSAqIFJPV19TSVpFICogZHBpUmF0aW9cclxuICApO1xyXG4gIGNvbnRleHQuc2NhbGUoZHBpUmF0aW8sIGRwaVJhdGlvKTtcclxuXHJcbiAgLy8gUmVuZGVyIGEgbGlnaHRlciBiYWNrZ3JvdW5kIGZvciBldmVyeSBzZWNvbmQgcm93XHJcbiAgY29udGV4dC5maWxsU3R5bGUgPSBjc3MucGFwZXIxMDtcclxuICBmb3IgKGxldCB5ID0gY2VsbHMueTE7IHkgPCBjZWxscy55MjsgeSsrKSB7XHJcbiAgICBpZiAoeSAlIDIgIT0gMCkge1xyXG4gICAgICBjb250aW51ZTtcclxuICAgIH1cclxuICAgIGNvbnRleHQuZmlsbFJlY3QoXHJcbiAgICAgIGNlbGxzLngxICogQ09MX1NJWkUsXHJcbiAgICAgIHkgKiBST1dfU0laRSxcclxuICAgICAgY2VsbHMud2lkdGggKiBDT0xfU0laRSxcclxuICAgICAgUk9XX1NJWkVcclxuICAgICk7XHJcbiAgfVxyXG5cclxuICAvLyBSZW5kZXIgdGhlIHRleHQgZm9yIGVhY2ggY2VsbFxyXG4gIGNvbnRleHQuZm9udCA9IFwiMC43cmVtICdSb2JvdG8gTW9ubycsIG1vbm9zcGFjZVwiO1xyXG4gIGNvbnRleHQuZmlsbFN0eWxlID0gY3NzLnRleHQ7XHJcbiAgZm9yIChsZXQgeCA9IGNlbGxzLngxOyB4IDwgY2VsbHMueDI7IHgrKykge1xyXG4gICAgZm9yIChsZXQgeSA9IGNlbGxzLnkxOyB5IDwgY2VsbHMueTI7IHkrKykge1xyXG4gICAgICBjb25zdCBzdHIgPSBjb250ZW50W3hdW3ldO1xyXG4gICAgICBjb250ZXh0LmZpbGxUZXh0KFxyXG4gICAgICAgIHN0cixcclxuICAgICAgICB4ICogQ09MX1NJWkUgKyBURVhUX09GRlNFVF9YLFxyXG4gICAgICAgIHkgKiBST1dfU0laRSArIFRFWFRfT0ZGU0VUX1lcclxuICAgICAgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vIFJlbmRlciBhIGhpZ2hsaWdodCBvbiB0aGUgY2VsbCB0aGF0IHRoZSBtb3VzZSBpcyBvdmVyXHJcbiAgY29udGV4dC5maWxsU3R5bGUgPSBjc3MuaG92ZXJIaWdobGlnaHQ7XHJcbiAgY29uc3QgbW91c2VPdmVyID0gZWRpdG9yLmV2ZW50cy5tb3VzZU92ZXI7XHJcbiAgaWYgKG1vdXNlT3ZlciAhPSBudWxsKSB7XHJcbiAgICBjb250ZXh0LmZpbGxSZWN0KFxyXG4gICAgICBtb3VzZU92ZXIueCAqIENPTF9TSVpFLFxyXG4gICAgICBtb3VzZU92ZXIueSAqIFJPV19TSVpFLFxyXG4gICAgICBDT0xfU0laRSxcclxuICAgICAgUk9XX1NJWkVcclxuICAgICk7XHJcbiAgfVxyXG5cclxuICAvLyBSZW5kZXIgYSBib3JkZXIgb24gdGhlIGNlbGwgdGhhdCBpcyBzZWxlY3RlZFxyXG4gIGNvbnRleHQubGluZVdpZHRoID0gTWF0aC5yb3VuZCgxLjUgKiBkcGlSYXRpbykgLyBkcGlSYXRpbztcclxuICBjb250ZXh0LnN0cm9rZVN0eWxlID0gY3NzLmFjY2VudDtcclxuICBjb25zdCBzZWxlY3RlZCA9IGVkaXRvci5ldmVudHMuc2VsZWN0ZWQ7XHJcbiAgaWYgKHNlbGVjdGVkICE9IG51bGwpIHtcclxuICAgIGNvbnN0IHgxID0gTWF0aC5taW4oc2VsZWN0ZWQuc3RhcnRYLCBzZWxlY3RlZC5lbmRYKTtcclxuICAgIGNvbnN0IHcgPSBNYXRoLm1heChzZWxlY3RlZC5zdGFydFgsIHNlbGVjdGVkLmVuZFgpIC0geDEgKyAxO1xyXG4gICAgY29uc3QgeTEgPSBNYXRoLm1pbihzZWxlY3RlZC5zdGFydFksIHNlbGVjdGVkLmVuZFkpO1xyXG4gICAgY29uc3QgaCA9IE1hdGgubWF4KHNlbGVjdGVkLnN0YXJ0WSwgc2VsZWN0ZWQuZW5kWSkgLSB5MSArIDE7XHJcbiAgICBjb250ZXh0LnN0cm9rZVJlY3QoXHJcbiAgICAgIHgxICogQ09MX1NJWkUsXHJcbiAgICAgIHkxICogUk9XX1NJWkUsXHJcbiAgICAgIHcgKiBDT0xfU0laRSxcclxuICAgICAgaCAqIFJPV19TSVpFXHJcbiAgICApO1xyXG4gIH1cclxufTtcclxuXHJcbmZ1bmN0aW9uIGdldE9uU2NyZWVuQ2VsbHMoZWRpdG9yOiBFZGl0b3IsIHJvd3M6IG51bWJlciwgY29sczogbnVtYmVyKSB7XHJcbiAgY29uc3QgZWRpdG9yU2l6ZSA9IGVkaXRvci5odG1sLmVkaXRvci5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuICBjb25zdCBncmlkU2NyZWVuWCA9IGVkaXRvci5odG1sLnN0b3BzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLndpZHRoO1xyXG4gIGNvbnN0IGdyaWRTY3JlZW5ZID0gZWRpdG9yLmh0bWwuc2VydmljZXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkuaGVpZ2h0O1xyXG4gIGNvbnN0IGdyaWRXaWR0aCA9IGVkaXRvclNpemUud2lkdGggLSBncmlkU2NyZWVuWDtcclxuICBjb25zdCBncmlkSGVpZ2h0ID0gZWRpdG9yU2l6ZS5oZWlnaHQgLSBncmlkU2NyZWVuWTtcclxuXHJcbiAgY29uc3Qgc2Nyb2xsWCA9IGVkaXRvci5odG1sLmVkaXRvci5zY3JvbGxMZWZ0O1xyXG4gIGNvbnN0IHNjcm9sbFkgPSBlZGl0b3IuaHRtbC5lZGl0b3Iuc2Nyb2xsVG9wO1xyXG5cclxuICBjb25zdCBzdGFydFJvdyA9IE1hdGgubWF4KDAsIE1hdGguZmxvb3Ioc2Nyb2xsWSAvIFJPV19TSVpFKSk7XHJcbiAgY29uc3QgZW5kUm93ID0gTWF0aC5taW4ocm93cywgc3RhcnRSb3cgKyBNYXRoLmNlaWwoZ3JpZEhlaWdodCAvIFJPV19TSVpFKSArIDEpO1xyXG4gIGNvbnN0IHJvd3NIaWdoID0gZW5kUm93IC0gc3RhcnRSb3c7XHJcbiAgY29uc3Qgc3RhcnRDb2wgPSBNYXRoLm1heCgwLCBNYXRoLmZsb29yKHNjcm9sbFggLyBDT0xfU0laRSkpO1xyXG4gIGNvbnN0IGVuZENvbCA9IE1hdGgubWluKGNvbHMsIHN0YXJ0Q29sICsgTWF0aC5jZWlsKGdyaWRXaWR0aCAvIENPTF9TSVpFKSArIDEpO1xyXG4gIGNvbnN0IGNvbHNXaWRlID0gZW5kQ29sIC0gc3RhcnRDb2w7XHJcblxyXG4gIHJldHVybiB7XHJcbiAgICB4MTogc3RhcnRDb2wsXHJcbiAgICB4MjogZW5kQ29sLFxyXG4gICAgeTE6IHN0YXJ0Um93LFxyXG4gICAgeTI6IGVuZFJvdyxcclxuICAgIHdpZHRoOiBjb2xzV2lkZSxcclxuICAgIGhlaWdodDogcm93c0hpZ2gsXHJcbiAgfTtcclxufTtcclxuXHJcbmZ1bmN0aW9uIGNhbGN1bGF0ZURwaVJhdGlvKGdyaWRDYW52YXMyZDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEKSB7XHJcbiAgY29uc3QgZHByID0gd2luZG93LmRldmljZVBpeGVsUmF0aW8gfHwgMTtcclxuXHJcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcclxuICBjb25zdCBic3IgPSAoZ3JpZENhbnZhczJkIGFzIGFueSkuYmFja2luZ1N0b3JlUGl4ZWxSYXRpbyB8fCAxO1xyXG5cclxuICByZXR1cm4gZHByIC8gYnNyO1xyXG59O1xyXG4iLCJpbXBvcnQgeyBFZGl0b3IgfSBmcm9tIFwiLi9lZGl0b3JcIjtcclxuaW1wb3J0IHsgQ09MX1NJWkUsIFJPV19TSVpFIH0gZnJvbSBcIi4vZWRpdG9yLWRyYXdcIjtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBlZGl0b3JJbml0KGVkaXRvcjogRWRpdG9yKSB7XHJcbiAgZWRpdG9yLmRyYXcoKTtcclxuXHJcbiAgZWRpdG9yLmh0bWwuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgKGUpID0+IHtcclxuICAgIGNvbnN0IG0gPSByZWxhdGl2ZUNvb3JkcyhlLCBlZGl0b3IpO1xyXG4gICAgZWRpdG9yLmV2ZW50cy5zZWxlY3RlZCA9IHsgc3RhcnRYOiBtLngsIHN0YXJ0WTogbS55LCBlbmRYOiBtLngsIGVuZFk6IG0ueSB9O1xyXG4gICAgZWRpdG9yLmV2ZW50cy5kcmFnZ2luZyA9IHRydWU7XHJcbiAgICBlZGl0b3IuZHJhdygpO1xyXG4gIH0pO1xyXG4gIGVkaXRvci5odG1sLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFwibW91c2V1cFwiLCAoZSkgPT4ge1xyXG4gICAgY29uc3QgbSA9IHJlbGF0aXZlQ29vcmRzKGUsIGVkaXRvcik7XHJcbiAgICBlZGl0b3IuZXZlbnRzLnNlbGVjdGVkLmVuZFggPSBtLng7XHJcbiAgICBlZGl0b3IuZXZlbnRzLnNlbGVjdGVkLmVuZFkgPSBtLnk7XHJcbiAgICBlZGl0b3IuZXZlbnRzLmRyYWdnaW5nID0gZmFsc2U7XHJcbiAgICBlZGl0b3IuZHJhdygpO1xyXG4gIH0pO1xyXG5cclxuICBlZGl0b3IuaHRtbC5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCAoZSkgPT5cclxuICAgIGNhbnZhc01vdXNlTW92ZUV2ZW50KGUsIGVkaXRvcilcclxuICApO1xyXG4gIGVkaXRvci5odG1sLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFwibW91c2VlbnRlclwiLCAoZSkgPT5cclxuICAgIGNhbnZhc01vdXNlTW92ZUV2ZW50KGUsIGVkaXRvcilcclxuICApO1xyXG4gIGVkaXRvci5odG1sLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFwibW91c2VsZWF2ZVwiLCAoKSA9PiB7XHJcbiAgICBlZGl0b3IuZXZlbnRzLm1vdXNlT3ZlciA9IG51bGw7XHJcbiAgICBlZGl0b3IuZHJhdygpO1xyXG4gIH0pO1xyXG4gIGVkaXRvci5odG1sLmVkaXRvci5hZGRFdmVudExpc3RlbmVyKFwic2Nyb2xsXCIsICgpID0+IHtcclxuICAgIGVkaXRvci5ldmVudHMubW91c2VPdmVyID0gbnVsbDtcclxuICAgIGVkaXRvci5kcmF3KCk7XHJcbiAgfSk7XHJcblxyXG4gIC8vIE1ha2UgdGhlIHNjcm9sbHdoZWVsIGNhdXNlIGhvcml6b250YWwgc2Nyb2xsaW5nIGluIHRoZSBlZGl0b3IsIG5vdCB2ZXJ0aWNhbFxyXG4gIC8vIEZpcmVmb3ggaXMgJ0RPTU1vdXNlU2Nyb2xsJyBhbmQgYmFzaWNhbGx5IGV2ZXJ5dGhpbmcgZWxzZSBpcyAnbW91c2V3aGVlbCdcclxuICBlZGl0b3IuaHRtbC5lZGl0b3IuYWRkRXZlbnRMaXN0ZW5lcihcclxuICAgIFwibW91c2V3aGVlbFwiLFxyXG4gICAgKGUpID0+IGVkaXRvclNjcm9sbEV2ZW50KGUsIGVkaXRvciksXHJcbiAgICBmYWxzZVxyXG4gICk7XHJcbiAgZWRpdG9yLmh0bWwuZWRpdG9yLmFkZEV2ZW50TGlzdGVuZXIoXHJcbiAgICBcIkRPTU1vdXNlU2Nyb2xsXCIsXHJcbiAgICAoZSkgPT4gZWRpdG9yU2Nyb2xsRXZlbnQoZSwgZWRpdG9yKSxcclxuICAgIGZhbHNlXHJcbiAgKTtcclxuXHJcbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcInBhc3RlXCIsIChlKSA9PiB7XHJcbiAgICBjb25zdCBjbGlwYm9hcmRUZXh0ID0gZS5jbGlwYm9hcmREYXRhLmdldERhdGEoJ3RleHQnKTtcclxuICAgIGNvbnNvbGUubG9nKGNsaXBib2FyZFRleHQpO1xyXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gIH0pO1xyXG59O1xyXG5cclxuZnVuY3Rpb24gZWRpdG9yU2Nyb2xsRXZlbnQoZTogRXZlbnQsIGVkaXRvcjogRWRpdG9yKSB7XHJcbiAgZSA9IHdpbmRvdy5ldmVudCB8fCBlO1xyXG5cclxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxyXG4gIGNvbnN0IHdoZWVsRXZlbnQgPSBlIGFzIGFueTtcclxuXHJcbiAgY29uc3QgZGVsdGEgPSBNYXRoLm1heCgtMSwgTWF0aC5taW4oMSwgd2hlZWxFdmVudC53aGVlbERlbHRhIHx8IC13aGVlbEV2ZW50LmRldGFpbCkpO1xyXG4gIGVkaXRvci5odG1sLmVkaXRvci5zY3JvbGxMZWZ0IC09IGRlbHRhICogNjQ7XHJcbiAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG59O1xyXG5cclxuZnVuY3Rpb24gY2FudmFzTW91c2VNb3ZlRXZlbnQoZTogTW91c2VFdmVudCwgZWRpdG9yOiBFZGl0b3IpIHtcclxuICBlZGl0b3IuZXZlbnRzLm1vdXNlT3ZlciA9IHJlbGF0aXZlQ29vcmRzKGUsIGVkaXRvcik7XHJcbiAgaWYgKGVkaXRvci5ldmVudHMuZHJhZ2dpbmcpIHtcclxuICAgIGlmIChlLmJ1dHRvbnMgIT0gMSkge1xyXG4gICAgICBlZGl0b3IuZXZlbnRzLmRyYWdnaW5nID0gZmFsc2U7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBlZGl0b3IuZXZlbnRzLnNlbGVjdGVkLmVuZFggPSBlZGl0b3IuZXZlbnRzLm1vdXNlT3Zlci54O1xyXG4gICAgICBlZGl0b3IuZXZlbnRzLnNlbGVjdGVkLmVuZFkgPSBlZGl0b3IuZXZlbnRzLm1vdXNlT3Zlci55O1xyXG4gICAgfVxyXG4gIH1cclxuICBlZGl0b3IuZHJhdygpO1xyXG59O1xyXG5cclxuZnVuY3Rpb24gcmVsYXRpdmVDb29yZHMoZTogTW91c2VFdmVudCwgZWRpdG9yOiBFZGl0b3IpIHtcclxuICBjb25zdCBib3VuZHMgPSBlZGl0b3IuaHRtbC5ncmlkLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG4gIGNvbnN0IHggPSBlLmNsaWVudFggLSBib3VuZHMubGVmdDtcclxuICBjb25zdCB5ID0gZS5jbGllbnRZIC0gYm91bmRzLnRvcDtcclxuICByZXR1cm4ge1xyXG4gICAgeDogTWF0aC5mbG9vcih4IC8gQ09MX1NJWkUpLFxyXG4gICAgeTogTWF0aC5mbG9vcih5IC8gUk9XX1NJWkUpLFxyXG4gIH07XHJcbn07XHJcbiIsImltcG9ydCB7IGVkaXRvckRyYXcgfSBmcm9tIFwiLi9lZGl0b3ItZHJhd1wiXHJcbmltcG9ydCB7IGVkaXRvckluaXQgfSBmcm9tIFwiLi9lZGl0b3ItaW5pdFwiXHJcblxyXG5leHBvcnQgY2xhc3MgRWRpdG9yIHtcclxuICBodG1sOiB7XHJcbiAgICBlZGl0b3I6IEhUTUxFbGVtZW50LFxyXG4gICAgZ3JpZDogSFRNTEVsZW1lbnQsXHJcbiAgICBjYW52YXM6IEhUTUxDYW52YXNFbGVtZW50LFxyXG4gICAgY29udGV4dDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELFxyXG4gICAgc3RvcHM6IEhUTUxFbGVtZW50LFxyXG4gICAgc2VydmljZXM6IEhUTUxFbGVtZW50XHJcbiAgfTtcclxuXHJcbiAgcHJpdmF0ZSBfY29udGVudDogc3RyaW5nW11bXTtcclxuXHJcbiAgZXZlbnRzOiB7XHJcbiAgICBtb3VzZU92ZXI6IHtcclxuICAgICAgeDogbnVtYmVyLFxyXG4gICAgICB5OiBudW1iZXJcclxuICAgIH0gfCBudWxsLFxyXG4gICAgc2VsZWN0ZWQ6IHtcclxuICAgICAgc3RhcnRYOiBudW1iZXIsXHJcbiAgICAgIHN0YXJ0WTogbnVtYmVyLFxyXG4gICAgICBlbmRYOiBudW1iZXIsXHJcbiAgICAgIGVuZFk6IG51bWJlclxyXG4gICAgfSB8IG51bGwsXHJcbiAgICBkcmFnZ2luZzogYm9vbGVhblxyXG4gIH07XHJcblxyXG4gIGNvbnN0cnVjdG9yKGVkaXRvcklEOiBzdHJpbmcsIGdyaWRJRDogc3RyaW5nLCBjYW52YXNJRDogc3RyaW5nLCBzdG9wc0lEOiBzdHJpbmcsIHNlcnZpY2VzSUQ6IHN0cmluZykge1xyXG4gICAgY29uc3QgZWRpdG9yID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoZWRpdG9ySUQpO1xyXG4gICAgY29uc3QgZ3JpZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGdyaWRJRCk7XHJcbiAgICBjb25zdCBjYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChjYW52YXNJRCkgYXMgSFRNTENhbnZhc0VsZW1lbnQ7XHJcbiAgICBjb25zdCBjb250ZXh0ID0gY2FudmFzLmdldENvbnRleHQoXCIyZFwiKTtcclxuICAgIGNvbnN0IHN0b3BzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoc3RvcHNJRCk7XHJcbiAgICBjb25zdCBzZXJ2aWNlcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHNlcnZpY2VzSUQpO1xyXG4gICAgdGhpcy5odG1sID0ge1xyXG4gICAgICBlZGl0b3I6IGVkaXRvcixcclxuICAgICAgZ3JpZDogZ3JpZCxcclxuICAgICAgY2FudmFzOiBjYW52YXMsXHJcbiAgICAgIGNvbnRleHQ6IGNvbnRleHQsXHJcbiAgICAgIHN0b3BzOiBzdG9wcyxcclxuICAgICAgc2VydmljZXM6IHNlcnZpY2VzLFxyXG4gICAgfTtcclxuICAgIHRoaXMuX2NvbnRlbnQgPSBbXTtcclxuICAgIHRoaXMuZXZlbnRzID0ge1xyXG4gICAgICBtb3VzZU92ZXI6IG51bGwsXHJcbiAgICAgIHNlbGVjdGVkOiBudWxsLFxyXG4gICAgICBkcmFnZ2luZzogZmFsc2UsXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgd2luZG93UmVzaXplZCgpIHtcclxuICAgIHRoaXMuZXZlbnRzLm1vdXNlT3ZlciA9IG51bGw7XHJcbiAgICB0aGlzLmRyYXcoKTtcclxuICB9XHJcblxyXG4gIGluaXQoKSB7XHJcbiAgICBlZGl0b3JJbml0KHRoaXMpO1xyXG4gIH1cclxuICBkcmF3KCkge1xyXG4gICAgZWRpdG9yRHJhdyh0aGlzKTtcclxuICB9XHJcbiAgc2V0IGNvbnRlbnQobmV3Q29udGVudDogc3RyaW5nW11bXSkge1xyXG4gICAgdGhpcy5fY29udGVudCA9IG5ld0NvbnRlbnQ7XHJcbiAgICB0aGlzLmRyYXcoKTtcclxuICB9XHJcbiAgZ2V0IGNvbnRlbnQoKTogc3RyaW5nW11bXSB7XHJcbiAgICByZXR1cm4gdGhpcy5fY29udGVudDtcclxuICB9XHJcbn1cclxuIiwiZXhwb3J0IGNsYXNzIEhlYWRlciB7XHJcbiAgbmV3VGltZXRhYmxlQnV0dG9uOiBIVE1MQnV0dG9uRWxlbWVudDtcclxuICBpbXBvcnRCdXR0b246IEhUTUxCdXR0b25FbGVtZW50O1xyXG4gIGV4cG9ydEJ1dHRvbjogSFRNTEJ1dHRvbkVsZW1lbnQ7XHJcblxyXG4gIGNvbnN0cnVjdG9yKG5ld1RpbWV0YWJsZUJ1dHRvbjogc3RyaW5nLCBpbXBvcnRCdXR0b246IHN0cmluZyxcclxuICAgIGV4cG9ydEJ1dHRvbjogc3RyaW5nKSB7XHJcblxyXG4gICAgdGhpcy5uZXdUaW1ldGFibGVCdXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI1wiICsgbmV3VGltZXRhYmxlQnV0dG9uKTtcclxuICAgIHRoaXMuaW1wb3J0QnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNcIiArIGltcG9ydEJ1dHRvbik7XHJcbiAgICB0aGlzLmV4cG9ydEJ1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjXCIgKyBleHBvcnRCdXR0b24pO1xyXG4gIH1cclxuICBzZXQgbmV3VGltZXRhYmxlQnV0dG9uRW5hYmxlZCh2YWx1ZTogYm9vbGVhbikge1xyXG4gICAgdGhpcy5uZXdUaW1ldGFibGVCdXR0b24uZGlzYWJsZWQgPSAhdmFsdWU7XHJcbiAgfVxyXG4gIHNldCBpbXBvcnRCdXR0b25FbmFibGVkKHZhbHVlOiBib29sZWFuKSB7XHJcbiAgICB0aGlzLmltcG9ydEJ1dHRvbi5kaXNhYmxlZCA9ICF2YWx1ZTtcclxuICB9XHJcbiAgc2V0IGV4cG9ydEJ1dHRvbkVuYWJsZWQodmFsdWU6IGJvb2xlYW4pIHtcclxuICAgIHRoaXMuZXhwb3J0QnV0dG9uLmRpc2FibGVkID0gIXZhbHVlO1xyXG4gIH1cclxufVxyXG4iLCJpbXBvcnQgeyBFZGl0b3IgfSBmcm9tIFwiLi9lZGl0b3JcIjtcclxuaW1wb3J0IHsgSGVhZGVyIH0gZnJvbSBcIi4vaGVhZGVyXCI7XHJcbmltcG9ydCB7IE5ldHdvcmsgfSBmcm9tIFwiLi9uZXR3b3JrXCI7XHJcbmltcG9ydCB7IE5ld1RpbWV0YWJsZURpYWxvZyB9IGZyb20gXCIuL25ldy10aW1ldGFibGUtZGlhbG9nXCI7XHJcbmltcG9ydCB7IFN0YXR1c1NjcmVlbnMgfSBmcm9tIFwiLi9zdGF0dXMtc2NyZWVuc1wiO1xyXG5cclxubGV0IHRpbWV0YWJsZTogc3RyaW5nID0gbnVsbDtcclxuXHJcbi8vIEluaXRpYWxpemUgdGhlIGVkaXRvci5cclxuY29uc3QgZWRpdG9yID0gbmV3IEVkaXRvcihcImVkaXRvclwiLCBcImdyaWRcIiwgXCJncmlkLWNhbnZhc1wiLCBcInN0b3BzXCIsIFwic2VydmljZXNcIik7XHJcbmVkaXRvci5pbml0KCk7XHJcbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwicmVzaXplXCIsICgpID0+IGVkaXRvci53aW5kb3dSZXNpemVkKCkpO1xyXG5cclxuLy8gSW5pdGlhbGl6ZSB0aGUgbmV3IHRpbWV0YWJsZSBkaWFsb2cuXHJcbmNvbnN0IG5ld1RpbWV0YWJsZURpYWxvZyA9IG5ldyBOZXdUaW1ldGFibGVEaWFsb2coXCJuZXctdGltZXRhYmxlLWRpYWxvZ1wiLFxyXG4gIGRpYWxvZ1N1Ym1pdHRlZCk7XHJcblxyXG4vLyBJbml0aWFsaXplIHRoZSBoZWFkZXIgYW5kIHN0YXR1cyBzY3JlZW5zLCBhbmQgZW5zdXJpbmcgdGhlIGxvYWRpbmcgc2NyZWVuIGlzXHJcbi8vIGRpc3BsYXlpbmcgY29ycmVjdGx5IChzaG91bGQgYmUgZGVmYXVsdCBpbiBtYXJrdXAgYW55d2F5IC0gdGhhdCB3YXkgaXQgc2hvd3NcclxuLy8gYmVmb3JlIHRoZSBzY3JpcHQgaXMgbG9hZGVkIHRvbykuXHJcbmNvbnN0IGhlYWRlciA9IG5ldyBIZWFkZXIoXCJuZXctdGltZXRhYmxlLWJ1dHRvblwiLCBcImltcG9ydC1idXR0b25cIiwgXCJleHBvcnQtYnV0dG9uXCIpO1xyXG5jb25zdCBzdGF0dXMgPSBuZXcgU3RhdHVzU2NyZWVucyhcInN0YXR1c1wiLCBlZGl0b3IsIGhlYWRlcik7XHJcbnN0YXR1cy5sb2FkaW5nKCk7XHJcblxyXG4vLyBCZWdpbiBkb3dubG9hZGluZyB0aGUgbmV0d29yayBpbmZvcm1hdGlvbiBmcm9tIHRoZSBBUEkuXHJcbmNvbnN0IG5ldHdvcmsgPSBuZXcgTmV0d29yaygpO1xyXG5uZXR3b3JrLmxvYWQoKS50aGVuKCgpID0+IHtcclxuICAvLyBXaGVuIGRvd25sb2FkIGlzIGZpbmlzaGVkLCBpbml0aWFsaXplIHRoZSBuZXcgdGltZXRhYmxlIGRpYWxvZyBhbmQgc2hvd1xyXG4gIC8vIHRoZSB3ZWxjb21lIHNjcmVlbi5cclxuICBuZXdUaW1ldGFibGVEaWFsb2cuaW5pdChuZXR3b3JrKTtcclxuICBzdGF0dXMucmVhZHkoKTtcclxufSk7XHJcblxyXG4vLyBXaXJlIHVwIHRoZSBuZXcgdGltZXRhYmxlIGJ1dHRvbiB0byBzaG93IHRoZSBkaWFsb2cgd2hlbiBjbGlja2VkLiBUaGUgbmV3XHJcbi8vIHRpbWV0YWJsZSBidXR0b24gaXMgZGlzYWJsZWQgdW50aWwgdGhlIG5ldHdvcmsgaXMgbG9hZGVkLlxyXG5oZWFkZXIubmV3VGltZXRhYmxlQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgY29uc3QgcmVzdWx0ID0gdGltZXRhYmxlID09IG51bGwgfHxcclxuICAgIGNvbmZpcm0oXCJDcmVhdGUgYSBuZXcgdGltZXRhYmxlPyBUaGlzIG9uZSB3b24ndCBiZSBzYXZlZCBhbnl3aGVyZS5cIik7XHJcblxyXG4gIGlmIChyZXN1bHQpIHtcclxuICAgIG5ld1RpbWV0YWJsZURpYWxvZy5zaG93KCk7XHJcbiAgfVxyXG59KTtcclxuXHJcbmZ1bmN0aW9uIGRpYWxvZ1N1Ym1pdHRlZChsaW5lSUQ6IG51bWJlciwgZGF5czogc3RyaW5nLCB0aW1ldGFibGVJRDogc3RyaW5nKSB7XHJcbiAgdGltZXRhYmxlID0gXCJTb21ldGhpbmchXCI7XHJcblxyXG4gIHN0YXR1cy5lZGl0aW5nKCk7XHJcblxyXG4gIGNvbnN0IGNvbnRlbnQ6IHN0cmluZ1tdW10gPSBbXTtcclxuICBmb3IgKGxldCB4ID0gMDsgeCA8IDUwOyB4KyspIHtcclxuICAgIGNvbnRlbnRbeF0gPSBbXTtcclxuICAgIGZvciAobGV0IHkgPSAwOyB5IDwgMzA7IHkrKykge1xyXG4gICAgICBjb250ZW50W3hdW3ldID0gXCIwMDowMFwiO1xyXG4gICAgfVxyXG4gIH1cclxuICBlZGl0b3IuY29udGVudCA9IGNvbnRlbnQ7XHJcblxyXG4gIC8vIHRocm93IG5ldyBFcnJvcihcIk5vdCBpbXBsZW1lbnRlZCB5ZXQhXCIpO1xyXG59XHJcbiIsInR5cGUgTmV0d29ya0FwaVYxU2NoZW1hID0ge1xyXG4gIGhhc2g6IHN0cmluZyxcclxuICBzdG9wczoge1xyXG4gICAgaWQ6IG51bWJlcixcclxuICAgIG5hbWU6IHN0cmluZyxcclxuICAgIHBsYXRmb3Jtczoge1xyXG4gICAgICBpZDogc3RyaW5nLFxyXG4gICAgICBuYW1lOiBzdHJpbmdcclxuICAgIH1bXSxcclxuICAgIHVybE5hbWU6IHN0cmluZ1xyXG4gIH1bXSxcclxuICBsaW5lczoge1xyXG4gICAgaWQ6IG51bWJlcixcclxuICAgIG5hbWU6IHN0cmluZyxcclxuICAgIGNvbG9yOiBzdHJpbmcsXHJcbiAgICBzZXJ2aWNlOiBzdHJpbmcsXHJcbiAgICByb3V0ZVR5cGU6IHN0cmluZyxcclxuICAgIGRpcmVjdGlvbnM6IHtcclxuICAgICAgaWQ6IHN0cmluZyxcclxuICAgICAgbmFtZTogc3RyaW5nLFxyXG4gICAgICBzdG9wczogbnVtYmVyW11cclxuICAgIH1bXVxyXG4gIH1bXVxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgTmV0d29yayB7XHJcbiAgZG9tYWluOiBzdHJpbmc7XHJcbiAgcHJpdmF0ZSBfanNvbjogTmV0d29ya0FwaVYxU2NoZW1hIHwgbnVsbDtcclxuXHJcbiAgY29uc3RydWN0b3IoZG9tYWluID0gXCJhcGkudHJhaW5hcnJpdmVzLmluXCIpIHtcclxuICAgIHRoaXMuZG9tYWluID0gZG9tYWluO1xyXG4gICAgdGhpcy5fanNvbiA9IG51bGw7XHJcbiAgfVxyXG5cclxuICBhc3luYyBsb2FkKCkge1xyXG4gICAgY29uc3QgYXBpID0gXCJuZXR3b3JrL3YxXCI7XHJcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKGBodHRwczovLyR7dGhpcy5kb21haW59LyR7YXBpfWApXHJcbiAgICBpZiAocmVzcG9uc2Uuc3RhdHVzICE9IDIwMCkge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFwiJHt0aGlzLmRvbWFpbn1cIiBkaWQgbm90IHJlc3BvbmQuYCk7XHJcbiAgICB9XHJcbiAgICB0aGlzLl9qc29uID0gYXdhaXQgcmVzcG9uc2UuanNvbigpIGFzIE5ldHdvcmtBcGlWMVNjaGVtYTtcclxuICB9XHJcblxyXG4gIGdldCBsaW5lcygpIHtcclxuICAgIGlmICh0aGlzLl9qc29uID09IG51bGwpIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTmV0d29yayBub3QgbG9hZGVkLlwiKTtcclxuICAgIH1cclxuICAgIHJldHVybiB0aGlzLl9qc29uLmxpbmVzO1xyXG4gIH1cclxufVxyXG4iLCJpbXBvcnQgeyBOZXR3b3JrIH0gZnJvbSBcIi4vbmV0d29ya1wiO1xyXG5cclxuZXhwb3J0IHR5cGUgTmV3VGltZXRhYmxlRGlhbG9nQ2FsbGJhY2sgPVxyXG4gIChsaW5lSUQ6IG51bWJlciwgZGF5czogc3RyaW5nLCB0aW1ldGFibGVJRDogc3RyaW5nKSA9PiB2b2lkXHJcblxyXG5leHBvcnQgY2xhc3MgTmV3VGltZXRhYmxlRGlhbG9nIHtcclxuICAvLyBUeXBlc2NyaXB0IGRvZXMgbm90IGhhdmUgdXAgdG8gZGF0ZSBkaWFsb2cgdHlwZSBpbmZvcm1hdGlvbiwgc28gdGhpcyBpc1xyXG4gIC8vIG5lZWRlZCB0byBiZSBhYmxlIHRvIGNhbGwgc2hvd01vZGFsKCkuXHJcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcclxuICBwcml2YXRlIF9kaWFsb2c6IGFueTtcclxuXHJcbiAgcHJpdmF0ZSBfY2FuY2VsQnV0dG9uOiBIVE1MQnV0dG9uRWxlbWVudDtcclxuICBwcml2YXRlIF9zdWJtaXRCdXR0b246IEhUTUxCdXR0b25FbGVtZW50O1xyXG4gIHByaXZhdGUgX2xpbmVzU2VsZWN0OiBIVE1MU2VsZWN0RWxlbWVudDtcclxuICBwcml2YXRlIF9kYXlzU2VsZWN0OiBIVE1MU2VsZWN0RWxlbWVudDtcclxuICBwcml2YXRlIF9pZEZpZWxkSUQ6IEhUTUxJbnB1dEVsZW1lbnQ7XHJcblxyXG4gIHByaXZhdGUgc3VibWl0dGVkOiBOZXdUaW1ldGFibGVEaWFsb2dDYWxsYmFjaztcclxuXHJcbiAgY29uc3RydWN0b3IoaHRtbElEOiBzdHJpbmcsIHN1Ym1pdHRlZDogTmV3VGltZXRhYmxlRGlhbG9nQ2FsbGJhY2spIHtcclxuXHJcbiAgICB0aGlzLl9kaWFsb2cgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAjJHtodG1sSUR9YCk7XHJcbiAgICB0aGlzLl9jYW5jZWxCdXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAjJHtodG1sSUR9LWNhbmNlbGApO1xyXG4gICAgdGhpcy5fc3VibWl0QnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgIyR7aHRtbElEfS1zdWJtaXRgKTtcclxuICAgIHRoaXMuX2xpbmVzU2VsZWN0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgIyR7aHRtbElEfS1saW5lc2ApO1xyXG4gICAgdGhpcy5fZGF5c1NlbGVjdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYCMke2h0bWxJRH0tZGF5c2ApO1xyXG4gICAgdGhpcy5faWRGaWVsZElEID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgIyR7aHRtbElEfS1pZGApO1xyXG5cclxuICAgIHRoaXMuc3VibWl0dGVkID0gc3VibWl0dGVkO1xyXG4gIH1cclxuICBpbml0KG5ldHdvcms6IE5ldHdvcmspIHtcclxuICAgIC8vIFNvcnQgbGluZXMgYnkgbmFtZSBhbHBoYWJldGljYWwgb3JkZXIsIGFuZCBhZGQgYW4gb3B0aW9uIGZvciBlYWNoIHRvIHRoZVxyXG4gICAgLy8gbGluZXMgc2VsZWN0LlxyXG4gICAgY29uc3QgbGluZXMgPSBbLi4ubmV0d29yay5saW5lc11cclxuICAgICAgLnNvcnQoKGEsIGIpID0+IGEubmFtZS5sb2NhbGVDb21wYXJlKGIubmFtZSkpO1xyXG4gICAgbGluZXMubWFwKGxpbmUgPT4ge1xyXG4gICAgICBjb25zdCBvcHRpb24gPSBuZXcgT3B0aW9uKGxpbmUubmFtZSwgbGluZS5pZC50b1N0cmluZygpKTtcclxuICAgICAgdGhpcy5fbGluZXNTZWxlY3QuYXBwZW5kQ2hpbGQob3B0aW9uKTtcclxuICAgIH0pXHJcblxyXG4gICAgLy8gQ2xvc2UgdGhlIGRpYWxvZyBpZiB0aGUgY2xvc2UgYnV0dG9uIGlzIGNsaWNrZWQuIE5vdGUgdGhhdCBwcmVzc2luZyBFU0NcclxuICAgIC8vIGFsc28gY2xvc2VzIHRoZSBkaWFsb2csIHNvIGl0IGNhbm5vdCBiZSBhc3N1bWVkIHRoaXMgd2lsbCBydW4uXHJcbiAgICB0aGlzLl9jYW5jZWxCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcclxuICAgICAgdGhpcy5fZGlhbG9nLmNsb3NlKCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBSZXRyaWV2ZSB0aGUgdmFsdWVzLCBydW4gdGhlIGNhbGxiYWNrLCBhbmQgY2xvc2UgdGhlIGRpYWxvZyB3aGVuIHRoZVxyXG4gICAgLy8gc3VibWl0IGJ1dHRvbiBpcyBwcmVzc2VkLiBJZiBhbnkgZXJyb3Igb2NjdXJzLCBkaXNwbGF5IHRoZSBlcnJvciBhbmQgZG9cclxuICAgIC8vIG5vdCBjbG9zZSB0aGUgZGlhbG9nLlxyXG4gICAgdGhpcy5fc3VibWl0QnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAgIGNvbnN0IGxpbmVJRFN0ciA9IHRoaXMuX2xpbmVzU2VsZWN0LnZhbHVlO1xyXG4gICAgICBjb25zdCBkYXlzID0gdGhpcy5fZGF5c1NlbGVjdC52YWx1ZTtcclxuICAgICAgY29uc3QgdGltZXRhYmxlSUQgPSB0aGlzLl9pZEZpZWxkSUQudmFsdWU7XHJcbiAgICAgIGNvbnN0IGxpbmVJRE51bSA9IHBhcnNlSW50KGxpbmVJRFN0cik7XHJcblxyXG4gICAgICB0cnkge1xyXG4gICAgICAgIHRoaXMuc3VibWl0dGVkKGxpbmVJRE51bSwgZGF5cywgdGltZXRhYmxlSUQpXHJcbiAgICAgICAgdGhpcy5fZGlhbG9nLmNsb3NlKCk7XHJcbiAgICAgIH1cclxuICAgICAgY2F0Y2gge1xyXG4gICAgICAgIC8vIHRvZG86IGhhbmRsZSBpbnZhbGlkIGlucHV0XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gIH1cclxuICBzaG93KCkge1xyXG4gICAgdGhpcy5fZGlhbG9nLnNob3dNb2RhbCgpO1xyXG4gIH1cclxufVxyXG4iLCJpbXBvcnQgeyBFZGl0b3IgfSBmcm9tIFwiLi9lZGl0b3JcIjtcclxuaW1wb3J0IHsgSGVhZGVyIH0gZnJvbSBcIi4vaGVhZGVyXCI7XHJcblxyXG5leHBvcnQgY2xhc3MgU3RhdHVzU2NyZWVucyB7XHJcbiAgcHJpdmF0ZSBfc3RhdHVzOiBIVE1MRGl2RWxlbWVudDtcclxuICBwcml2YXRlIF9zdGF0dXNMb2FkaW5nOiBIVE1MRGl2RWxlbWVudDtcclxuICBwcml2YXRlIF9zdGF0dXNSZWFkeTogSFRNTERpdkVsZW1lbnQ7XHJcbiAgcHJpdmF0ZSBfZWRpdG9yOiBFZGl0b3I7XHJcbiAgcHJpdmF0ZSBfaGVhZGVyOiBIZWFkZXI7XHJcblxyXG4gIGNvbnN0cnVjdG9yKGh0bWxJRDogc3RyaW5nLCBlZGl0b3I6IEVkaXRvciwgaGVhZGVyOiBIZWFkZXIpIHtcclxuICAgIHRoaXMuX3N0YXR1cyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYCMke2h0bWxJRH1gKTtcclxuICAgIHRoaXMuX3N0YXR1c0xvYWRpbmcgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAjJHtodG1sSUR9LWxvYWRpbmdgKTtcclxuICAgIHRoaXMuX3N0YXR1c1JlYWR5ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgIyR7aHRtbElEfS1yZWFkeWApO1xyXG4gICAgdGhpcy5fZWRpdG9yID0gZWRpdG9yO1xyXG4gICAgdGhpcy5faGVhZGVyID0gaGVhZGVyO1xyXG4gIH1cclxuICBsb2FkaW5nKCkge1xyXG4gICAgdGhpcy5fc3RhdHVzLmNsYXNzTGlzdC5yZW1vdmUoXCJnb25lXCIpO1xyXG4gICAgdGhpcy5fc3RhdHVzTG9hZGluZy5jbGFzc0xpc3QucmVtb3ZlKFwiZ29uZVwiKTtcclxuICAgIHRoaXMuX3N0YXR1c1JlYWR5LmNsYXNzTGlzdC5hZGQoXCJnb25lXCIpO1xyXG5cclxuICAgIHRoaXMuX2hlYWRlci5uZXdUaW1ldGFibGVCdXR0b25FbmFibGVkID0gZmFsc2U7XHJcbiAgICB0aGlzLl9oZWFkZXIuaW1wb3J0QnV0dG9uRW5hYmxlZCA9IGZhbHNlO1xyXG4gICAgdGhpcy5faGVhZGVyLmV4cG9ydEJ1dHRvbkVuYWJsZWQgPSBmYWxzZTtcclxuXHJcbiAgICB0aGlzLl9lZGl0b3IuY29udGVudCA9IFtdO1xyXG4gICAgd2luZG93Lm9uYmVmb3JldW5sb2FkID0gbnVsbDtcclxuICB9XHJcbiAgcmVhZHkoKSB7XHJcbiAgICB0aGlzLl9zdGF0dXMuY2xhc3NMaXN0LnJlbW92ZShcImdvbmVcIik7XHJcbiAgICB0aGlzLl9zdGF0dXNMb2FkaW5nLmNsYXNzTGlzdC5hZGQoXCJnb25lXCIpO1xyXG4gICAgdGhpcy5fc3RhdHVzUmVhZHkuY2xhc3NMaXN0LnJlbW92ZShcImdvbmVcIik7XHJcblxyXG4gICAgdGhpcy5faGVhZGVyLm5ld1RpbWV0YWJsZUJ1dHRvbkVuYWJsZWQgPSB0cnVlO1xyXG4gICAgdGhpcy5faGVhZGVyLmltcG9ydEJ1dHRvbkVuYWJsZWQgPSB0cnVlO1xyXG4gICAgdGhpcy5faGVhZGVyLmV4cG9ydEJ1dHRvbkVuYWJsZWQgPSBmYWxzZTtcclxuXHJcbiAgICB0aGlzLl9lZGl0b3IuY29udGVudCA9IFtdO1xyXG4gICAgd2luZG93Lm9uYmVmb3JldW5sb2FkID0gbnVsbDtcclxuICB9XHJcbiAgZWRpdGluZygpIHtcclxuICAgIHRoaXMuX3N0YXR1cy5jbGFzc0xpc3QuYWRkKFwiZ29uZVwiKTtcclxuXHJcbiAgICB0aGlzLl9oZWFkZXIubmV3VGltZXRhYmxlQnV0dG9uRW5hYmxlZCA9IHRydWU7XHJcbiAgICB0aGlzLl9oZWFkZXIuaW1wb3J0QnV0dG9uRW5hYmxlZCA9IHRydWU7XHJcbiAgICB0aGlzLl9oZWFkZXIuZXhwb3J0QnV0dG9uRW5hYmxlZCA9IHRydWU7XHJcblxyXG4gICAgd2luZG93Lm9uYmVmb3JldW5sb2FkID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH07XHJcbiAgfVxyXG59XHJcbiJdfQ==
