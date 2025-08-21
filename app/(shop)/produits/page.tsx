import { getProduits, getCategories } from "@/lib/api/strapi";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductFilters } from "@/components/product/ProductFilters";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { type Produit, type Categorie } from "@/types/strapi";

interface ProductsPageProps {
  searchParams: {
    categorie?: string;
    search?: string;
  };
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const selectedCategorySlug = params.categorie ?? "all";
  const searchTerm = params.search ?? "";

  // 🔹 Récupération des catégories (côté serveur)
  const categories: Categorie[] = await getCategories();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
        Nos Produits
      </h1>

      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 flex-shrink-0">
          <ProductFilters
            categories={categories}
            selectedCategorySlug={selectedCategorySlug}
            searchTerm={searchTerm}
          />
        </aside>

        <main className="flex-grow">
          <ErrorBoundary>
            <FilteredProductList
              selectedCategorySlug={selectedCategorySlug}
              searchTerm={searchTerm}
            />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}

interface FilteredProductListProps {
  selectedCategorySlug: string;
  searchTerm: string;
}

async function FilteredProductList({ selectedCategorySlug, searchTerm }: FilteredProductListProps) {
  // 🔹 Filtrage Strapi v5 côté serveur
  const filters: Record<string, any> = {
    actif: { $eq: "actif" },
  };

  if (selectedCategorySlug !== "all") {
    filters.categories = { slug: { $eq: selectedCategorySlug } };
  }

  if (searchTerm) {
    filters.$or = [
      { nom: { $containsi: searchTerm } },
      { description: { $containsi: searchTerm } },
      { description_courte: { $containsi: searchTerm } },
      { mots_cles: { $containsi: searchTerm } },
    ];
  }

  let produits: Produit[] = [];
  try {
    produits = await getProduits({ filters });
  } catch (err) {
    console.error("Erreur getProduits:", err);
    return (
      <div className="text-center py-12">
        <p className="text-xl text-red-600">
          Une erreur est survenue lors du chargement des produits.
        </p>
      </div>
    );
  }

  if (produits.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-xl text-gray-600">
          Aucun produit ne correspond à votre recherche.
        </p>
      </div>
    );
  }

  return <ProductGrid produits={produits} />;
}
