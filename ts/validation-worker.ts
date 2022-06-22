import { Network } from "./data/network";
import { TimetableSection } from "./data/timetable-section";
import { validateSection } from "./data/timetable-validation";

onmessage = (e) => {
  const section = TimetableSection.fromJSON(e.data.section);
  const network = Network.fromJSON(e.data.network);
  const results = validateSection(section, network);
  postMessage(results.toJSON());
};
