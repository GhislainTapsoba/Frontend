import { type Produit } from "./strapi";

/**
 * Représente un article dans le panier.
 */
export interface ArticlePanier {
  id: number;             // Identifiant unique du produit
  documentId?: string;    // UUID Strapi v5
  nom: string;            // Nom du produit
  prix: number;           // Prix unitaire de base du produit (sans ajustement de variante)
  quantite: number;       // Quantité sélectionnée pour cet article
  image?: string;         // URL de l’image principale du produit (optionnel)
  variant?: {             // Variante sélectionnée (optionnelle)
    type: string;         // Type de la variante (ex: "Couleur", "Taille")
    value: string;        // Valeur choisie pour cette variante (ex: "Rouge", "XL")
    price_adjustment?: number; // Ajustement de prix lié à la variante (optionnel)
  };
}
