import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Atul | Full Stack Developer & AI Enthusiast",
  description: "Portfolio of Atul - A passionate Full Stack Developer and AI enthusiast building intelligent digital experiences with modern web technologies.",
  keywords: ["Atul", "Full Stack Developer", "AI Developer", "React", "Next.js", "TypeScript", "Portfolio"],
  authors: [{ name: "Atul" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Atul | Full Stack Developer & AI Enthusiast",
    description: "Portfolio of Atul - Building intelligent digital experiences",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Atul | Portfolio",
    description: "Full Stack Developer & AI Enthusiast",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark scroll-smooth">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
