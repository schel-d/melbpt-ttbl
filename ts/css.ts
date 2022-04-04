import $ from "jquery";

export const css = (() => {
  const light = $("body").hasClass("light");
  return {
    text: light ? "#000000d0" : "#ffffffd0",
    level1: light ? "#eef1f7" : "#17191c",
    accent: light ? "#00B3DA" : "#19D6FF",
    hoverHighlight: light
      ? "rgba(54, 69, 99, 0.1)"
      : "rgba(179, 196, 230, 0.08)",
  };
})();
