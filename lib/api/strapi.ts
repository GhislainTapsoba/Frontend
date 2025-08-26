import qs from "qs";
import {
  type Categorie,
  type Page,
  type Banniere,
  type VarianteProduit,
  type Section,
  type Media,
  type Produit,
} from "@/types/strapi";
import { getEnv } from "@/lib/env";

// ========== CONFIGURATION STRAPI ==========
export const STRAPI_API_URL = getEnv("NEXT_PUBLIC_STRAPI_API_URL", "http://localhost:1337/api");
export const STRAPI_TOKEN = getEnv("NEXT_PUBLIC_STRAPI_TOKEN", "");
export const STRAPI_BASE_URL = getEnv("NEXT_PUBLIC_STRAPI_URL", "http://localhost:1337");

// ========== TYPES STRAPI ==========
interface ElementDonneeStrapi<T> {
  id: number;
  documentId?: string; // Strapi v5
  attributes?: T; // Strapi v4
}

interface ReponseStrapi<T> {
  data: T;
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

interface StrapiResponse<T> {
  objects: T[];
  rawResponse: ReponseStrapi<ElementDonneeStrapi<T>[]>;
  json: string;
}

// ========== UTILITAIRES JSON ==========
export function toJSON<T>(data: T, indent = 2): string {
  try {
    return JSON.stringify(data, null, indent);
  } catch (error) {
    console.error("Erreur lors de la conversion en JSON:", error);
    throw new Error("Impossible de convertir les données en JSON");
  }
}

export function fromJSON<T>(jsonString: string): T {
  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.error("Erreur lors du parsing JSON:", error);
    throw new Error("Format JSON invalide");
  }
}

export function downloadAsJSON<T>(data: T, filename = "strapi-data.json"): void {
  if (typeof window === "undefined") return;

  try {
    const jsonString = toJSON(data);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();

    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Erreur lors du téléchargement:", error);
  }
}

// ========== FETCH PRINCIPAL STRAPI CORRIGÉ ==========
async function fetchStrapi<T>(path: string, params?: Record<string, any>): Promise<StrapiResponse<T>> {
  const query = qs.stringify(params, { 
    encodeValuesOnly: true, 
    arrayFormat: "brackets",
    indices: false // Important pour éviter les erreurs 400
  });
  const url = `${STRAPI_API_URL}${path}${query ? `?${query}` : ""}`;

  if (process.env.NODE_ENV === "development") {
    console.log("🔗 Fetching from Strapi:", url);
  }

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // N'ajouter l'Authorization que si le token existe
    if (STRAPI_TOKEN) {
      headers.Authorization = `Bearer ${STRAPI_TOKEN}`;
    }

    const res = await fetch(url, {
      headers,
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: "Erreur lors du parsing de l'erreur" }));
      console.error(`❌ Strapi API Error for ${path}:`, errorData);
      console.error("❌ URL appelée:", url);
      console.error("❌ Status:", res.status, res.statusText);
      throw new Error(`Erreur lors de la récupération des données Strapi: ${res.status} ${res.statusText}`);
    }

    const rawResponse: ReponseStrapi<ElementDonneeStrapi<T>[]> = await res.json();
    
    if (process.env.NODE_ENV === "development") {
      console.log("🔥 Réponse brute Strapi:", rawResponse);
      if (rawResponse.data && Array.isArray(rawResponse.data) && rawResponse.data.length > 0) {
        console.log("🔥 Donnée 0 brute:", rawResponse.data[0]);
      }
    }

    const objects = rawResponse.data.map((item) => {
      if (item && typeof item === 'object') {
        // Strapi v4 avec attributes
        if ("attributes" in item && item.attributes) {
          return { id: item.id, documentId: item.documentId, ...item.attributes } as T;
        }
        // Strapi v5 sans attributes
        return item as T;
      }
      return item as T;
    });

    const json = toJSON(rawResponse);
    return { objects, rawResponse, json };
  } catch (error) {
    console.error(`❌ Erreur fetch Strapi sur ${path}:`, error);
    throw error;
  }
}

// ========== FONCTIONS PRODUITS ==========
const defaultPopulate = {
  images: true,
  image_principale: true,
  categories: true,
  variantes: { populate: ["image"] },
};

const defaultPagination = { pageSize: 100 };

interface GetProduitsParams {
  filters?: Record<string, any>;
  sort?: string[];
  populate?: string | Record<string, any>;
  pagination?: { page?: number; pageSize?: number };
}

export async function getProduits(params?: GetProduitsParams): Promise<Produit[]> {
  try {
    // Toujours filtrer sur statut = "actif"
    const filters = { ...(params?.filters ?? {}), statut: { $eq: "actif" } };
    const query = {
      filters,
      sort: params?.sort,
      populate: params?.populate ?? defaultPopulate,
      pagination: params?.pagination ?? defaultPagination,
    };
    const { objects } = await fetchStrapi<Produit>("/produits", query);
    return objects ?? [];
  } catch (error) {
    console.error("Erreur getProduits:", error);
    return [];
  }
}

