import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "D·Minder — Vitamin D Sun Tracker",
  description: "A lightweight vitamin D sun tracker for the web.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
