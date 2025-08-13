import { getProduitBySlug } from "@/lib/api/strapi";
import { getEnv } from "@/lib/env";
import { notFound } from "next/navigation";
import { ProductDetails } from "@/components/product/ProductDetails";
import { ProductGallery } from "@/components/product/ProductGallery";
import { Suspense } from "react";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";

interface ProductDetailPageProps {
  params: {
    slug: string;
  };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const produit = await getProduitBySlug(params.slug);

  if (!produit || produit.statut !== 'actif') {
    notFound();
  }

  // Récupère les URLs complètes des images du produit (si elles existent)
  const imageUrls = produit.images?.map(
    (img: any) => `${getEnv("NEXT_PUBLIC_STRAPI_URL")}${img.url}`
  ) ?? [];

  return (
    <div className="container mx-auto px-4 py-8">
      <ErrorBoundary>
        <Suspense fallback={<LoadingSpinner />}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-white p-6 rounded-lg shadow-md">
            <div>
              <ProductGallery images={imageUrls} />
            </div>
            <div>
              <ProductDetails produit={produit} />
            </div>
          </div>
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
