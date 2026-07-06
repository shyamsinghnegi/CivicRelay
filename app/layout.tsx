import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { BottomNav } from "./components/BottomNav";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "CivicRelay",
  description: "See it. Report it. Fix it.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="flex h-screen flex-col min-w-0 font-sans overflow-hidden">
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
          <BottomNav />
        </body>
    </html>
  );
}
