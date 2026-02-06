import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { GameProvider } from "@/context/GameContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
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
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <GameProvider>{children}</GameProvider>
      </body>
    </html>
  );
}
