"use client";

import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/hooks/useCart";
import { Badge } from "@/components/ui/badge";

export function CartButton() {
  // Récupère le nombre total d'articles dans le panier depuis le store
  const totalItems = useCart((state) => state.getTotalItems());

  return (
    <Button variant="ghost" size="icon" className="relative" aria-label="Voir le panier">
      <ShoppingCart className="h-6 w-6" />
      {totalItems > 0 && (
        <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 rounded-full bg-purple-600 text-white text-xs">
          {totalItems}
        </Badge>
      )}
      <span className="sr-only">Panier avec {totalItems} article{totalItems > 1 ? "s" : ""}</span>
    </Button>
  );
}
