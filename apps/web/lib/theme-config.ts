export type ThemeOption = {
  id: string;
  label: string;
  hint: string;
  swatches: Array<{
    label: string;
    color: string;
  }>;
};

export const themeOptions: ThemeOption[] = [
  {
    id: "light",
    label: "Light",
    hint: "Bright day mode",
    swatches: [
      { label: "Base", color: "#F4F7FB" },
      { label: "Text", color: "#1A1F2D" },
      { label: "Accent", color: "#1C82E6" },
      { label: "Accent", color: "#429EF7" },
    ],
  },
  {
    id: "dark",
    label: "Dark",
    hint: "Balanced night view",
    swatches: [
      { label: "Base", color: "#0A0E18" },
      { label: "Text", color: "#E5ECFF" },
      { label: "Accent", color: "#429EF7" },
      { label: "Accent", color: "#1A82E6" },
    ],
  },
  {
    id: "ultradark",
    label: "Ultradark",
    hint: "Neon cyan + lime",
    swatches: [
      { label: "Base", color: "#000000" },
      { label: "Text", color: "#E0E0E0" },
      { label: "Accent", color: "#00FFFF" },
      { label: "Accent", color: "#19FF14" },
    ],
  },
  {
    id: "emerald-trust",
    label: "Emerald Trust",
    hint: "#046307 · #D8C7A1",
    swatches: [
      { label: "Base", color: "#F9FBF7" },
      { label: "Text", color: "#2B2B2B" },
      { label: "Accent", color: "#046307" },
      { label: "Accent", color: "#D8C7A1" },
    ],
  },
  {
    id: "quantum-violet",
    label: "Quantum Violet",
    hint: "#7C3AED · #00BFA6",
    swatches: [
      { label: "Base", color: "#0E0E10" },
      { label: "Text", color: "#E5E5E5" },
      { label: "Accent", color: "#7C3AED" },
      { label: "Accent", color: "#00BFA6" },
    ],
  },
  {
    id: "copper-balance",
    label: "Copper Balance",
    hint: "#B87333 · #4E3B2C",
    swatches: [
      { label: "Base", color: "#FAF4EC" },
      { label: "Text", color: "#2D2D2D" },
      { label: "Accent", color: "#B87333" },
      { label: "Accent", color: "#4E3B2C" },
    ],
  },
  {
    id: "regal-portfolio",
    label: "Regal Portfolio",
    hint: "#2B0082 · #D4AF37",
    swatches: [
      { label: "Base", color: "#FDF9F3" },
      { label: "Text", color: "#1A1A1A" },
      { label: "Accent", color: "#2B0082" },
      { label: "Accent", color: "#D4AF37" },
    ],
  },
  {
    id: "carbon-edge",
    label: "Carbon Edge",
    hint: "#00FF7F · #3A3A3A",
    swatches: [
      { label: "Base", color: "#0A0A0A" },
      { label: "Text", color: "#FFFFFF" },
      { label: "Accent", color: "#00FF7F" },
      { label: "Accent", color: "#3A3A3A" },
    ],
  },
];
