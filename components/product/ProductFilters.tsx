"use client";

import { type Categorie } from "@/types/strapi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductFiltersProps {
  categories: Categorie[];
  selectedCategorySlug: string; // "all" pour toutes catégories
  searchTerm: string;
}

export function ProductFilters({
  categories,
  selectedCategorySlug,
  searchTerm,
}: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentSearchTerm, setCurrentSearchTerm] = useState(searchTerm);

  // Synchroniser local search avec prop externe
  useEffect(() => {
    setCurrentSearchTerm(searchTerm);
  }, [searchTerm]);

  // Générer la query string en mettant à jour un paramètre (ou en le supprimant si valeur vide)
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams?.toString() || "");
      if (value && value !== "all") {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      return params.toString();
    },
    [searchParams]
  );

  // Changer la catégorie sélectionnée dans l'URL
  const handleCategoryChange = (value: string) => {
    router.push(`/produits?${createQueryString("categorie", value)}`);
  };

  // Soumettre la recherche en mettant à jour l'URL
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/produits?${createQueryString("search", currentSearchTerm)}`);
  };

  return (
    <Card className="p-4 sticky top-24 bg-white shadow-md">
      <CardHeader className="p-0 pb-4">
        <CardTitle className="text-xl font-semibold">Filtrer les produits</CardTitle>
      </CardHeader>
      <CardContent className="p-0 space-y-6">
        {/* Barre de recherche */}
        <form onSubmit={handleSearchSubmit} className="relative">
          <Label htmlFor="search" className="sr-only">
            Rechercher
          </Label>
          <Input
            id="search"
            type="search"
            placeholder="Rechercher un produit..."
            value={currentSearchTerm}
            onChange={(e) => setCurrentSearchTerm(e.target.value)}
            className="pr-10"
          />
          <Button
            type="submit"
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2"
            aria-label="Rechercher"
          >
            <Search className="h-5 w-5 text-gray-500" />
          </Button>
        </form>

        {/* Filtres par catégorie */}
        <div>
          <h3 className="mb-3 font-semibold text-lg">Catégories</h3>
          <RadioGroup
            onValueChange={handleCategoryChange}
            value={selectedCategorySlug || "all"}
            aria-label="Filtrer par catégorie"
          >
            <div className="flex items-center space-x-2 mb-2">
              <RadioGroupItem value="all" id="category-all" />
              <Label htmlFor="category-all">Toutes les catégories</Label>
            </div>

            {categories.map((categorie) => (
              <div key={categorie.id} className="flex items-center space-x-2 mb-2">
                <RadioGroupItem value={categorie.slug} id={`category-${categorie.slug}`} />
                <Label htmlFor={`category-${categorie.slug}`}>{categorie.nom}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </CardContent>
    </Card>
  );
}
