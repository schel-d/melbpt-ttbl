import { validateDOW } from "./dow";
import { Network } from "./network";
import { validateLineID, validateTimetableID } from "./validation";

export class Timetable {
  timetableID: number;
  lineID: number;
  upStopIDs: number[];
  downStopIDs: number[];
  sections: TimetableSection[];

  constructor(timetableID: number, lineID: number, sectionsDOWs: string[],
    network: Network) {

    this.timetableID = validateTimetableID(timetableID);
    this.lineID = validateLineID(lineID, network);
    this.sections = [];

    // Create an up and down timetable section for each set of days (a set of
    // days being something like "MTWT___" for Mon-Thu, or "______S" for Sun).
    sectionsDOWs.forEach(d => {
      this.sections.push(new TimetableSection(true, d));
      this.sections.push(new TimetableSection(false, d));
    })
  }
}

export class TimetableSection {
  upDirection: boolean;
  dow: string;
  grid: string[][];

  constructor(upDirection: boolean, dow: string) {
    this.upDirection = upDirection;
    this.dow = validateDOW(dow);
    this.grid = [];
  }
}