"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/hooks/useCart";
import { useHydrated } from "@/lib/hooks/useHydrated";
import { Badge } from "@/components/ui/badge";
import { CartItem } from "./CartItem";
import { formatPrice } from "@/lib/utils/format";
import Link from "next/link";
import { useState } from "react";

export function CartDrawer() {
  const { items, getTotalItems, getTotalPrice } = useCart();
  const isHydrated = useHydrated();
  const [isOpen, setIsOpen] = useState(false);

  const totalItems = isHydrated ? getTotalItems() : 0;
  const totalPrice = isHydrated ? getTotalPrice() : 0;

  const handleClose = () => setIsOpen(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={`Panier, ${totalItems} article${totalItems > 1 ? "s" : ""}`}
        >
          <ShoppingCart className="h-6 w-6" />
          {isHydrated && totalItems > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 rounded-full bg-purple-600 text-white text-xs">
              {totalItems}
            </Badge>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent className="flex flex-col" side="right">
        <SheetHeader>
          <SheetTitle>Votre Panier ({totalItems})</SheetTitle>
        </SheetHeader>

        <div className="flex-grow overflow-y-auto py-4 space-y-4">
          {!isHydrated ? (
            <div className="text-center text-gray-500">
              <div className="animate-pulse">Chargement du panier...</div>
            </div>
          ) : items.length === 0 ? (
            <p className="text-center text-gray-500">Votre panier est vide.</p>
          ) : (
            items.map((item) => (
              <CartItem
                key={`${item.id}-${item.variant?.type ?? ""}-${item.variant?.value ?? ""}`}
                item={item}
              />
            ))
          )}
        </div>

        <SheetFooter className="flex flex-col gap-3 p-4 border-t">
          <div className="flex justify-between font-semibold text-lg">
            <span>Total :</span>
            <span>{formatPrice(totalPrice)}</span>
          </div>

          <Link href="/panier" legacyBehavior>
            <a>
              <Button 
                className="w-full bg-purple-600 hover:bg-purple-700" 
                onClick={handleClose}
                disabled={!isHydrated}
              >
                Voir le panier
              </Button>
            </a>
          </Link>

          <Link href="/commande" legacyBehavior>
            <a>
              <Button
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={handleClose}
                disabled={!isHydrated || items.length === 0}
              >
                Passer la commande
              </Button>
            </a>
          </Link>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}