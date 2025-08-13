import { type Produit } from "@/types/strapi";
import { ProductCard } from "./ProductCard";

interface ProductGridProps {
  produits: Produit[];
}

export function ProductGrid({ produits }: ProductGridProps) {
  if (!produits?.length) {
    return (
      <p className="text-center text-gray-600 py-12">
        Aucun produit trouvé.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {produits.map((produit) => (
        <ProductCard key={produit.id} produit={produit} />
      ))}
    </div>
  );
}
