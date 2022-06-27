!function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);throw(f=new Error("Cannot find module '"+i+"'")).code="MODULE_NOT_FOUND",f}c=n[i]={exports:{}},e[i][0].call(c.exports,function(r){return o(e[i][1][r]||r)},c,c.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}({1:[function(require,module,exports){"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.validateDOW=exports.nameDOW=exports.DOWPresets=void 0,exports.DOWPresets=[["MTWT___","____F__","_____S_","______S"],["MTWTF__","_____S_","______S"],["MTWTFSS"],["M______","_TWT___","____F__","_____S_","______S"],["M______","_TWTF__","_____S_","______S"],["M______","_T_____","__W____","___T___","____F__","_____S_","______S"]];const DOWNames={M______:"Mon",_T_____:"Tue",__W____:"Wed",___T___:"Thu",____F__:"Fri",_____S_:"Sat",______S:"Sun",MTWT___:"Mon-Thu",MTWTF__:"Mon-Fri",MTWTFSS:"Mon-Sun",_TWT___:"Tue-Thu",_TWTF__:"Tue-Fri"};exports.nameDOW=function(_){if(_ in DOWNames)return DOWNames[_];throw new Error(`Days of week value "${_}" is invalid or not supported`)},exports.validateDOW=function(_){if(/^(M|_)(T|_)(W|_)(T|_)(F|_)(S|_)(S|_)$/.test(_))return _;throw new Error(`Invalid days of week value: "${_}"`)}},{}],2:[function(require,module,exports){"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.Network=void 0;exports.Network=class Network{constructor(t="api.trainarrives.in"){this.domain=t,this._json=null}async load(){const t=await fetch(`https://${this.domain}/network/v1`);if(200!=t.status)throw new Error(`"${this.domain}" did not respond.`);this._json=await t.json()}get lines(){if(null==this._json)throw new Error("Network not loaded.");return this._json.lines}stopName(t){if(null==this._json)throw new Error("Network not loaded.");var o=this._json.stops.find(o=>o.id===t);if(null==o)throw new Error("No stop with id="+t);return o.name}line(t){return this._json.lines.find(o=>o.id==t)}directionsForLine(t){return this._json.lines.find(o=>o.id==t).directions}toJSON(){return{domain:this.domain,json:this._json}}static fromJSON(t){const o=new Network(t.domain);return o._json=t.json,o}}},{}],3:[function(require,module,exports){"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.Service=exports.TimetableData=void 0;exports.TimetableData=class TimetableData{constructor(e=[]){this._services=e.map(e=>e.clone())}cell(e,s){return this._services[e].times[s]}service(e){return this._services[e].clone()}nextDay(e){return this._services[e].nextDay}map(e){return this._services.map(s=>e(s.clone()))}addServices(e,s){null==s?this._services.push(...e.map(e=>e.clone())):this._services.splice(s,0,...e.map(e=>e.clone()))}deleteServices(e,s){null==s?this._services.splice(e,1):this._services.splice(e,s-e)}replaceService(e,s){this._services[s]=e.clone()}replaceCell(e,s,t){this._services[e].times[s]=t}modifyCell(e,s,t){this._services[e].times[s]=t(this._services[e].times[s])}modifyCells(e,s,t,i,r){for(let c=Math.min(e,t);c<=Math.max(e,t);c++)for(let e=Math.min(s,i);e<=Math.max(s,i);e++)this._services[c].times[e]=r(this._services[c].times[e],c,e)}setNextDay(e,s){this._services[e].nextDay=s}clone(){return new TimetableData(this._services)}get width(){return this._services.length}toJSON(){return{services:this._services}}static fromJSON(e){return new TimetableData(e.services.map(e=>Service.fromJSON(e)))}};class Service{constructor(e,s){this.times=e,this.nextDay=s}clone(){return new Service([...this.times],this.nextDay)}static fromJSON(e){return new Service(e.times,e.nextDay)}}exports.Service=Service},{}],4:[function(require,module,exports){"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.TimetableSection=void 0;const dow_1=require("./dow"),timetable_data_1=require("./timetable-data");exports.TimetableSection=class TimetableSection{constructor(t,e,a){this.generalDir=t,this.dow=(0,dow_1.validateDOW)(e),this._data=new timetable_data_1.TimetableData,this.stops=a,this.undoFrames=[],this.redoFrames=[]}edit(t,e){for(this.undoFrames.push({actionName:t,before:this._data});10<this.undoFrames.length;)this.undoFrames.shift();this.redoFrames=[],t=this._data.clone(),e(t),this._data=t,this.changed&&this.changed()}undo(){var t=this.undoFrames.pop();return null==t?null:(this.redoFrames.push({actionName:t.actionName,after:this._data}),this._data=t.before,this.changed&&this.changed(),t.actionName)}redo(){var t=this.redoFrames.pop();return null==t?null:(this.undoFrames.push({actionName:t.actionName,before:this._data}),this._data=t.after,this.changed&&this.changed(),t.actionName)}cell(t,e){return this._data.cell(t,e)}service(t){return this._data.service(t)}nextDay(t){return this._data.nextDay(t)}map(t){return this._data.map(t)}toJSON(){return{generalDir:this.generalDir,dow:this.dow,stops:this.stops,data:this._data.toJSON()}}static fromJSON(t){const e=new TimetableSection(t.generalDir,t.dow,t.stops);return e._data=timetable_data_1.TimetableData.fromJSON(t.data),e}get width(){return this._data.width}get height(){return this.stops.length}}},{"./dow":1,"./timetable-data":3}],5:[function(require,module,exports){"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.ValidationResults=exports.validateSection=exports.isValidTimetable=void 0;const utils_1=require("../utils");function validateSection(e,r,t){var s=new ValidationResults(e.width,e.height);return function(e,r){for(const t of(0,utils_1.range)(0,e.height))(0,utils_1.range)(0,e.width).some(r=>""==e.cell(r,t))&&r.reportStopError(t,"Stop has missing values")}(e,s),function(e,r){for(const t of(0,utils_1.range)(0,e.width)){const s=e.service(t);for(const i of(0,utils_1.range)(0,t)){const o=e.service(i);s.nextDay==o.nextDay&&s.times.every((e,r)=>e==o.times[r])&&r.reportServiceError(t,"Duplicated service")}}}(e,s),function(e,r,t,s){var i=r.line(t);for(const r of(0,utils_1.range)(0,e.width)){const t=e.service(r),o=/^((2[0-3]|[01][0-9]):[0-5][0-9]|-)$/;if(t.times.every(e=>""==e||o.test(e))){if(!t.times.some(e=>""==e)){const o=function(e,r,t){const s=e.filter((e,t)=>"-"!=r.times[t]);if(s.length<2)return null;const i=t.filter(e=>s.every(r=>e.stops.includes(r)));return 0==i.length?null:i.sort((e,r)=>e.stops.length-r.stops.length)[0].id}(e.stops,t,i.directions);if(null==o)s.reportServiceError(r,"Service direction unrecognized");else{s.reportServiceDirection(r,function(e,r){return"city-loop"===r.routeType?e.endsWith("-via-loop")?r.routeLoopPortal+"-via-loop":r.routeLoopPortal+"-direct":"branch"===r.routeType&&2==r.directions.length?e===r.directions[0].id?"branch-a":"branch-b":null}(o,i));const e=function(e){const r=[];let t=0;for(let s=0;s<e.times.length;s++){var i;"-"===e.times[s]?r.push(t):(i=(0,utils_1.parseMinuteOfDay)(e.times[s]),r.push(i),t=i)}const s=[];for(let e=1;e<r.length;e++)r[e-1]>r[e]&&s.push(e);return e.nextDay&&0===s.length?0:e.nextDay||0!==s.length?e.nextDay||1!==s.length?null:s[0]:r.length}(t);null==e?s.reportServiceError(r,"Time travel required (service spans too many days)"):s.reportNextDayThreshold(r,e)}}}else s.reportServiceError(r,"Cells contain invalid values")}}(e,r,t,s),s}exports.isValidTimetable=function(e,r){return e.sections.every(t=>validateSection(t,r,e.lineID).isValid())},exports.validateSection=validateSection;class ValidationResults{constructor(e,r){this.stopErrors=(0,utils_1.repeat)(null,r),this.serviceErrors=(0,utils_1.repeat)(null,e),this.nextDayThresholds=(0,utils_1.repeat)(null,e),this.directionsIcons=(0,utils_1.repeat)(null,e)}reportStopError(e,r){this.stopErrors[e]=r}reportServiceError(e,r){this.serviceErrors[e]=r}reportServiceDirection(e,r){this.directionsIcons[e]=r}reportNextDayThreshold(e,r){this.nextDayThresholds[e]=r}isValid(){return this.stopErrors.every(e=>null==e)&&this.serviceErrors.every(e=>null==e)}overallError(){let e=null;if(null==(e=null==(e=null==e?this.stopErrors.find(e=>null!=e):e)?this.serviceErrors.find(e=>null!=e):e))return null;var r=this.stopErrors.filter(e=>null!=e).length+this.serviceErrors.filter(e=>null!=e).length-1;return 0==r?e:1==r?e+" + 1 other error":e+` + ${r} other errors`}toJSON(){return{stopErrors:this.stopErrors,serviceErrors:this.serviceErrors,nextDayThresholds:this.nextDayThresholds,directionsIcons:this.directionsIcons}}static fromJSON(e){const r=new ValidationResults(e.serviceErrors.length,e.stopErrors.length);return r.stopErrors=e.stopErrors,r.serviceErrors=e.serviceErrors,r.nextDayThresholds=e.nextDayThresholds,r.directionsIcons=e.directionsIcons,r}}exports.ValidationResults=ValidationResults},{"../utils":6}],6:[function(require,module,exports){"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.parseMinuteOfDay=exports.repeat=exports.range=exports.clamp=exports.validateLineID=exports.validateTimetableID=void 0,exports.validateTimetableID=function(e){if(isNaN(e))throw new Error("No timetable ID given");if(1295<e||e<0)throw new Error("Timetable ID must be 0-1295 to fit within two base-36 "+`digits (given ${e})`);return e},exports.validateLineID=function(e,t){if(t.lines.every(t=>t.id!==e))throw new Error("There is no line with id="+e);return e},exports.clamp=function(e,t,r){var a=Math.min(t,r),t=Math.max(t,r);return Math.min(Math.max(e,a),t)},exports.range=function(e,t){return[...Array(t-e).keys()].map(t=>t+e)},exports.repeat=function(e,t){const r=[];for(let a=0;a<t;a++)r.push(e);return r},exports.parseMinuteOfDay=function(e){var t=e.split(":"),r=parseInt(t[0]),t=parseInt(t[1]);if(isNaN(r)||isNaN(t)||r<0||t<0||23<r||59<t)throw new Error(`"${e}" is not a valid time of day`);return 60*r+t}},{}],7:[function(require,module,exports){"use strict";Object.defineProperty(exports,"__esModule",{value:!0});const network_1=require("./data/network"),timetable_section_1=require("./data/timetable-section"),timetable_validation_1=require("./data/timetable-validation");let network=null;onmessage=e=>{if(e.data.network)network=network_1.Network.fromJSON(e.data.network);else if(null!=network){const t=timetable_section_1.TimetableSection.fromJSON(e.data.section),a=e.data.lineID,o=(0,timetable_validation_1.validateSection)(t,network,a);postMessage(o.toJSON())}}},{"./data/network":2,"./data/timetable-section":4,"./data/timetable-validation":5}]},{},[7]);
