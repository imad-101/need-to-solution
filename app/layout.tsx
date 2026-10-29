import type { Metadata } from "next";
import { Geist, Geist_Mono, Source_Serif_4 } from "next/font/google";
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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${sourceSerif.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-paper text-ink">
        <PlatformProvider>
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
