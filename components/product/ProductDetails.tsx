"use client";

import { type Produit, type VarianteProduit } from "@/types/strapi";
import { formatPrice } from "@/lib/utils/format";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/hooks/useCart";
import { useToast } from "@/components/ui/use-toast";
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { getEnv } from "@/lib/env";

interface ProductDetailsProps {
  produit: Produit;
}

export function ProductDetails({ produit }: ProductDetailsProps) {
  const { addItem } = useCart();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<VarianteProduit | null>(
    null
  );

  const hasVariantes = produit.variantes && produit.variantes.length > 0;

  // Si variantes, stock dépend de la variante sélectionnée, sinon stock produit
  const availableStock =
    selectedVariant?.quantite_stock !== undefined ? selectedVariant.quantite_stock : produit.quantite_stock;
  const isOutOfStock = availableStock <= 0;

  // On reset la sélection variante à null si variantes et produit change (utile si produit chargé dynamiquement)
  useEffect(() => {
    setSelectedVariant(null);
    setQuantity(1);
  }, [produit]);

  const handleAddToCart = () => {
    const imageUrl = produit.images?.[0]?.url
      ? `${getEnv("NEXT_PUBLIC_STRAPI_URL")}${produit.images[0].url}`
      : "/placeholder.svg?height=300&width=300";

    addItem({
      id: produit.id,
      nom: produit.nom,
      prix: produit.prix,
      quantite: quantity,
      image: imageUrl,
      variant: selectedVariant
        ? {
            type: selectedVariant.type,
            value: selectedVariant.valeur,
            price_adjustment: selectedVariant.ajustement_prix,
          }
        : undefined,
    });
    toast({
      title: "Produit ajouté au panier",
      description: `${quantity} x ${produit.nom} ${
        selectedVariant ? `(${selectedVariant.valeur})` : ""
      } a été ajouté à votre panier.`,
    });
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1 && value <= availableStock) {
      setQuantity(value);
    }
  };

  const handleVariantChange = (variantValue: string) => {
    const variant = produit.variantes?.find((v) => v.valeur === variantValue);
    setSelectedVariant(variant || null);
    setQuantity(1);
  };

  const currentPrice = produit.prix + (selectedVariant?.ajustement_prix || 0);

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold text-gray-900">{produit.nom}</h1>
      <p className="text-2xl font-bold text-purple-600">{formatPrice(currentPrice)}</p>

      <div
        className="text-gray-700 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: produit.description }}
      />

      <div className="flex items-center space-x-2 text-lg font-medium">
        {isOutOfStock ? (
          <span className="text-red-500">Rupture de stock</span>
        ) : (
          <span className="text-green-600">En stock ({availableStock})</span>
        )}
      </div>

      {hasVariantes && (
        <div className="space-y-2">
          <Label htmlFor="variant-select">
            {produit.variantes?.[0]?.type || "Option"}
          </Label>
          <Select
            onValueChange={handleVariantChange}
            value={selectedVariant?.valeur || ""}
          >
            <SelectTrigger id="variant-select" className="w-full md:w-1/2">
              <SelectValue
                placeholder={`Sélectionnez une ${
                  produit.variantes?.[0]?.type || "option"
                }`}
              />
            </SelectTrigger>
            <SelectContent>
              {produit.variantes?.map((variant, index) => (
                <SelectItem key={index} value={variant.valeur}>
                  {variant.valeur}{" "}
                  {variant.ajustement_prix
                    ? `(${formatPrice(variant.ajustement_prix)})`
                    : ""}
                  {variant.quantite_stock !== undefined && ` (Stock: ${variant.quantite_stock})`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="flex items-center space-x-4">
        <Label htmlFor="quantity">Quantité:</Label>
        <Input
          id="quantity"
          type="number"
          min={1}
          max={availableStock}
          value={quantity}
          onChange={handleQuantityChange}
          className="w-24"
        />
      </div>

      <Button
        onClick={handleAddToCart}
        className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 text-lg"
        disabled={
          isOutOfStock || (hasVariantes && !selectedVariant) || quantity > availableStock
        }
      >
        <ShoppingCart className="mr-2 h-5 w-5" />
        Ajouter au panier
      </Button>

      {isOutOfStock && (
        <p className="mt-2 text-sm text-red-500">
          Ce produit est actuellement en rupture de stock.
        </p>
      )}
      {hasVariantes && !selectedVariant && (
        <p className="mt-2 text-sm text-orange-500">
          Veuillez sélectionner une option.
        </p>
      )}
      {quantity > availableStock && (
        <p className="mt-2 text-sm text-red-500">
          La quantité demandée dépasse le stock disponible.
        </p>
      )}
    </div>
  );
}
