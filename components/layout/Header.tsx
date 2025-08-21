import Link from "next/link";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { MobileMenu } from "./MobileMenu";

export function Header() {
  const appName = process.env.NEXT_PUBLIC_APP_NAME || "ECMS";

  return (
    <header className="bg-white/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center space-x-2 text-gray-800 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-600 rounded"
          aria-label={`Accueil - ${appName}`}
        >
          {/* Logo */}
          <img
            src="/images/logo.png" // Chemin vers ton logo
            alt={`${appName} logo`}
            className="h-8 w-8 sm:h-10 sm:w-10 object-contain"
          />
          {/* Nom de l'application */}
          <span className="text-2xl font-bold">{appName}</span>
        </Link>

        <nav className="hidden md:flex space-x-6" aria-label="Menu principal">
          <Link
            href="/"
            className="text-gray-600 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-600 rounded"
          >
            Accueil
          </Link>
          <Link
            href="/produits"
            className="text-gray-600 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-600 rounded"
          >
            Produits
          </Link>
          <Link
            href="/a-propos"
            className="text-gray-600 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-600 rounded"
          >
            À propos
          </Link>
          <Link
            href="/contact"
            className="text-gray-600 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-600 rounded"
          >
            Contact
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          <CartDrawer />
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
