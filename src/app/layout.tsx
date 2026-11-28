import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { I18nProvider } from "@/lib/i18n";
import AppFrame from "@/components/intro/AppFrame";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#ffffff",
  interactiveWidget: "resizes-content",
};

export const metadata: Metadata = {
  title: "NEXUS AI - Next Generation AI Platform",
  description:
    "Pioneering the future of artificial intelligence. Chat, create, and reason with NEXUS AI.",
  keywords: ["NEXUS AI", "AI", "Chatbot", "Machine Learning", "Next.js"],
  authors: [{ name: "NEXUS AI Team" }],
  icons: { icon: "/nexus-logo.png" },
  openGraph: {
    title: "NEXUS AI - Future of AI",
    description: "Next-generation artificial intelligence platform",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} antialiased min-h-screen bg-white text-foreground`}
      >
        <ThemeProvider>
          <I18nProvider>
            <AppFrame>
              {children}
              <Toaster />
            </AppFrame>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
