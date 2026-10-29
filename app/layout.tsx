import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { PlatformProvider } from "@/lib/store";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AuthModal } from "@/components/auth/AuthModal";
import { Toaster } from "@/components/ui/Toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: {
    default: "NeedToSolution — Real problems, solved by the people ready to grow",
    template: "%s · NeedToSolution",
  },
  description:
    "A platform where communities post real problems for students and organizations to solve. Students form teams, organizations provide support, contributors earn verified project experience.",
  keywords: ["community problems", "student projects", "verified experience", "social impact", "NGO partnerships"],
  openGraph: {
    title: "NeedToSolution",
    description: "Instead of asking people to search for opportunities, we generate opportunities from problems that need solving.",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-ink text-white">
        <PlatformProvider>
          <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
            <div className="absolute -top-40 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-brand-600/25 blur-[140px]" />
            <div className="absolute top-[40%] -left-40 h-[420px] w-[420px] rounded-full bg-magenta-600/12 blur-[120px]" />
            <div className="absolute bottom-0 -right-40 h-[460px] w-[460px] rounded-full bg-brand-500/15 blur-[120px]" />
          </div>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <AuthModal />
          <Toaster />
        </PlatformProvider>
      </body>
    </html>
  );
}