export async function getProduitBySlug(slug: string): Promise<Produit | null> {
  try {
    const query = {
      populate: defaultPopulate,
      filters: {
        slug: { $eq: slug },
        statut: { $in: ["actif", "bientot"] },
      },
      pagination: { pageSize: 1 },
    };
    const { objects } = await fetchStrapi<Produit>("/produits", query);
    return objects?.[0] ?? null;
  } catch (error) {
    console.error("Erreur getProduitBySlug:", error);
    return null;
  }
}

export async function getProduitById(id: number): Promise<Produit | null> {
  try {
    const query = { populate: defaultPopulate };
    const { objects } = await fetchStrapi<Produit>(`/produits/${id}`, query);
    return objects?.[0] ?? null;
  } catch (error) {
    console.error("Erreur getProduitById:", error);
    return null;
  }
}

export async function getProduitsEnVedette(): Promise<Produit[]> {
  try {
    const query = {
      populate: defaultPopulate,
      filters: { produit_en_vedette: { $eq: true }, statut: { $eq: "actif" } },
      sort: ["ordre_affichage:asc"],
      pagination: { pageSize: 12 },
    };
    const { objects } = await fetchStrapi<Produit>("/produits", query);
    return objects ?? [];
  } catch (error) {
    console.error("Erreur getProduitsEnVedette:", error);
    return [];
  }
}

export async function getNouveauxProduits(): Promise<Produit[]> {
  try {
    const query = {
      populate: defaultPopulate,
      filters: { nouveau_produit: { $eq: true }, statut: { $eq: "actif" } },
      sort: ["createdAt:desc"],
      pagination: { pageSize: 12 },
    };
    const { objects } = await fetchStrapi<Produit>("/produits", query);
    return objects ?? [];
  } catch (error) {
    console.error("Erreur getNouveauxProduits:", error);
    return [];
  }
}

export async function searchProduits(searchTerm: string): Promise<Produit[]> {
  try {
    const query = {
      populate: defaultPopulate,
      filters: {
        statut: { $eq: "actif" },
        $or: [
          { nom: { $containsi: searchTerm } },
          { description: { $containsi: searchTerm } },
          { description_courte: { $containsi: searchTerm } },
          { mots_cles: { $containsi: searchTerm } },
        ],
      },
      pagination: { pageSize: 50 },
    };
    const { objects } = await fetchStrapi<Produit>("/produits", query);
    return objects ?? [];
  } catch (error) {
    console.error("Erreur searchProduits:", error);
    return [];
  }
}

// ========== FONCTIONS CATÉGORIES CORRIGÉES ==========
export async function getCategories(): Promise<Categorie[]> {
  try {
    const query = {
      filters: { 
        publishedAt: { $notNull: true },
        actif: { $eq: true }
      },
      populate: { 
        image: true, 
        categorie_parente: true, 
        sous_categories: true 
      },
      sort: ["ordre_affichage:asc"],
      pagination: { pageSize: 100 }
    };
    const { objects } = await fetchStrapi<Categorie>("/categories", query);
    return objects ?? [];
  } catch (error) {
    console.error("Erreur getCategories:", error);
    return [];
  }
}

// ========== FONCTION getCategorieBySlug SIMPLIFIÉE ==========
export async function getCategorieBySlug(slug: string): Promise<Categorie | null> {
  console.log(`🔍 Recherche catégorie par slug: ${slug}`);
  
  try {
    // Étape 1: Récupérer la catégorie de base
    const categorieQuery = {
      filters: { 
        slug: { $eq: slug }
      },
      populate: {
        image: true,
        categorie_parente: true,
        sous_categories: {
          sort: ["ordre_affichage:asc"]
        }
      },
      pagination: { pageSize: 1 }
    };

    const { objects: categories } = await fetchStrapi<Categorie>("/categories", categorieQuery);
    
    if (!categories || categories.length === 0) {
      console.log('⚠️ Aucune catégorie trouvée avec ce slug');
      return null;
    }

    const categorie = categories[0];
    console.log(`✅ Catégorie trouvée: ${categorie.nom}`);

    return categorie;

  } catch (error) {
    console.error("❌ Erreur getCategorieBySlug:", error);
    
    // Fallback ultra-simple
    try {
      console.log('🔄 Tentative de fallback...');
      const fallbackQuery = { 
        filters: { slug: { $eq: slug } }, 
        pagination: { pageSize: 1 } 
      };
      const { objects } = await fetchStrapi<Categorie>("/categories", fallbackQuery);
      return objects?.[0] ?? null;
    } catch (fallbackError) {
      console.error('❌ Fallback échoué:', fallbackError);
      return null;
    }
  }
}

