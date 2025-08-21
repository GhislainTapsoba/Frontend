import { notFound } from "next/navigation";
import { Suspense } from "react";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { ProductGrid } from "@/components/product/ProductGrid";
import { getCategorieBySlug } from "@/lib/api/strapi";
import { type Categorie, type Produit } from "@/types/strapi";

interface CategoryProductsPageProps {
  params: { slug: string };
}

export default async function CategoryProductsPage({ params }: CategoryProductsPageProps) {
  // Récupération de la catégorie avec populate complet
  const categorie: Categorie | null = await getCategorieBySlug(params.slug);

  if (!categorie) {
    notFound();
  }

  // Produits liés à la catégorie
  const produits: Produit[] = categorie.produits ?? [];

  // Ne garder que les produits actifs
  const produitsActifs = produits.filter(p => p.statut === "actif");

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
        Produits de la catégorie : {categorie.nom}
      </h1>

      <ErrorBoundary>
        <Suspense fallback={<LoadingSpinner />}>
          {produitsActifs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl text-gray-600">
                Aucun produit actif dans cette catégorie pour le moment.
              </p>
            </div>
          ) : (
            <ProductGrid produits={produitsActifs} />
          )}
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
