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
  description: "Live AI Battle Arena powered by Odyssey-2 Pro World Model",
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
