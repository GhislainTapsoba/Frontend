import { notFound } from "next/navigation";
import { Suspense } from "react";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { ProductGrid } from "@/components/product/ProductGrid";
import { getCategorieBySlug, getProduitsParCategorie } from "@/lib/api/strapi";
import { type Categorie, type Produit } from "@/types/strapi";

interface CategoryProductsPageProps {
  params: Promise<{ slug: string }>; // ✅ Correction pour Next.js 15+
}

export default async function CategoryProductsPage({ params }: CategoryProductsPageProps) {
  try {
    // ✅ Attendre les params avant utilisation
    const { slug } = await params;
    
    // Récupération de la catégorie (sans les produits pour éviter les erreurs 400)
    const categorie: Categorie | null = await getCategorieBySlug(slug);

    if (!categorie) {
      console.log(`❌ Catégorie non trouvée pour le slug: ${slug}`);
      notFound();
    }

  // ✅ Récupération séparée des produits pour éviter les populate complexes
  const produits: Produit[] = await getProduitsParCategorie(categorie.documentId || categorie.slug);

    // Ne garder que les produits actifs
    const produitsActifs = produits.filter(p => p.statut === "actif");

    console.log(`📦 Produits actifs trouvés: ${produitsActifs.length}`);

    return (
      <div className="container mx-auto px-4 py-8">
        {/* En-tête de la catégorie avec informations complètes */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4 text-center">
            {categorie.nom}
          </h1>
          
          {categorie.description && (
            <p className="text-lg text-gray-600 text-center mb-6 max-w-3xl mx-auto">
              {categorie.description}
            </p>
          )}

          {/* Image de la catégorie */}
          {categorie.image && (
            <div className="mb-8 flex justify-center">
              <img 
                src={`${process.env.NEXT_PUBLIC_STRAPI_URL}${categorie.image.url}`}
                alt={categorie.nom}
                className="max-w-md w-full h-48 object-cover rounded-lg shadow-md"
              />
            </div>
          )}

          {/* Compteur de produits */}
          <div className="text-center mb-6">
            <span className="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
              {produitsActifs.length} produit{produitsActifs.length !== 1 ? 's' : ''} disponible{produitsActifs.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Sous-catégories si disponibles */}
        {categorie.sous_categories && categorie.sous_categories.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Sous-catégories</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {categorie.sous_categories.map((sousCategorie: any) => (
                <div 
                  key={sousCategorie.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-all duration-300 cursor-pointer"
                >
                  <h3 className="font-semibold text-lg text-gray-800 mb-2">
                    {sousCategorie.nom}
                  </h3>
                  {sousCategorie.description && (
                    <p className="text-gray-600 text-sm">
                      {sousCategorie.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Grille de produits */}
        <ErrorBoundary>
          <Suspense fallback={<LoadingSpinner />}>
            {produitsActifs.length === 0 ? (
              <div className="text-center py-16">
                <div className="max-w-md mx-auto">
                  {/* Icône vide */}
                  <div className="mb-6">
                    <svg 
                      className="mx-auto h-16 w-16 text-gray-400" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={1.5} 
                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8l-8 8-4-4" 
                      />
                    </svg>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">
                    Aucun produit disponible
                  </h3>
                  <p className="text-gray-600">
                    Aucun produit n'est actuellement disponible dans la catégorie "{categorie.nom}".
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Revenez bientôt, de nouveaux produits pourraient être ajoutés !
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                  Nos produits
                </h2>
                <ProductGrid produits={produitsActifs} />
              </div>
            )}
          </Suspense>
        </ErrorBoundary>

        {/* Informations supplémentaires sur la catégorie */}
        {categorie.description && (
          <div className="mt-12 bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              À propos de {categorie.nom}
            </h3>
            <p className="text-gray-600 leading-relaxed">
              {categorie.description}
            </p>
          </div>
        )}
      </div>
    );

  } catch (error) {
    console.error('❌ Erreur lors du chargement de la catégorie:', error);
    
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <div className="mb-6">
              <svg 
                className="mx-auto h-16 w-16 text-red-400" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1.5} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
                />
              </svg>
            </div>
            
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              Erreur de chargement
            </h1>
            <p className="text-gray-600 mb-6">
              Une erreur est survenue lors du chargement de cette catégorie.
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }
}