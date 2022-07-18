/**
 * Performs the same function as {@link document.getElementById}, but returns
 * the result cast to a {@link HTMLButtonElement}. Throws an error if an element
 * with that ID does not exist, or the element with that ID is the wrong type.
 * @param id The id of the element in the HTML DOM (excluding a `#`).
 */
export function getButton(id: string): HTMLButtonElement {
  const element = document.getElementById(id);
  if (element instanceof HTMLButtonElement) {
    return element;
  }
  throw new Error(`"#${id}" is not a HTMLButtonElement in the DOM.`);
}

/**
 * Performs the same function as {@link document.getElementById}, but returns
 * the result cast to a {@link HTMLDivElement}. Throws an error if an element
 * with that ID does not exist, or the element with that ID is the wrong type.
 * @param id The id of the element in the HTML DOM (excluding a `#`).
 */
export function getDiv(id: string): HTMLDivElement {
  const element = document.getElementById(id);
  if (element instanceof HTMLDivElement) {
    return element;
  }
  throw new Error(`"#${id}" is not a HTMLDivElement in the DOM.`);
}

/**
 * Performs the same function as {@link document.getElementById}, but returns
 * the result cast to a {@link HTMLSelectElement}. Throws an error if an element
 * with that ID does not exist, or the element with that ID is the wrong type.
 * @param id The id of the element in the HTML DOM (excluding a `#`).
 */
export function getSelect(id: string): HTMLSelectElement {
  const element = document.getElementById(id);
  if (element instanceof HTMLSelectElement) {
    return element;
  }
  throw new Error(`"#${id}" is not a HTMLSelectElement in the DOM.`);
}

/**
 * Performs the same function as {@link document.getElementById}, but returns
 * the result cast to a {@link HTMLInputElement}. Throws an error if an element
 * with that ID does not exist, or the element with that ID is the wrong type.
 * @param id The id of the element in the HTML DOM (excluding a `#`).
 */
export function getInput(id: string): HTMLInputElement {
  const element = document.getElementById(id);
  if (element instanceof HTMLInputElement) {
    return element;
  }
  throw new Error(`"#${id}" is not a HTMLInputElement in the DOM`);
}

/**
 * Performs the same function as {@link document.getElementById}, but returns
 * the result cast to a {@link HTMLParagraphElement}. Throws an error if an element
 * with that ID does not exist, or the element with that ID is the wrong type.
 * @param id The id of the element in the HTML DOM (excluding a `#`).
 */
export function getParagraph(id: string): HTMLParagraphElement {
  const element = document.getElementById(id);
  if (element instanceof HTMLParagraphElement) {
    return element;
  }
  throw new Error(`"#${id}" is not a HTMLParagraphElement in the DOM`);
}

/**
 * Performs the same function as {@link document.getElementById}, but returns
 * the result cast to a {@link HTMLCanvasElement}. Throws an error if an element
 * with that ID does not exist, or the element with that ID is the wrong type.
 * @param id The id of the element in the HTML DOM (excluding a `#`).
 */
export function getCanvas(id: string): HTMLCanvasElement {
  const element = document.getElementById(id);
  if (element instanceof HTMLCanvasElement) {
    return element;
  }
  throw new Error(`"#${id}" is not a HTMLCanvasElement in the DOM`);
}

/**
 * Performs the same function as {@link document.getElementById}, but throws an
 * error if an element with that ID does not exist.
 * @param id The id of the element in the HTML DOM (excluding a `#`).
 */
export function getHtmlOther(id: string): HTMLElement {
  const element = document.getElementById(id);
  if (element != null) {
    return element;
  }
  throw new Error(`"#${id}" is not in the DOM.`);
}
