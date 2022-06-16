import { Network } from "./network";
import { TimetableSection } from "./timetable";

export function extractContent(network: Network, section: TimetableSection,
  pastedText: string): string[][] {

  const stopNames = section.stops.map(s => network.stopName(s).toLowerCase());

  const timetableLineRegex = /^.+( +(([0-9]{1,2}[:.][0-9]{2}(am|pm|[uda])?)|-))+$/;
  const timesOnlyRegex = /( +(([0-9]{1,2}[:.][0-9]{2}(am|pm|[uda])?)|-))+$/;
  const lines = pastedText
    .split("\n")
    .map(x => x.trim().toLowerCase().replace(/[-–—]/g, "-"))
    .filter(x => timetableLineRegex.test(x))
    .map(x => {
      const header = x.split(timesOnlyRegex)[0];
      const stop = stopNames.find(s => stopNameAlternatives(s).some(a =>
        a === header));

      return {
        stop: stop,
        times: x.substring(timesOnlyRegex.exec(x).index).trim().split(" ")
      };
    })
    .filter(x => x.stop != null);

  const maxCols = Math.max(...lines.map(x => x.times.length));

  const result: string[][] = [];
  for (let y = 0; y < section.stops.length; y++) {
    const lineOptions = lines.filter(l => l.stop === stopNames[y]);

    let times: string[] = null;
    if (lineOptions.length == 1) {
      times = lineOptions[0].times;
    }
    else if (lineOptions.length > 1) {
      alert(`"${network.stopName(section.stops[y])}" had multiple rows in the pasted timetable.`);
      times = lineOptions[0].times;
    }

    for (let x = 0; x < maxCols; x++) {
      if (result[x] == null) {
        result[x] = [];
      }

      if (times == null || times.length <= x) {
        result[x][y] = "";
      }
      else {
        result[x][y] = times[x];
      }
    }
  }
  return result;
}

function stopNameAlternatives(stopName: string) {
  return [stopName, `${stopName} dep`, `${stopName} arr`]
}
