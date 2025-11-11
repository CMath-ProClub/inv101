"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";

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

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "rgb(var(--accent-primary))",
        },
      }}
    >
      <ThemeProvider
        attribute="data-theme"
        defaultTheme="dark"
        enableSystem={false}
        themes={themes}
      >
        {children}
      </ThemeProvider>
    </ClerkProvider>
  );
}
