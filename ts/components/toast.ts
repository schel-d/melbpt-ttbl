/**
 * Creates a little "toast" notification along the bottom of the editor, which
 * animates and deletes itself after 10 seconds.
 * @param message The message to display on the toast.
 */
export function createToast(message: string) {
  const toasts = document.getElementById("toasts") as HTMLDivElement;

  const toast = document.createElement("div");
  toast.className = "toast";
  const toastP = document.createElement("p");
  toastP.textContent = message;
  toast.append(toastP);

  toasts.append(toast);

  setTimeout(() => {
    toast.remove();
  }, 10000);

  document.querySelectorAll("#toasts .toast:not(:nth-last-child(-n + 5))")
    .forEach(x => x.remove());
}
