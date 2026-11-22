import type { Metadata, Viewport } from "next";
import { Orbitron, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { I18nProvider } from "@/lib/i18n";
import AppFrame from "@/components/intro/AppFrame";
import BlackHoleBackdrop from "@/components/theme/BlackHoleBackdrop";

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#000000",
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
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${orbitron.variable} ${spaceGrotesk.variable} antialiased min-h-screen bg-deep-black text-foreground`}
      >
        <ThemeProvider>
          <I18nProvider>
            <BlackHoleBackdrop />
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
