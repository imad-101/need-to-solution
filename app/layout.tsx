import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";
import { Geist, Geist_Mono, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import { PlatformProvider } from "@/lib/store";
import { loadClientState } from "@/lib/data/state";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AuthModal } from "@/components/auth/AuthModal";
import { Toaster } from "@/components/ui/Toaster";
import { Logo } from "@/components/ui/Logo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: {
    default: "NeedToSolution — Communities post problems. Students and organizations solve them.",
    template: "%s · NeedToSolution",
  },
  description:
    "A platform where communities post real problems for students and organizations to solve. Students form teams, organizations provide support, contributors earn verified project experience.",
  keywords: ["community problems", "student projects", "verified experience", "social impact", "NGO partnerships"],
  openGraph: {
    title: "NeedToSolution",
    description: "Instead of asking people to search for opportunities, the platform generates opportunities from problems that need solving.",
    type: "website",
  },
};

/** Reads the session cookie and the database, so it lives behind a Suspense boundary (Cache Components). */
async function AppShell({ children }: { children: ReactNode }) {
  const initial = await loadClientState();
  return (
    <PlatformProvider initial={initial}>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <AuthModal />
      <Toaster />
    </PlatformProvider>
  );
}

function ShellFallback() {
  return (
    <>
      <header className="sticky top-0 z-50 border-b border-line bg-paper/95">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <div className="h-8 w-28 animate-pulse rounded-md bg-canvas" />
        </div>
      </header>
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <div className="h-5 w-32 animate-pulse rounded bg-canvas" />
          <div className="mt-6 h-12 max-w-xl animate-pulse rounded bg-canvas" />
          <div className="mt-4 h-5 max-w-lg animate-pulse rounded bg-canvas" />
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-48 animate-pulse rounded-lg bg-canvas" />
            ))}
          </div>
        </div>
      </main>
    </>
  );
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${sourceSerif.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-paper text-ink">
        <Suspense fallback={<ShellFallback />}>
          <AppShell>{children}</AppShell>
        </Suspense>
      </body>
    </html>
  );
}
