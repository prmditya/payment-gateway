"use client";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import "./globals.css";
import { SessionProvider } from "next-auth/react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn(geistSans.variable, "antialiased")}>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
