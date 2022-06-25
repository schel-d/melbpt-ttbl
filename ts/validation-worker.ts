import { Network } from "./data/network";
import { TimetableSection } from "./data/timetable-section";
import { validateSection } from "./data/timetable-validation";

let network: Network = null;

onmessage = (e) => {
  if (e.data.network) {
    network = Network.fromJSON(e.data.network);
    return;
  }

  if (network == null) {
    return;
  }

  const section = TimetableSection.fromJSON(e.data.section);
  const results = validateSection(section, network);
  postMessage(results.toJSON());
};
