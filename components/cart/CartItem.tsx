"use client";

import { type ArticlePanier } from "@/types/cart";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MinusCircle, PlusCircle, Trash2 } from "lucide-react";
import { useCart } from "@/lib/hooks/useCart";
import { formatPrice } from "@/lib/utils/format";

interface CartItemProps {
  item: ArticlePanier;
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart();

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(item.id, item.variant);
    } else {
      updateQuantity(item.id, newQuantity, item.variant);
    }
  };

  const itemPrice = item.prix + (item.variant?.price_adjustment || 0);

  return (
    <div className="flex items-center gap-4 border-b pb-4 last:border-b-0 last:pb-0">
      <div className="relative w-20 h-20 flex-shrink-0">
        <Image
          src={item.image ?? "/images/online.jpg?height=80&width=80&query=product-thumbnail"}
          alt={item.nom}
          fill
          sizes="80px"
          className="object-cover rounded-md"
          priority={false}
        />
      </div>
      <div className="flex-grow min-w-0">
        <h4 className="font-medium text-gray-800 line-clamp-1">{item.nom}</h4>
        {item.variant && (
          <p className="text-sm text-gray-600 truncate">
            {item.variant.type}: {item.variant.value}
          </p>
        )}
        <p className="text-sm text-gray-700 font-semibold">{formatPrice(itemPrice)}</p>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => handleQuantityChange(item.quantite - 1)}
          aria-label="Diminuer la quantité"
          className="h-8 w-8"
        >
          <MinusCircle className="h-4 w-4" />
        </Button>
        <Input
          type="number"
          value={item.quantite}
          onChange={(e) => {
            const value = Number(e.target.value);
            if (!isNaN(value)) handleQuantityChange(value);
          }}
          className="w-16 text-center"
          min={1}
          aria-label="Quantité"
          inputMode="numeric"
          pattern="[0-9]*"
        />
        <Button
          variant="outline"
          size="icon"
          onClick={() => handleQuantityChange(item.quantite + 1)}
          aria-label="Augmenter la quantité"
          className="h-8 w-8"
        >
          <PlusCircle className="h-4 w-4" />
        </Button>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => removeItem(item.id, item.variant)}
        aria-label="Supprimer l'article"
        className="text-red-500 hover:text-red-600"
      >
        <Trash2 className="h-5 w-5" />
      </Button>
    </div>
  );
}
