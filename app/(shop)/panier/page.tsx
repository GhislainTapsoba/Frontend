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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
        Votre Panier
      </h1>

      {items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600 mb-6">
            Votre panier est actuellement vide.
          </p>
          <Link href="/produits">
            <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
              Commencer vos achats
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6 bg-white p-6 rounded-lg shadow-md">
            {items.map((item) => (
              <CartItem
                key={`${item.id}-${item.variant?.type ?? "noVariant"}-${
                  item.variant?.value ?? "noValue"
                }`}
                item={item}
              />
            ))}
          </div>
          <div className="lg:col-span-1">
            <CartSummary />
            <div className="mt-6">
              <Link href="/commande">
                <Button
                  size="lg"
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  Passer la commande
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
