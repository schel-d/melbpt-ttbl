import { AppContext } from "../main";
import { repeat } from "../utils";
import { CommandHandler, keyFilter } from "./command-handler";

export class NewServiceHandler extends CommandHandler {
  constructor() {
    super([
      keyFilter({ key: "KeyN", shift: true })
    ]);
  }

  handle(_char: string, key: string, _ctrl: boolean, _alt: boolean,
    _shift: boolean, appContext: AppContext): void {

    const section = appContext.editor.section;

    // If there are no services in the timetable or nothing is selected, do
    // nothing.
    if (section == null) {
      return;
    }

    section.watchAppend("Add empty service", log => {
      log.appendServices([repeat("", section.height)]);
    });
  }
}
