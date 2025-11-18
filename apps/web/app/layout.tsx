import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "../lib/utils";
import { Header } from "../components/layout/header";
import { MobileNav } from "../components/layout/mobile-nav";
import { Sidebar } from "../components/layout/sidebar";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Investing101",
    template: "%s · Investing101",
  },
  description: "Investing101 · modern investor education and tools platform",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "h-screen overflow-hidden bg-surface-base text-text-primary antialiased",
          inter.className,
        )}
      >
        <Providers>
          <div className="relative flex h-screen flex-col overflow-hidden">
            <div className="pointer-events-none absolute inset-0 -z-10">
              <div className="absolute -top-32 right-10 h-64 w-64 rounded-full bg-gradient-to-br from-accent-secondary/30 via-accent-tertiary/40 to-transparent blur-3xl" />
              <div className="absolute -bottom-24 left-12 h-72 w-72 rounded-full bg-gradient-to-br from-accent-primary/25 via-accent-secondary/25 to-transparent blur-3xl" />
            </div>
            <Header />
            <div className="flex flex-1 overflow-hidden pt-[var(--header-height)]">
              <Sidebar />
              <div className="flex flex-1 flex-col overflow-hidden">
                <main className="relative flex-1 overflow-y-auto px-4 pb-24 pt-8 sm:px-6 lg:px-10 xl:px-16">
                  <div className="mx-auto flex w-full max-w-7xl flex-col gap-10">
                    {children}
                  </div>
                </main>
                <footer className="shrink-0 border-t border-outline/30 bg-surface-elevated/70 py-5 text-center text-sm text-text-muted">
                  &copy; {new Date().getFullYear()} Investing101. All rights reserved.
                </footer>
              </div>
            </div>
            <MobileNav />
          </div>
        </Providers>
      </body>
    </html>
  );
}
