"use client";

import { useCart } from "@/lib/hooks/useCart";
import { CartItem } from "@/components/cart/CartItem";
import { CartSummary } from "@/components/cart/CartSummary";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function CartPage() {
  const { items, getTotalItems } = useCart();
  const router = useRouter();

  useEffect(() => {
    // Redirection optionnelle si panier vide
    // if (getTotalItems() === 0) {
    //   router.push('/produits');
    // }
  }, [getTotalItems, router]);

  return (
    <div 
      className="min-h-screen bg-gray-900"
      style={{ 
        backgroundImage: 'url("/images/shop.jpg?height=auto&width=auto")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Overlay pour assombrir l'image de fond */}
      <div className="absolute inset-0 bg-gray-900/80"></div>
      
      <div className="relative container mx-auto px-4 py-8">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-8 text-center">
          Votre Panier
        </h1>

        {items.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gray-800/90 backdrop-blur-sm p-12 rounded-2xl shadow-2xl max-w-md mx-auto">
              <div className="mb-6">
                <svg 
                  className="w-20 h-20 text-gray-400 mx-auto mb-4" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={1.5} 
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4m.6 8L6 21H18M9 19.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM20.5 19.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" 
                  />
                </svg>
              </div>
              <p className="text-xl text-gray-200 mb-6">
                Votre panier est actuellement vide.
              </p>
              <Link href="/produits">
                <Button 
                  size="lg" 
                  className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 font-semibold transition-all duration-200 hover:shadow-lg hover:scale-105"
                >
                  Commencer vos achats
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Liste des articles */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-gray-800/90 backdrop-blur-sm p-6 rounded-2xl shadow-2xl">
                <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
                  <svg 
                    className="w-6 h-6 mr-3 text-purple-400" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" 
                    />
                  </svg>
                  Articles dans votre panier ({getTotalItems()})
                </h2>
                
                <div className="space-y-4">
                  {items.map((item) => (
                    <div 
                      key={`${item.id}-${item.variant?.type ?? "noVariant"}-${item.variant?.value ?? "noValue"}`}
                      className="bg-gray-700/50 p-4 rounded-xl border border-gray-600/50 hover:border-purple-400/50 transition-all duration-200"
                    >
                      <div className="text-white">
                        <CartItem item={item} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Récapitulatif et commande */}
            <div className="lg:col-span-1 space-y-6">
              <CartSummary />
              
              <div className="bg-gradient-to-br from-green-600/20 to-green-500/20 p-6 rounded-2xl border border-green-500/30 backdrop-blur-sm">
                <div className="text-center mb-4">
                  <svg 
                    className="w-12 h-12 text-green-400 mx-auto mb-2" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={1.5} 
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
                    />
                  </svg>
                  <p className="text-green-200 text-sm">Prêt à finaliser votre commande ?</p>
                </div>
                
                <Link href="/commande">
                  <Button
                    size="lg"
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 text-lg transition-all duration-200 hover:shadow-lg hover:shadow-green-500/25 hover:scale-105"
                  >
                    <svg 
                      className="w-5 h-5 mr-2" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M13 7l5 5-5 5M6 12h12" 
                      />
                    </svg>
                    Passer la commande
                  </Button>
                </Link>
              </div>

              {/* Section informations supplémentaires */}
              <div className="bg-gray-800/70 backdrop-blur-sm p-4 rounded-xl border border-gray-600/50">
                <h3 className="text-white font-semibold mb-3 flex items-center">
                  <svg 
                    className="w-4 h-4 mr-2 text-blue-400" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                    />
                  </svg>
                  Informations
                </h3>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• Livraison rapide disponible</li>
                  <li>• Paiement sécurisé</li>
                  <li>• Support client 7j/7</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}