import { Network } from "./network";

// HTML IDs for dialog elements.
const dialogID = "#new-timetable-dialog"
const cancelButtonID = "#new-timetable-dialog-cancel"
const submitButtonID = "#new-timetable-dialog-submit"
const linesSelectID = "#new-timetable-dialog-lines"

export function setup() {
  // Close dialog on cancel button (note that ESC key can also close dialogs).
  document.querySelector(cancelButtonID).addEventListener("click", () => {
    // Required to cast to any since typescript does not know about showModal().
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dialog = document.querySelector(dialogID) as any;
    dialog.close();
  });

  // Close dialog on submit button.
  document.querySelector(submitButtonID).addEventListener("click", () => {
    // Required to cast to any since typescript does not know about showModal().
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dialog = document.querySelector(dialogID) as any;
    dialog.close();
  });
}
export function show(network: Network) {
  // Sort lines by name alphabetical order.
  const lines = [...network.lines].sort((a, b) => a.name.localeCompare(b.name));

  // Required to cast to any since typescript does not know about showModal().
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dialog = document.querySelector(dialogID) as any;

  // Remove all existing options from lines select, and add each line as an
  // option.
  const select = document.querySelector(linesSelectID) as HTMLSelectElement;
  while (select.lastChild) { select.removeChild(select.lastChild); }
  lines.map(line => {
    const option = new Option(line.name, line.id.toString());
    select.appendChild(option);
  })

  dialog.showModal();
}
