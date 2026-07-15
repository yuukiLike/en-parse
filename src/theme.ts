import { createTheme, rem } from "@mantine/core";

export const theme = createTheme({
  primaryColor: "teal",
  defaultRadius: "md",
  fontFamily:
    "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
  headings: {
    fontFamily:
      "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
    fontWeight: "760",
    sizes: {
      h1: { fontSize: rem(44), lineHeight: "1" },
      h2: { fontSize: rem(18), lineHeight: "1.25" },
      h3: { fontSize: rem(15), lineHeight: "1.3" },
    },
  },
  colors: {
    phraseRed: [
      "#fff0ed",
      "#ffe0da",
      "#ffc0b6",
      "#fb9c8f",
      "#f17668",
      "#df5c51",
      "#c93d3d",
      "#a92f32",
      "#8d292d",
      "#76252a",
    ],
    phraseGreen: [
      "#eafaf0",
      "#d9f2e4",
      "#b7e5ca",
      "#90d8ad",
      "#6ccd94",
      "#4ebe80",
      "#17845a",
      "#126a49",
      "#0f553c",
      "#0b4531",
    ],
  },
});
