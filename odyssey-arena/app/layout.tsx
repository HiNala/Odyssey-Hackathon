import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { GameProvider } from "@/context/GameContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { validateEnv } from "@/lib/env";
import "./globals.css";

if (typeof window === "undefined") {
  validateEnv();
}

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ),
  title: "Odyssey Arena",
  description:
    "Live AI Battle Arena — Two players, AI-generated worlds, real-time battle. Powered by Odyssey-2 Pro World Model & Google Gemini.",
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
  openGraph: {
    title: "Odyssey Arena",
    description:
      "Two players create characters and worlds with natural language, then battle in real-time AI-generated video.",
    images: [{ url: "/splash.png", width: 1024, height: 512 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Odyssey Arena",
    description:
      "Live AI Battle Simulation — powered by Odyssey-2 Pro & Google Gemini",
    images: ["/splash.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#09090b" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ErrorBoundary>
          <GameProvider>{children}</GameProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
