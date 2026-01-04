import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Bebas_Neue, Space_Grotesk } from "next/font/google";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import "./globals.css";

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
  title: "FIT GYM | Transform Your Body, Elevate Your Life",
  description: "Join Lagos' premier fitness destination. State-of-the-art equipment, world-class trainers, and a community that pushes you to achieve your best.",
  keywords: ["gym", "fitness", "Lagos", "Nigeria", "personal training", "workout", "health"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${bebasNeue.variable} ${spaceGrotesk.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
