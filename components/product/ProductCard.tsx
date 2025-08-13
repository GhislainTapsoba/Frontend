// components/product/ProductCard.tsx - Version simplifiée
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/utils/format";
import type { Produit } from "@/types/strapi";

interface ProductCardProps {
  produit: Produit;
}

export function ProductCard({ produit }: ProductCardProps) {
  // Fonction pour générer l'URL de manière consistante
  const getImageUrl = () => {
    if (!produit.image_principale?.url) {
      return "/images/shopping.jpeg";
    }
    
    const url = produit.image_principale.url;
    
    // Si l'URL commence par "/uploads", c'est une URL Strapi
    if (url.startsWith("/uploads")) {
      // Toujours utiliser l'URL complète pour éviter les différences server/client
      return `${process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337"}${url}`;
    }
    
    // Si c'est déjà une URL complète
    if (url.startsWith("http")) {
      return url;
    }
    
    // Fallback
    return `${process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337"}/uploads/${url}`;
  };

  const imageUrl = getImageUrl();

  return (
    <Card className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
      <Link href={`/produits/${produit.slug}`} className="relative block h-48 w-full">
        <Image
          src={imageUrl}
          alt={produit.nom || "Produit sans nom"}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          onError={(e) => {
            console.error(`❌ Erreur chargement image pour ${produit.nom}:`, imageUrl);
            e.currentTarget.src = "/images/placeholder-product.jpg";
          }}
          // Ajout de cette propriété pour forcer le rendu côté client
          unoptimized={process.env.NODE_ENV === "development"}
        />
        
        {produit.nouveau_produit && (
          <Badge className="absolute top-2 left-2 bg-green-600 text-white">
            Nouveau
          </Badge>
        )}
        
        {produit.produit_en_vedette && (
          <Badge className="absolute top-2 right-2 bg-purple-600 text-white">
            Vedette
          </Badge>
        )}
      </Link>

      <CardContent className="flex flex-col flex-grow p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">
          {produit.nom}
        </h3>
        
        {produit.description_courte && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {produit.description_courte}
          </p>
        )}

        <div className="mt-auto">
          <div className="flex items-center justify-between mb-3">
            {produit.prix_promo && produit.prix_promo < produit.prix ? (
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-red-600">
                  {formatPrice(produit.prix_promo)}
                </span>
                <span className="text-gray-500 line-through text-sm">
                  {formatPrice(produit.prix)}
                </span>
              </div>
            ) : (
              <span className="font-bold text-lg">
                {formatPrice(produit.prix)}
              </span>
            )}
            
            {produit.statut === "bientot" && (
              <Badge variant="secondary">Bientôt</Badge>
            )}
          </div>

          <Button 
            className="w-full bg-purple-600 hover:bg-purple-700" 
            disabled={produit.statut !== "actif"}
          >
            {produit.statut === "actif" ? "Ajouter au panier" : "Indisponible"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}