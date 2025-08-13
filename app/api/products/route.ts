import { getProduits } from "@/lib/api/strapi";
import { NextResponse } from "next/server";
import { type Produit } from "@/types/strapi";

interface FrontendProduit {
  id: number;
  nom: string;
  description: string;
  prix: number;
  slug: string;
  imageUrl: string | null;
  categorie: {
    id: number;
    nom: string;
    slug: string;
  } | null;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("categorie");
    const search = searchParams.get("search");

    // Construction des filtres Strapi
    const filters: Record<string, any> = {
      actif: { $eq: true },
    };

    if (category && category !== "all") {
      filters.categorie = {
        slug: { $eq: category },
      };
    }

    if (search) {
      // Recherche dans nom et description, sensible à la casse insensible (containsi)
      filters.$or = [
        { nom: { $containsi: search } },
        { description: { $containsi: search } },
      ];
    }

    // Appel à Strapi pour récupérer les produits avec relations peuplées
    const strapiProduits = await getProduits({
      filters,
      populate: {
        images: { fields: ["url"] },
        categorie: { fields: ["id", "nom", "slug"] },
      },
    });

    // Transformation en format frontend avec image complète (URL absolue)
    const produits: FrontendProduit[] = strapiProduits.map((produit) => ({
      id: produit.id,
      nom: produit.nom,
      description: produit.description,
      prix: produit.prix,
      slug: produit.slug,
      imageUrl:
        produit.images?.[0]?.url
          ? `${process.env.NEXT_PUBLIC_STRAPI_URL}${produit.images[0].url}`
          : null,
      categorie: produit.categories?.[0]
        ? {
            id: produit.categories[0].id,
            nom: produit.categories[0].nom,
            slug: produit.categories[0].slug,
          }
        : null,
    }));

    return NextResponse.json(produits, { status: 200 });
  } catch (error) {
    console.error("Erreur dans GET /api/products:", error);
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
