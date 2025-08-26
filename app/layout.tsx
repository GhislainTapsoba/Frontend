import type { Metadata } from "next";
import { Inter } from 'next/font/google';
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Toaster } from "@/components/ui/toaster";
import { WhatsAppButton } from "@/components/common/WhatsAppButton";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_APP_NAME || "ECMS E-commerce",
  description: "Votre boutique en ligne pour des produits de qualité.",
  generator: 'v0.dev',
  // Tu peux ajouter plus de meta si besoin, par ex. viewport
  // viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <div
            className="min-h-screen bg-fixed bg-cover bg-center"
            style={{ backgroundImage: 'url("/images/Naruto.jpg")' }}
          >
            <Header />
            <main className="container mx-auto px-4 py-8 min-h-[calc(100vh-160px)]">
              {children}
            </main>
            <Footer />
            <WhatsAppButton />
            <Toaster />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
