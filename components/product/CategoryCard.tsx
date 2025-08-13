import { type Categorie } from "@/types/strapi";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { ArrowRight } from 'lucide-react';

interface CategoryCardProps {
  categorie: Categorie;
}

export function CategoryCard({ categorie }: CategoryCardProps) {
  return (
    <Link href={`/produits/categorie/${categorie.slug}`}>
      <Card className="group cursor-pointer hover:shadow-lg transition-shadow duration-300">
        <CardContent className="flex flex-col items-center justify-center text-center p-6">
          <h3 className="mb-2 text-xl font-semibold text-gray-800 group-hover:text-purple-600 transition-colors">
            {categorie.nom}
          </h3>
          <p className="mb-4 text-sm text-gray-600">
            {categorie.produits?.length ?? 0} produit{(categorie.produits?.length ?? 0) > 1 ? "s" : ""}
          </p>
          <ArrowRight className="h-5 w-5 text-gray-500 group-hover:text-purple-600 transition-colors" />
        </CardContent>
      </Card>
    </Link>
  );
}
