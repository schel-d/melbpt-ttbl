import { AppContext } from "../app-context";

/**
 * Represents a key of combination of keys that could trigger a command handler.
 */
export type KeyFilter = {
  char: string | null,
  key: string | null,
  ctrl: boolean | null,
  alt: boolean | null,
  shift: boolean | null
};

/**
 * Create a key filter. Having this function allows for slightly nicer syntax,
 * especially the user of "*" being much clearer than null to mean "either",
 * and null (or the absence of it being set) a nicer way of saying false.
 * @param options The properties of the key filter. Use of an object here allows
 * the javascript equivalent of named parameters when the function is called.
 */
export function keyFilter(options: {
  char?: string,
  key?: string,
  ctrl?: boolean | "*",
  alt?: boolean | "*",
  shift?: boolean | "*"
}): KeyFilter {
  // "*" wildcard means null (allow either option), and null means false (this
  // key must not be pressed).
  return {
    char: options.char ?? null,
    key: options.key ?? null,
    ctrl: options.ctrl == "*" ? null : (options.ctrl ?? false),
    alt: options.alt == "*" ? null : (options.alt ?? false),
    shift: options.shift == "*" ? null : (options.shift ?? false)
  };
}

/**
 * The base type of a command handler. Mainly responsible for obtaining a list
 * of key filters that trigger the command, and the handle function, which
 * should be overridden.
 */
export abstract class CommandHandler {
  /**
   * A list of key combinations that trigger this command.
   */
  acceptedFilters: KeyFilter[];

  constructor(acceptedFilters: KeyFilter[]) {
    this.acceptedFilters = acceptedFilters;
  }

  /**
   * The method to override. Perform the command here, with the full scope of
   * the {@link appContext} to modify.
   * @param char The string that would be typed if the key that was pressed was
   * pressed while editing a textbox, e.g. "a" for the A key.
   * @param key The string ID representing this key, e.g. "KeyA" for the A key.
   * @param ctrl Whether or not control/command/meta was pressed.
   * @param alt Whether or not alt/option was pressed.
   * @param shift Whether or not shift was pressed.
   * @param appContext Represents basically entire webapp's systems. This is the
   * object the command will modify.
   */
  abstract handle(char: string, key: string, ctrl: boolean, alt: boolean,
    shift: boolean, appContext: AppContext): void;
}
