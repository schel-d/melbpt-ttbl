import { Service } from "../data/timetable-data";
import { AppContext } from "../app-context";
import { repeat } from "../utils";
import { CommandHandler, keyFilter } from "./command-handler";

/**
 * Responsible for handling Shift+N, which adds a new column to the right of the
 * current section.
 */
export class NewServiceHandler extends CommandHandler {
  constructor() {
    // Request Shift+N.
    super([
      keyFilter({ key: "KeyN", shift: true })
    ]);
  }

  handle(_char: string, _key: string, _ctrl: boolean, _alt: boolean,
    _shift: boolean, appContext: AppContext) {

    const section = appContext.editor.section;

    // If there is no section selected (no timetable loaded), do nothing.
    if (section == null) {
      return;
    }

    // Otherwise, add an empty service to the current section.
    section.edit("Add empty service", data => {
      data.addServices([new Service(repeat("", section.height), false)]);
    });
  }
}
