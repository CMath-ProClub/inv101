import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "../lib/utils";
import { ThemeToggle } from "../components/ui/theme-toggle";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Invest101",
    template: "%s · Invest101",
  },
  description: "Modern investor education and tools platform",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-slate-950 text-slate-100",
          inter.className,
        )}
      >
        <Providers>
          <div className="flex min-h-screen flex-col">
            <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur supports-[backdrop-filter]:backdrop-blur">
              <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
                <div className="space-y-1">
                  <p className="text-sm font-semibold uppercase tracking-[0.4em] text-brand-300">
                    Invest101
                  </p>
                  <h1 className="text-xl font-semibold text-white">
                    Investor Intelligence Platform
                  </h1>
                </div>
                <ThemeToggle />
              </div>
            </header>
            <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
              {children}
            </main>
            <footer className="border-t border-white/10 bg-slate-950/80 py-6 text-center text-sm text-slate-400">
              &copy; {new Date().getFullYear()} Invest101. All rights reserved.
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
