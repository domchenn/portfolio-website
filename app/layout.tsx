import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { basePath } from "@/lib/basePath";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
});

export const metadata: Metadata = {
  title: "Dominic Chen",
  description:
    "CS + AI at Boston College.",
  icons: {
    icon: [
      { url: `${basePath}/dc-logo-favicon.ico` },
      { url: `${basePath}/dc-logo-favicon.png`, type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} antialiased`}>
      <body>{children}</body>
    </html>
  );
}
