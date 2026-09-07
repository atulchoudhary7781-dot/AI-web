import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { I18nProvider } from "@/lib/i18n";

// Professional UI font
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "NEXUS AI - Next Generation AI Platform",
  description: "Pioneering the future of artificial intelligence. Building systems that understand, reason, and create at superhuman levels.",
  keywords: ["NEXUS AI", "AI", "Chatbot", "Machine Learning", "Neural Network", "Next.js"],
  authors: [{ name: "NEXUS AI Team" }],
  icons: {
    icon: "/nexus-logo.png",
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
        className={`${inter.variable} antialiased bg-[#0a0a0f] text-white min-h-screen`}
        style={{ background: '#0a0a0f' }}
      >
        {/* Providers for theme and i18n */}
        <ThemeProvider>
          <I18nProvider>
            {/* Main Content - Full Screen for Chat Interface */}
            {children}
            
            <Toaster />
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
