import { getProduits, getCategories } from "@/lib/api/strapi";
import { ProductGrid } from "@/components/product/ProductGrid";
import { CategoryCard } from "@/components/product/CategoryCard";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { type Categorie, type Produit } from "@/types/strapi";

export default async function HomePage() {
  const appName = process.env.NEXT_PUBLIC_APP_NAME || "ECMS";

  // Charge toutes les données côté serveur avec fallback
  let produits: Produit[] = [];
  let categories: Categorie[] = [];

  try {
    [produits, categories] = await Promise.all([getProduits(), getCategories()]);
  } catch (error) {
    console.error("❌ Erreur lors du chargement des données HomePage:", error);
  }

  // Sélectionne les 8 premiers produits
  const produitsEnVedette = produits?.slice(0, 8) ?? [];

  return (
    <div className="space-y-16 px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-purple-600 to-pink-600 text-white py-24 px-6 rounded-lg shadow-lg overflow-hidden">
        <div
          className="absolute inset-0 opacity-20 bg-cover bg-center"
          style={{ backgroundImage: 'url("/background.jpg?height=800&width=1200")' }}
          aria-hidden="true"
        />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl font-extrabold mb-4 leading-tight">
            Bienvenue chez {appName}
          </h1>
          <p className="text-xl sm:text-2xl mb-8 opacity-90">
            Découvrez notre sélection de produits de qualité, livrés directement chez vous.
          </p>
          <Link href="/produits">
            <Button
              size="lg"
              className="bg-white text-purple-600 hover:bg-gray-100 transition-colors duration-300 shadow-md"
            >
              Explorer les produits
            </Button>
          </Link>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-10">Nos Catégories</h2>
        {categories?.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((categorie) => (
              <CategoryCard key={categorie.id} categorie={categorie} />
            ))}
          </div>
        ) : (
          <p className="text-gray-600">Aucune catégorie disponible pour le moment.</p>
        )}
      </section>

      {/* Featured Products */}
      <section className="text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-10">Produits Populaires</h2>
        {produitsEnVedette?.length > 0 ? (
          <ProductGrid produits={produitsEnVedette} />
        ) : (
          <p className="text-gray-600">Aucun produit disponible pour le moment.</p>
        )}
        <div className="mt-10">
          <Link href="/produits">
            <Button
              variant="outline"
              className="text-gray-700 border-gray-300 hover:bg-gray-100 transition-colors duration-300"
            >
              Voir tous les produits
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
