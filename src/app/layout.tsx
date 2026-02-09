import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Bebas_Neue, Space_Grotesk } from "next/font/google";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import "./globals.css";
import AppProviders from "@/providers/app-providers";

// Prevent Font Awesome from adding its CSS since we did it manually above
config.autoAddCss = false;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const bebasNeue = Bebas_Neue({
  weight: "400",
  variable: "--font-bebas-neue",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GymFlow Pro | Run Your Gym Like a Pro",
  description: "Complete gym management platform for memberships, payments, class scheduling, and analytics. Beautiful branded websites included. Everything you need to grow your fitness business.",
  keywords: ["gym management", "fitness software", "gym software", "membership management", "class scheduling", "gym analytics", "SaaS"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} ${bebasNeue.variable} ${spaceGrotesk.variable} antialiased`}
      >
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
