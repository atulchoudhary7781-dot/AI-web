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
  title: "NEXUS AI - Next Generation AI Platform",
  description: "Pioneering the future of artificial intelligence. Building systems that understand, reason, and create at superhuman levels.",
  keywords: ["NEXUS AI", "AI", "Chatbot", "Machine Learning", "Neural Network", "Next.js"],
  authors: [{ name: "NEXUS AI Team" }],
  icons: {
    icon: "/logo.jpg",
  },
  openGraph: {
    title: "NEXUS AI - Future of AI",
    description: "Next-generation artificial intelligence platform",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NEXUS AI",
    description: "Next-generation AI platform",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
