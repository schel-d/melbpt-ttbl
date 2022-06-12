import { Editor } from "./editor";

type NetworkApiV1Schema = {
  hash: string,
  stops: {
    id: number,
    name: string,
    platforms: {
      id: string,
      name: string
    }[],
    urlName: string
  }[],
  lines: {
    id: number,
    name: string,
    color: string,
    service: string,
    routeType: string,
    directions: {
      id: string,
      name: string,
      stops: number[]
    }[]
  }[]
}

const editor = new Editor("editor", "grid", "grid-canvas", "stops", "services");

const content = [];
for (let x = 0; x < 50; x++) {
  content[x] = [];
  for (let y = 0; y < 31; y++) {
    content[x][y] = `${x.toFixed().padStart(2, "0")}:${y.toFixed().padStart(2, "0")}`;
  }
}

editor.init();
editor.content = content;
window.addEventListener("resize", () => editor.windowResized());

let network: NetworkApiV1Schema = null;
fetch("https://api.trainarrives.in/network/v1").then(async response => {
  if (response.status != 200) {
    alert("Train Arrives In API didn't respond.");
  }
  network = await response.json();
  console.log(network);
});

document.querySelector("#new-timetable-button").addEventListener("click", () => {
  if (network == null) { return; }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dialog = document.querySelector("#new-timetable-dialog") as any;
  const select = document.querySelector("#new-timetable-dialog-lines") as HTMLSelectElement;
  while (select.lastChild) {
    select.removeChild(select.lastChild);
  }

  const lines = [...network.lines].sort((a, b) => a.name.localeCompare(b.name));
  lines.map(line => {
    const option = new Option(line.name, line.id.toString());
    select.appendChild(option);
  })

  dialog.showModal();
});
document.querySelector("#new-timetable-dialog-cancel").addEventListener("click", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dialog = document.querySelector("#new-timetable-dialog") as any;
  dialog.close();
});
document.querySelector("#new-timetable-dialog-submit").addEventListener("click", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dialog = document.querySelector("#new-timetable-dialog") as any;
  dialog.close();
});
