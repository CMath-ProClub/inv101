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
          "min-h-screen bg-surface-base text-text-primary antialiased",
          inter.className,
        )}
      >
        <Providers>
          <div className="relative min-h-screen bg-surface-base">
            <Header />
            <div className="flex min-h-screen pt-[var(--header-height)]">
              <Sidebar />
              <div className="flex min-h-[calc(100vh-var(--header-height))] flex-1 flex-col">
                <main className="relative flex-1 px-4 pb-32 pt-8 sm:px-6 lg:px-10 xl:px-16">
                  {children}
                </main>
                <footer className="border-t border-outline/30 bg-surface-elevated/80 py-6 text-center text-sm text-text-muted">
                  &copy; {new Date().getFullYear()} Invest101. All rights reserved.
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
