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
          <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 relative">
            {/* Background image avec overlay lumineux */}
            <div 
              className="fixed inset-0 bg-cover bg-center bg-no-repeat opacity-10"
              style={{ backgroundImage: 'url("/images/shop.jpg")' }}
            />
            <div className="fixed inset-0 bg-white/40 backdrop-blur-[1px]" />
            
            {/* Gradient overlay pour plus de profondeur */}
            <div className="fixed inset-0 bg-gradient-to-b from-blue-50/80 via-transparent to-slate-100/60" />
            
            {/* Contenu principal */}
            <div className="relative z-10 min-h-screen flex flex-col">
              {/* Header avec background semi-transparent */}
              <div className="bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40 shadow-sm">
                <Header />
              </div>
              
              {/* Main content */}
              <main className="flex-1 container mx-auto px-4 py-8">
                <div className="min-h-[calc(100vh-200px)]">
                  {children}
                </div>
              </main>
              
              {/* Footer avec background semi-transparent */}
              <div className="bg-white/95 backdrop-blur-md border-t border-slate-200/80 mt-auto shadow-lg">
                <Footer />
              </div>
            </div>
            
            {/* Éléments flottants */}
            <WhatsAppButton />
            <Toaster />
            
            {/* Effets de particules colorés et lumineux */}
            <div className="fixed inset-0 pointer-events-none z-5">
              <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-gradient-to-r from-purple-300 to-pink-300 rounded-full animate-pulse opacity-60"></div>
              <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-gradient-to-r from-blue-300 to-cyan-300 rounded-full animate-ping animation-delay-1000 opacity-50"></div>
              <div className="absolute bottom-1/4 left-1/3 w-2.5 h-2.5 bg-gradient-to-r from-green-300 to-emerald-300 rounded-full animate-pulse animation-delay-2000 opacity-40"></div>
              <div className="absolute top-2/3 right-1/4 w-2 h-2 bg-gradient-to-r from-yellow-300 to-orange-300 rounded-full animate-ping animation-delay-3000 opacity-50"></div>
              <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-gradient-to-r from-indigo-300 to-purple-300 rounded-full animate-pulse animation-delay-4000 opacity-30"></div>
            </div>
            
            {/* Effet de lumière douce en arrière-plan */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
              <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-blue-200/20 to-purple-200/20 rounded-full blur-3xl"></div>
              <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-r from-pink-200/20 to-yellow-200/20 rounded-full blur-3xl"></div>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}