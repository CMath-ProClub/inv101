"use client";

import { ThemeProvider } from "next-themes";

const themes = [
  "light",
  "dark",
  "ultradark",
  "emerald-trust",
  "quantum-violet",
  "copper-balance",
  "regal-portfolio",
  "carbon-edge",
];

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="data-theme"
      defaultTheme="dark"
      enableSystem={false}
      themes={themes}
    >
      {children}
    </ThemeProvider>
  );
}
