import type { Metadata, Viewport } from "next";
import { Cairo, El_Messiri } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import { Navbar } from "@/components/Navbar";
import { AppMain } from "@/components/AppMain";
import { Footer } from "@/components/Footer";
import { PWA } from "@/components/PWA";
import { WhatsAppFab } from "@/components/WhatsAppFab";

const cairo = Cairo({ subsets: ["arabic", "latin"], variable: "--font-cairo" });
// Elegant display face for headings (the "qualco serif" feel, Arabic-first).
const messiri = El_Messiri({ subsets: ["arabic", "latin"], weight: ["500", "600", "700"], variable: "--font-display" });

export const metadata: Metadata = {
  title: "Wild Dixie Escapes — إدارة متكاملة لوحدتك الساحلية في العين السخنة",
  description:
    "وايلد ديكسي إسكيبس: إدارة فندقية كاملة لشاليهك في العين السخنة — تسعير، ضيوف، نظافة، تصاريح البوابة، وتحصيل عبر إنستاباي. وانت بتستلم كشف شهري واضح.",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#0B2E3C",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} ${messiri.variable}`}>
      <body className="font-sans antialiased">
        <AuthProvider>
          <Navbar />
          <AppMain>{children}</AppMain>
          <Footer />
          <WhatsAppFab />
          <PWA />
        </AuthProvider>
      </body>
    </html>
  );
}
