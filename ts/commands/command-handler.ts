import { AppContext } from "../main";

export type KeyFilter = {
  char: string, key: string, ctrl: boolean, alt: boolean, shift: boolean
};

export function keyFilter(options: {
  char?: string, key?: string, ctrl?: boolean | "*", alt?: boolean | "*",
  shift?: boolean | "*"
}): KeyFilter {

  return {
    char: options.char,
    key: options.key,
    ctrl: options.ctrl == "*" ? null : (options.ctrl ?? false),
    alt: options.alt == "*" ? null : (options.alt ?? false),
    shift: options.shift == "*" ? null : (options.shift ?? false)
  };
}

export abstract class CommandHandler {
  acceptedFilters: KeyFilter[];

  constructor(acceptedFilters: KeyFilter[]) {
    this.acceptedFilters = acceptedFilters;
  }

  abstract handle(char: string, key: string, ctrl: boolean, alt: boolean,
    shift: boolean, appContext: AppContext): void;
}