// ========== FONCTION POUR RÉCUPÉRER LES PRODUITS D'UNE CATÉGORIE ==========
export async function getProduitsParCategorie(categorieDocumentId: string): Promise<Produit[]> {
  try {
    const query = {
      filters: {
        categories: {
          documentId: { $eq: categorieDocumentId }
        },
        statut: { $eq: "actif" }
      },
      populate: {
        images: true,
        image_principale: true,
        categories: true
      },
      sort: ["ordre_affichage:asc"],
      pagination: { pageSize: 20 }
    };

    const { objects } = await fetchStrapi<Produit>("/produits", query);
    console.log(`📦 Produits trouvés pour la catégorie ${categorieDocumentId}:`, objects?.length || 0);
    return objects ?? [];

  } catch (error) {
    console.error(`❌ Erreur getProduitsParCategorie pour catégorie ${categorieDocumentId}:`, error);
    return [];
  }
}

export async function getCategoriesParentes(): Promise<Categorie[]> {
  try {
    const query = {
      filters: { 
        categorie_parente: { $null: true } 
      },
      populate: { 
        image: true, 
        sous_categories: { 
          sort: ["ordre_affichage:asc"] 
        } 
      },
      sort: ["ordre_affichage:asc"],
      pagination: { pageSize: 100 },
    };
    const { objects } = await fetchStrapi<Categorie>("/categories", query);
    return objects ?? [];
  } catch (error) {
    console.error("Erreur getCategoriesParentes:", error);
    return [];
  }
}

// ========== FONCTIONS BANNIÈRES ==========
export async function getBannieresActives(position?: string): Promise<Banniere[]> {
  try {
    const now = new Date().toISOString();
    const query = {
      filters: {
        $or: [{ date_debut: { $null: true } }, { date_debut: { $lte: now } }],
        $and: [{ $or: [{ date_fin: { $null: true } }, { date_fin: { $gte: now } }] }],
        ...(position && { position: { $eq: position } }),
      },
      populate: ["image"],
      sort: ["ordre_affichage:asc"],
      pagination: { pageSize: 10 },
    };
    const { objects } = await fetchStrapi<Banniere>("/bannieres", query);
    return objects ?? [];
  } catch (error) {
    console.error("Erreur getBannieresActives:", error);
    return [];
  }
}

export async function getBannieresAccueil(): Promise<Banniere[]> {
  return getBannieresActives("accueil-hero");
}

// ========== MEDIA URL ==========
export function getStrapiMediaUrl(url?: string): string {
  if (!url) return "";
  return url.startsWith("http") ? url : `${STRAPI_BASE_URL}${url}`;
}

export function formatMedia(media: Media): Media {
  return { ...media, url: getStrapiMediaUrl(media.url) };
}

// ========== UTILITAIRES LOCALSTORAGE ==========
export function saveToLocalStorage(key: string, data: unknown): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(key, toJSON(data));
  } catch (error) {
    console.error("Erreur de sauvegarde localStorage:", error);
  }
}

export function loadFromLocalStorage<T>(key: string): T | null {
  if (typeof window === "undefined") return null;

  try {
    const jsonString = localStorage.getItem(key);
    if (!jsonString) return null;
    return fromJSON<T>(jsonString);
  } catch (error) {
    console.error("Erreur de chargement localStorage:", error);
    return null;
  }
}

// ========== FONCTION PAGE SIMPLIFIÉE ==========
export async function getPageBySlug(slug: string): Promise<Page | null> {
  console.log(`🔍 Recherche page par slug: ${slug}`);
  
  try {
    const query = {
      filters: { 
        slug: { $eq: slug },
        publishedAt: { $notNull: true }
      },
      populate: "*",
      pagination: { pageSize: 1 }
    };
    
    const { objects } = await fetchStrapi<Page>("/pages", query);
    
    if (objects && objects.length > 0) {
      console.log(`✅ Page trouvée: ${objects[0].titre}`);
      return objects[0];
    }
    
    console.log(`⚠️ Aucune page trouvée avec le slug: ${slug}`);
    return null;
    
  } catch (error) {
    console.error(`❌ Erreur getPageBySlug pour ${slug}:`, error);
    return null;
  }
}

// Fonction utilitaire pour lister toutes les pages (debug)
export async function debugListAllPages(): Promise<void> {
  console.log('🔍 DEBUG: Liste complète des pages dans Strapi');
  
  try {
    const { objects } = await fetchStrapi<Page>("/pages", {
      pagination: { pageSize: 100 }
    });
    
    console.log(`📊 Total: ${objects?.length ?? 0} pages trouvées`);
    
    if (objects && objects.length > 0) {
      console.table(
        objects.map(page => ({
          ID: page.id,
          Titre: page.titre,
          Slug: page.slug || 'AUCUN SLUG',
          Publié: page.publishedAt ? '✅' : '❌'
        }))
      );
    } else {
      console.log('❌ Aucune page trouvée dans Strapi !');
    }
  } catch (error) {
    console.error('❌ Erreur lors du debug:', error);
  }
}