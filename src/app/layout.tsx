import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AppBackdrop from "@/components/AppBackdrop";
import PreviewSession from "@/components/PreviewSession";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Onnie",
  description: "Leer nommers, kleure, klanke en sigwoorde.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="af"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-amber-50 text-stone-900">
        <AppBackdrop />
        <PreviewSession />
        {children}
      </body>
    </html>
  );
}
