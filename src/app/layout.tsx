import type { Metadata } from "next";
import { Orbitron, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { I18nProvider } from "@/lib/i18n";

// Futuristic display font for headings
const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});

// Clean modern font for body text
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
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
        className={`${orbitron.variable} ${spaceGrotesk.variable} antialiased bg-deep-black text-foreground min-h-screen`}
      >
        {/* Feature E & J: Providers for theme and i18n */}
        <ThemeProvider>
          <I18nProvider>
            {/* Background effects */}
            <div className="fixed inset-0 bg-grid-pattern opacity-50 pointer-events-none" />
            <div className="fixed inset-0 bg-mesh-gradient pointer-events-none" />
            
            {/* Main content */}
            <div className="relative z-10">
              {children}
            </div>
            
            <Toaster />
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
