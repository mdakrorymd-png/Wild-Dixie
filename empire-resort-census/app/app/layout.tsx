import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Empire Resort — إحصاء الملاك",
  description: "نظام حيادي لمعرفة ملاك Empire Resort ومواقفهم — لا يهدف لصناعة رأي أو الضغط على أحد.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="min-h-screen font-sans">
        <Navbar />
        <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
