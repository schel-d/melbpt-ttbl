!function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);throw(f=new Error("Cannot find module '"+i+"'")).code="MODULE_NOT_FOUND",f}c=n[i]={exports:{}},e[i][0].call(c.exports,function(r){return o(e[i][1][r]||r)},c,c.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}({1:[function(require,module,exports){"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.css=void 0,exports.css={text:"hsla(220deg, 100%, 4%, 0.8)",paper10:"hsl(220deg, 30%, 93.5%)",accent:"#00a5ca",hoverHighlight:"hsla(220deg, 100%, 18%, 0.1)"}},{}],2:[function(require,module,exports){"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.validateDOW=exports.nameDOW=exports.DOWPresets=void 0,exports.DOWPresets=[["MTWT___","____F__","_____S_","______S"],["MTWTF__","_____S_","______S"],["MTWTFSS"],["M______","_TWT___","____F__","_____S_","______S"],["M______","_TWTF__","_____S_","______S"],["M______","_T_____","__W____","___T___","____F__","_____S_","______S"]];const DOWNames={M______:"Mon",_T_____:"Tue",__W____:"Wed",___T___:"Thu",____F__:"Fri",_____S_:"Sat",______S:"Sun",MTWT___:"Mon-Thu",MTWTF__:"Mon-Fri",MTWTFSS:"Mon-Sun",_TWT___:"Tue-Thu",_TWTF__:"Tue-Fri"};exports.nameDOW=function(_){if(_ in DOWNames)return DOWNames[_];throw new Error(`Days of week value "${_}" is invalid or not supported`)},exports.validateDOW=function(_){if(/^(M|_)(T|_)(W|_)(T|_)(F|_)(S|_)(S|_)$/.test(_))return _;throw new Error(`Invalid days of week value: "${_}"`)}},{}],3:[function(require,module,exports){"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.editorDraw=exports.COL_SIZE=exports.ROW_SIZE=void 0;const css_1=require("./css");exports.ROW_SIZE=20,exports.COL_SIZE=48;exports.editorDraw=function(t){const s=t.html.canvas,r=t.html.context,i=t.content,l=i.length,n=null!=(o=null==(e=i[0])?void 0:e.length)?o:0;if(i.some(t=>t.length!==n))throw"Grid is jagged (some columns have more rows than others)";var e=function(t){return(window.devicePixelRatio||1)/(t.backingStorePixelRatio||1)}(r),x=function(t,e,o){var s=t.html.editor.getBoundingClientRect(),r=t.html.stops.getBoundingClientRect().width,i=t.html.services.getBoundingClientRect().height,r=s.width-r,s=s.height-i,i=t.html.editor.scrollLeft,t=t.html.editor.scrollTop,t=Math.max(0,Math.floor(t/exports.ROW_SIZE)),e=Math.min(e,t+Math.ceil(s/exports.ROW_SIZE)+1),s=e-t,i=Math.max(0,Math.floor(i/exports.COL_SIZE)),o=Math.min(o,i+Math.ceil(r/exports.COL_SIZE)+1);return{x1:i,x2:o,y1:t,y2:e,width:o-i,height:s}}(t,n,l);t.html.grid.style.width=exports.COL_SIZE*l+"px",t.html.grid.style.height=exports.ROW_SIZE*n+"px",s.width=exports.COL_SIZE*x.width*e,s.height=exports.ROW_SIZE*x.height*e,s.style.width=exports.COL_SIZE*x.width+"px",s.style.height=exports.ROW_SIZE*x.height+"px",s.style.left=exports.COL_SIZE*x.x1+"px",s.style.top=exports.ROW_SIZE*x.y1+"px",r.clearRect(0,0,s.width,s.height),r.translate(-x.x1*exports.COL_SIZE*e,-x.y1*exports.ROW_SIZE*e),r.scale(e,e),r.fillStyle=css_1.css.paper10;for(let t=x.y1;t<x.y2;t++)t%2==0&&r.fillRect(x.x1*exports.COL_SIZE,t*exports.ROW_SIZE,x.width*exports.COL_SIZE,exports.ROW_SIZE);r.font="0.7rem 'Roboto Mono', monospace",r.fillStyle=css_1.css.text;for(let t=x.x1;t<x.x2;t++)for(let e=x.y1;e<x.y2;e++){const o=i[t][e];r.fillText(o,t*exports.COL_SIZE+7,e*exports.ROW_SIZE+14)}r.fillStyle=css_1.css.hoverHighlight;var o=t.events.mouseOver,p=(null!=o&&r.fillRect(o.x*exports.COL_SIZE,o.y*exports.ROW_SIZE,exports.COL_SIZE,exports.ROW_SIZE),r.lineWidth=Math.round(1.5*e)/e,r.strokeStyle=css_1.css.accent,t.events.selected);if(null!=p){const t=Math.min(p.startX,p.endX),e=Math.max(p.startX,p.endX)-t+1,o=Math.min(p.startY,p.endY),s=Math.max(p.startY,p.endY)-o+1;r.strokeRect(t*exports.COL_SIZE,o*exports.ROW_SIZE,e*exports.COL_SIZE,s*exports.ROW_SIZE)}}},{"./css":1}],4:[function(require,module,exports){"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.editorInit=void 0;const editor_draw_1=require("./editor-draw");function editorScrollEvent(e,t){var n=e=window.event||e,n=Math.max(-1,Math.min(1,n.wheelDelta||-n.detail));t.html.editor.scrollLeft-=64*n,e.preventDefault()}function canvasMouseMoveEvent(e,t){t.events.mouseOver=relativeCoords(e,t),t.events.dragging&&(1!=e.buttons?t.events.dragging=!1:(t.events.selected.endX=t.events.mouseOver.x,t.events.selected.endY=t.events.mouseOver.y)),t.draw()}function relativeCoords(e,t){var t=t.html.grid.getBoundingClientRect(),r=e.clientX-t.left,e=e.clientY-t.top;return{x:Math.floor(r/editor_draw_1.COL_SIZE),y:Math.floor(e/editor_draw_1.ROW_SIZE)}}exports.editorInit=function(e){e.draw(),e.html.canvas.addEventListener("mousedown",t=>{t=relativeCoords(t,e);e.events.selected={startX:t.x,startY:t.y,endX:t.x,endY:t.y},e.events.dragging=!0,e.draw()}),e.html.canvas.addEventListener("mouseup",t=>{t=relativeCoords(t,e);e.events.selected.endX=t.x,e.events.selected.endY=t.y,e.events.dragging=!1,e.draw()}),e.html.canvas.addEventListener("mousemove",t=>canvasMouseMoveEvent(t,e)),e.html.canvas.addEventListener("mouseenter",t=>canvasMouseMoveEvent(t,e)),e.html.canvas.addEventListener("mouseleave",()=>{e.events.mouseOver=null,e.draw()}),e.html.editor.addEventListener("scroll",()=>{e.events.mouseOver=null,e.draw()}),e.html.editor.addEventListener("mousewheel",t=>editorScrollEvent(t,e),!1),e.html.editor.addEventListener("DOMMouseScroll",t=>editorScrollEvent(t,e),!1)}},{"./editor-draw":3}],5:[function(require,module,exports){"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.Editor=void 0;const editor_draw_1=require("./editor-draw"),editor_init_1=require("./editor-init");exports.Editor=class{constructor(t,e,s,n,i){const r=document.getElementById(t),o=document.getElementById(e),d=document.getElementById(s),c=d.getContext("2d"),l=document.getElementById(n),a=document.getElementById(i);this.html={editor:r,grid:o,canvas:d,context:c,stops:l,services:a},this._content=[],this.resetEvents()}windowResized(){this.events.mouseOver=null,this.draw()}resetEvents(){this.events={mouseOver:null,selected:null,dragging:!1}}init(){(0,editor_init_1.editorInit)(this)}draw(){(0,editor_draw_1.editorDraw)(this)}clear(){this._content=[],this.resetEvents(),this.html.stops.replaceChildren(),this.draw()}setSection(t,e){this._content=t.grid,this.resetEvents(),this.setStops(t.stops,e),this.draw()}get content(){return this._content}setStops(t,e){this.html.stops.replaceChildren(...t.map(t=>{const s=document.createElement("div"),n=(s.className="stop",document.createElement("p"));return n.textContent=e.stopName(t),s.append(n),s}))}}},{"./editor-draw":3,"./editor-init":4}],6:[function(require,module,exports){"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.Header=void 0;const dow_1=require("./dow"),generalDirNames={up:"Up",down:"Down"};exports.Header=class{constructor(e,t,a,n,o){this.newTimetableButton=document.getElementById(e),this.importButton=document.getElementById(t),this.exportButton=document.getElementById(a),this.tabs=document.getElementById(n),this._callback=o}set newTimetableButtonEnabled(e){this.newTimetableButton.disabled=!e}set importButtonEnabled(e){this.importButton.disabled=!e}set exportButtonEnabled(e){this.exportButton.disabled=!e}clearTabs(){this.tabs.replaceChildren()}createTabs(e,t){this.tabs.replaceChildren(...e.map(e=>this.createTabGroup(e,t)))}selectTab(e,t){document.querySelector(`#tab-group-${e} input[value="${t}"]`).checked=!0}createTabGroup(e,t){const a=document.createElement("div"),n=(a.className="tab-group",a.id="tab-group-"+e,document.createElement("div")),o=(n.className="tab-group-header",document.createElement("p"));return o.textContent=generalDirNames[e]+":",n.append(o),a.append(n),a.append(...t.map(t=>{const a=document.createElement("label"),n=(a.className="tab",document.createElement("input")),o=(n.type="radio",n.name="tab",n.autocomplete="off",n.value=t,n.addEventListener("click",()=>this._callback(e,t)),document.createElement("div")),c=(o.className="tab-content",document.createElement("p"));return c.textContent=(0,dow_1.nameDOW)(t),o.append(c),a.append(n,o),a})),a}}},{"./dow":2}],7:[function(require,module,exports){"use strict";function getUpStopLists(t,e){const i=e.lines.find(e=>e.id===t);return function(t,e){if("linear"===t)return["up"];if("city-loop"===t)return["up-direct","up-via-loop"];if("branch"===t)return e.filter(t=>t.endsWith("-up"));throw new Error(`Route types of "${t}" are not supported.`)}(i.routeType,i.directions.map(t=>t.id)).map(t=>[...i.directions.find(e=>e.id===t).stops])}Object.defineProperty(exports,"__esModule",{value:!0}),exports.linearizeStopIDs=void 0,exports.linearizeStopIDs=function(t,e){const i=getUpStopLists(t,e);if(1==i.length)return i[0];let o=0;const n=[];for(;0<i.length;)if(0===i[o].length)i.splice(o,1),o=0;else{const t=i[o][0],e=i.findIndex((e,i)=>i!==o&&1<=e.indexOf(t));-1===e?(n.push(t),i.forEach(e=>{e[0]===t&&e.splice(0,1)})):(i[o].splice(0,1),o=e)}return function(t,e,i){const o=getUpStopLists(t,e);for(const t of o){let e=-1;for(const o of t){const t=i.indexOf(o);if(-1==t||t<=e)throw new Error('Cannot find linear order of stops to form the "up" and "down" directions');e=t}}}(t,e,n),n}},{}],8:[function(require,module,exports){"use strict";Object.defineProperty(exports,"__esModule",{value:!0});const dow_1=require("./dow"),editor_1=require("./editor"),header_1=require("./header"),network_1=require("./network"),new_timetable_dialog_1=require("./new-timetable-dialog"),status_screens_1=require("./status-screens"),timetable_1=require("./timetable");let timetable=null;const editor=new editor_1.Editor("editor","grid","grid-canvas","stops","services"),newTimetableDialog=(editor.init(),window.addEventListener("resize",()=>editor.windowResized()),document.addEventListener("paste",e=>{(function(e){console.log(JSON.stringify(e))})(e.clipboardData.getData("text")),e.preventDefault()}),new new_timetable_dialog_1.NewTimetableDialog("new-timetable-dialog",function(e,t,i){i=parseInt(i,36),t=dow_1.DOWPresets[t];timetable=new timetable_1.Timetable(i,e,t,network),status.editing(timetable),status.editingSection(timetable,timetable.generalDirs[0],timetable.dows[0],!0,network)})),header=new header_1.Header("new-timetable-button","import-button","export-button","tabs",function(e,t){status.editingSection(timetable,e,t,!1,network)}),status=new status_screens_1.StatusScreens("status",editor,header),network=(status.loading(),new network_1.Network);network.load().then(()=>{newTimetableDialog.init(network),status.ready()}),header.newTimetableButton.addEventListener("click",()=>{null!=timetable&&!confirm("Create a new timetable? This one won't be saved anywhere.")||newTimetableDialog.show()})},{"./dow":2,"./editor":5,"./header":6,"./network":9,"./new-timetable-dialog":10,"./status-screens":11,"./timetable":12}],9:[function(require,module,exports){"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.Network=void 0;exports.Network=class{constructor(t="api.trainarrives.in"){this.domain=t,this._json=null}async load(){const t=await fetch(`https://${this.domain}/network/v1`);if(200!=t.status)throw new Error(`"${this.domain}" did not respond.`);this._json=await t.json()}get lines(){if(null==this._json)throw new Error("Network not loaded.");return this._json.lines}stopName(t){if(null==this._json)throw new Error("Network not loaded.");var o=this._json.stops.find(o=>o.id===t);if(null==o)throw new Error("No stop with id="+t);return o.name}}},{}],10:[function(require,module,exports){"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.NewTimetableDialog=void 0;const dow_1=require("./dow");exports.NewTimetableDialog=class{constructor(e,t){this._dialog=document.getElementById(e),this._cancelButton=document.getElementById(e+"-cancel"),this._submitButton=document.getElementById(e+"-submit"),this._linesSelect=document.getElementById(e+"-lines"),this._dowsSelect=document.getElementById(e+"-dows"),this._idInput=document.getElementById(e+"-id"),this._errorText=document.getElementById(e+"-error"),this.submitted=t}init(e){e=[...e.lines].sort((e,t)=>e.name.localeCompare(t.name)).map(e=>new Option(e.name,e.id.toString())),this._linesSelect.replaceChildren(...e),e=dow_1.DOWPresets.map((e,t)=>new Option(e.map(e=>(0,dow_1.nameDOW)(e)).join(", "),t.toString()));this._dowsSelect.replaceChildren(...e),this._cancelButton.addEventListener("click",()=>{this._dialog.close()}),this._submitButton.addEventListener("click",()=>{var e=this._linesSelect.value,t=this._dowsSelect.value,i=this._idInput.value,s=parseInt(e),t=parseInt(t);try{this.submitted(s,t,i),this._dialog.close(),this._errorText.textContent=""}catch(e){this._errorText.textContent=e.message}})}show(){this._dialog.showModal(),this._errorText.textContent=""}}},{"./dow":2}],11:[function(require,module,exports){"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.StatusScreens=void 0;exports.StatusScreens=class{constructor(e,t,s){this._status=document.getElementById(e),this._statusLoading=document.getElementById(e+"-loading"),this._statusReady=document.getElementById(e+"-ready"),this._editor=t,this._header=s}loading(){this._status.classList.remove("gone"),this._statusLoading.classList.remove("gone"),this._statusReady.classList.add("gone"),this._header.newTimetableButtonEnabled=!1,this._header.importButtonEnabled=!1,this._header.exportButtonEnabled=!1,this._header.clearTabs(),this._editor.clear(),window.onbeforeunload=null}ready(){this._status.classList.remove("gone"),this._statusLoading.classList.add("gone"),this._statusReady.classList.remove("gone"),this._header.newTimetableButtonEnabled=!0,this._header.importButtonEnabled=!0,this._header.exportButtonEnabled=!1,this._header.clearTabs(),this._editor.clear(),window.onbeforeunload=null}editing(e){this._status.classList.add("gone"),this._header.newTimetableButtonEnabled=!0,this._header.importButtonEnabled=!0,this._header.exportButtonEnabled=!0,this._header.createTabs(e.generalDirs,e.dows),window.onbeforeunload=function(){return!0}}editingSection(e,t,s,a,i){a&&this._header.selectTab(t,s),this._editor.setSection(e.getTimetableSection(t,s),i)}}},{}],12:[function(require,module,exports){"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.TimetableSection=exports.Timetable=void 0;const dow_1=require("./dow"),linearize_stops_1=require("./linearize-stops"),validation_1=require("./validation");exports.Timetable=class{constructor(e,i,t,s){this.timetableID=(0,validation_1.validateTimetableID)(e),this.lineID=(0,validation_1.validateLineID)(i,s),this._dows=t,this.sections=[];e=(0,linearize_stops_1.linearizeStopIDs)(i,s);this.linearizedStops={up:e,down:[...e].reverse()},t.forEach(e=>{this.sections.push(new TimetableSection("up",e,this.linearizedStops.up)),this.sections.push(new TimetableSection("down",e,this.linearizedStops.down))})}get generalDirs(){return["up","down"]}get dows(){return[...this._dows]}getTimetableSection(e,i){var t=this.sections.find(t=>t.generalDir===e&&t.dow===i);if(null!=t)return t;throw new Error(`Timetable section in generalDir="${e}", `+`dow="${i}" does not exist`)}};class TimetableSection{constructor(e,i,t){this.generalDir=e,this.dow=(0,dow_1.validateDOW)(i),this.grid=[],this.stops=t}}exports.TimetableSection=TimetableSection},{"./dow":2,"./linearize-stops":7,"./validation":13}],13:[function(require,module,exports){"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.validateLineID=exports.validateTimetableID=void 0,exports.validateTimetableID=function(e){if(isNaN(e))throw new Error("No timetable ID given");if(1295<e||e<0)throw new Error("Timetable ID must be 0-1295 to fit within two base-36 "+`digits (given ${e})`);return e},exports.validateLineID=function(e,i){if(i.lines.every(i=>i.id!==e))throw new Error("There is no line with id="+e);return e}},{}]},{},[8]);
