import { Network } from "./network";
import { Timetable } from "./timetable";

export function openImportDialog(network: Network, callback: (timetable: Timetable) => void) {
  openFileDialog((content) => {
    console.log(content);
    const timetable = new Timetable(0, 1, ["M______"], network);
    callback(timetable);
  });
}

function openFileDialog(callback: (content: string) => void) {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".ttbl";
  input.click();

  input.addEventListener("change", async () => {
    callback(await input.files[0].text())
  });
}
