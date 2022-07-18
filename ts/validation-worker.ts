import { Network } from "./data/network";
import { TimetableSection } from "./data/timetable-section";
import { validateSection } from "./data/timetable-validation";

// Timetable validation is done off the main thread, as it could be quite
// taxing, especially since it is done every time the timetable is changed (and
// 500ms have passed without any further changes).

let network: Network | null = null;

onmessage = (e) => {
  // Upon initialization, the validation worker should be sent the network
  // object (by itself). This is cached in the network variable above, so it
  // doesn't need to be provided everytime validation is requested.
  if (e.data.network) {
    network = Network.fromJSON(e.data.network);
    return;
  }

  // After that, each query should be for validation. If the network object
  // hasn't been correctly provided, then I guess we will ignore the validation
  // requests and chuck an error in the console.
  if (network == null) {
    console.error("Cannot validate the timetable. The network object has not " +
      "yet been provided to the validation worker.")
    return;
  }

  // Parse the timetable from JSON, validate the section, then post the results
  // back to the main thread.
  const section = TimetableSection.fromJSON(e.data.section);
  const lineID = e.data.lineID;
  const results = validateSection(section, network, lineID);
  postMessage(results.toJSON());
};
