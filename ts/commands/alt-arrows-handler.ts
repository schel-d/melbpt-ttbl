import { AppContext } from "../app-context";
import { range } from "../utils";
import { CommandHandler, keyFilter } from "./command-handler";

/**
 * Responsible for handling Alt+Left and Alt+Right keyboard commands, which
 * shift the selected columns left and right, similarly to VSCode's Alt+Up and
 * Alt+Down commands.
 */
export class AltArrowsHandler extends CommandHandler {
  constructor() {
    // Request control of Alt+Left and Alt+Right.
    super([
      keyFilter({ key: "ArrowLeft", alt: true }),
      keyFilter({ key: "ArrowRight", alt: true })
    ]);
  }

  handle(_char: string, key: string, _ctrl: boolean, _alt: boolean,
    _shift: boolean, appContext: AppContext) {

    const section = appContext.editor.section;
    const grid = appContext.editor.grid;

    // If there are no services in the timetable or nothing is selected, do
    // nothing.
    if (section == null || section.width == 0 || grid.selectedRange == null) {
      return;
    }

    // If a whole column is not selected, do nothing.
    const { x1, y1, x2, y2 } = grid.selectedRange;
    if (y1 != 0 || y2 != section.height - 1) { return; }

    // If they pressed Alt+Left, and there is a service to the left of the
    // selected one....
    if (key == "ArrowLeft" && x1 > 0) {
      const action = x1 == x2 ? "Shift service left" : "Shift services left";

      section.edit(action, data => {
        // Temporarily store the service immediately left of the selection.
        const leftService = data.service(x1 - 1);

        // Move all selected columns (there may be multiple) one to the left
        // (x - 1) of where they were.
        for (const x of range(x1, x2 + 1)) {
          data.replaceService(data.service(x), x - 1);
        }

        // Place the originally left service on the right of the current
        // selection.
        data.replaceService(leftService, x2);
      });

      // Also move the selection to the left to "follow" the ones that moved.
      grid.select(x1 - 1, 0, x2 - 1, section.height - 1);
    }

    // If they pressed Alt+Right, and there is a service to the right of the
    // selected one....
    if (key == "ArrowRight" && x2 < section.width - 1) {
      const action = x1 == x2 ? "Shift service right" : "Shift services right";

      section.edit(action, data => {
        // Temporarily store the service immediately right of the selection.
        const rightService = data.service(x2 + 1);

        // Move all selected columns (there may be multiple) one to the right
        // (x + 1) of where they were.
        for (const x of range(x1, x2 + 1)) {
          data.replaceService(data.service(x), x + 1);
        }

        // Place the originally right service on the left of the current
        // selection.
        data.replaceService(rightService, x1);
      });

      // Also move the selection to the right to "follow" the ones that moved.
      grid.select(x1 + 1, 0, x2 + 1, section.height - 1);
    }
  }
}
