import { AppContext } from "../app-context";

export type KeyFilter = {
  char: string | null,
  key: string | null,
  ctrl: boolean | null,
  alt: boolean | null,
  shift: boolean | null
};

export function keyFilter(options: {
  char?: string,
  key?: string,
  ctrl?: boolean | "*",
  alt?: boolean | "*",
  shift?: boolean | "*"
}): KeyFilter {

  return {
    char: options.char ?? null,
    key: options.key ?? null,
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
