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
const STRAPI_URL = "http://localhost:1337";


export const STRAPI_API_URL = getEnv("NEXT_PUBLIC_STRAPI_API_URL", "http://localhost:1337/api");
export const STRAPI_TOKEN = getEnv("NEXT_PUBLIC_STRAPI_TOKEN", "");
export const STRAPI_BASE_URL = getEnv("NEXT_PUBLIC_STRAPI_URL", "http://localhost:1337");

// ========== TYPES STRAPI ==========

interface ElementDonneeStrapi<T> {
  id: number;
  attributes: T;
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

// ========== FETCH PRINCIPAL STRAPI ==========

async function fetchStrapi<T>(path: string, params?: Record<string, any>): Promise<StrapiResponse<T>> {
  const query = qs.stringify(params, { encodeValuesOnly: true, arrayFormat: "brackets" });
  const url = `${STRAPI_API_URL}${path}${query ? `?${query}` : ""}`;

  if (process.env.NODE_ENV === "development") {
    console.log("🔗 Fetching from Strapi:", url);
  }

  try {
    const res = await fetch(url, {
      headers: {
        ...(STRAPI_TOKEN && { Authorization: `Bearer ${STRAPI_TOKEN}` }),
        "Content-Type": "application/json",
      },
      next: { revalidate: 60 },
    });

    if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: "Erreur lors du parsing de l'erreur" }));
    console.error(`❌ Strapi API Error for ${path}:`, errorData);
    console.error("❌ URL appelée:", url); // <-- AJOUTE CETTE LIGNE
    throw new Error(`Erreur lors de la récupération des données Strapi: ${res.status} ${res.statusText}`);
  }


    const rawResponse: ReponseStrapi<ElementDonneeStrapi<T>[]> = await res.json();
    console.log("🔥 Réponse brute Strapi:", rawResponse);
    console.log("🔥 Donnée 0 brute:", rawResponse.data[0]);
    const objects = rawResponse.data.map((item) => {
      if ("attributes" in item) {
        return { id: item.id, ...item.attributes } as T; // Strapi v4
      }
      return item as T; // Strapi v5
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
    const query = {
      filters: params?.filters,
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
    // /produits/:id retourne directement l'objet produit, donc on renvoie le premier
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
        publishedAt: { $notNull: true } 
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

export async function getCategorieBySlug(slug: string): Promise<Categorie | null> {
  console.log(`🔍 Recherche catégorie par slug: ${slug}`);
  
  try {
    const baseQuery = {
      filters: { slug: { $eq: slug }, actif: { $eq: true } },
      pagination: { pageSize: 1 },
    };

    // 1️⃣ Requête de base sans populate
    console.log('📝 Test 1: Requête de base sans populate');
    const baseResult = await fetchStrapi<Categorie>("/categories", baseQuery);
    if (!baseResult.objects || baseResult.objects.length === 0) {
      console.log('⚠️ Aucune catégorie trouvée avec ce slug');
      return null;
    }
    console.log('✅ Catégorie de base trouvée');

    // 2️⃣ Requête avec populate simplifié
    console.log('📝 Test 2: Populate simplifié');
    const simplePopulateQuery = {
      ...baseQuery,
      populate: { image: true, categorie_parente: true },
    };
    const simpleResult = await fetchStrapi<Categorie>("/categories", simplePopulateQuery);

    // 3️⃣ Populate complet (produits + sous-catégories)
    console.log('📝 Test 3: Populate complet');
    const fullQuery = {
      ...baseQuery,
      populate: {
        image: true,
        categorie_parente: true,
        sous_categories: {
          filters: { actif: { $eq: true } },
          sort: ["ordre_affichage:asc"],
        },
        produits: {
          filters: { statut: { $eq: "actif" } },
          populate: { images: true, image_principale: true },
          sort: ["ordre_affichage:asc"],
          pagination: { pageSize: 20 },
        },
      },
    };

    const { objects } = await fetchStrapi<Categorie>("/categories", fullQuery);
    console.log('✅ Données complètes récupérées');
    return objects?.[0] ?? null;

  } catch (error) {
    console.error("❌ Erreur getCategorieBySlug:", error);

    // Fallback ultra-simple
    try {
      console.log('🔄 Tentative de fallback ultra-simple...');
      const fallbackQuery = { filters: { slug: { $eq: slug } }, pagination: { pageSize: 1 } };
      const { objects } = await fetchStrapi<Categorie>("/categories", fallbackQuery);
      return objects?.[0] ?? null;
    } catch (fallbackError) {
      console.error('❌ Même le fallback a échoué:', fallbackError);
      return null;
    }
  }
}


export async function getCategoriesParentes(): Promise<Categorie[]> {
  try {
    const query = {
      filters: { 
        actif: { $eq: "actif" }, 
        categorie_parente: { $null: true } 
      },
      populate: { 
        image: true, 
        sous_categories: { 
          filters: { actif: { $eq: "actif" } }, 
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
  const now = new Date().toISOString();
  const query = {
    filters: {
      actif: { $eq: true },
      $or: [{ date_debut: { $null: true } }, { date_debut: { $lte: now } }],
      $and: [{ $or: [{ date_fin: { $null: true } }, { date_fin: { $gte: now } }] }],
      ...(position && { position: { $eq: position } }),
    },
    populate: ["image"],
    sort: ["ordre_affichage:asc"],
    pagination: { pageSize: 10 },
  };
  const { objects } = await fetchStrapi<Banniere>("/bannieres", query);
  return objects;
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

// Version debug pour diagnostiquer le problème

export async function getPageBySlug(slug: string): Promise<Page | null> {
  console.log(`🔍 Recherche page par slug: ${slug}`);
  
  try {
    // ÉTAPE 1: Vérifier toutes les pages disponibles
    console.log('📋 ÉTAPE 1: Récupération de toutes les pages disponibles');
    const allPagesQuery = {
      pagination: { pageSize: 100 }
    };
    
    const allPagesResult = await fetchStrapi<Page>("/pages", allPagesQuery);
    console.log('📊 Nombre total de pages:', allPagesResult.objects?.length ?? 0);
    
    if (allPagesResult.objects && allPagesResult.objects.length > 0) {
      console.log('📄 Pages trouvées:');
      allPagesResult.objects.forEach((page, index) => {
        console.log(`  ${index + 1}. ID: ${page.id}, Titre: ${page.titre}, Slug: ${page.slug || 'PAS DE SLUG'}`);
      });
    }
    
    // ÉTAPE 2: Vérifier les pages publiées
    console.log('📋 ÉTAPE 2: Pages publiées seulement');
    const publishedQuery = {
      filters: { 
        publishedAt: { $notNull: true }
      },
      pagination: { pageSize: 100 }
    };
    
    const publishedResult = await fetchStrapi<Page>("/pages", publishedQuery);
    console.log('📊 Pages publiées:', publishedResult.objects?.length ?? 0);
    
    if (publishedResult.objects && publishedResult.objects.length > 0) {
      console.log('📄 Pages publiées:');
      publishedResult.objects.forEach((page, index) => {
        console.log(`  ${index + 1}. Slug: ${page.slug || 'PAS DE SLUG'}, Titre: ${page.titre}`);
      });
    }
    
    // ÉTAPE 3: Recherche exacte du slug
    console.log(`📋 ÉTAPE 3: Recherche exacte du slug: "${slug}"`);
    const exactQuery = {
      filters: { 
        slug: { $eq: slug }
      },
      pagination: { pageSize: 1 }
    };
    
    const exactResult = await fetchStrapi<Page>("/pages", exactQuery);
    console.log('📊 Pages avec ce slug exact:', exactResult.objects?.length ?? 0);
    
    // ÉTAPE 4: Recherche partielle du slug
    console.log(`📋 ÉTAPE 4: Recherche partielle du slug contenant: "${slug}"`);
    const partialQuery = {
      filters: { 
        slug: { $containsi: slug }
      },
      pagination: { pageSize: 10 }
    };
    
    const partialResult = await fetchStrapi<Page>("/pages", partialQuery);
    console.log('📊 Pages avec slug similaire:', partialResult.objects?.length ?? 0);
    
    if (partialResult.objects && partialResult.objects.length > 0) {
      console.log('📄 Pages avec slug similaire:');
      partialResult.objects.forEach((page, index) => {
        console.log(`  ${index + 1}. Slug: "${page.slug}", Titre: ${page.titre}`);
      });
    }
    
    // ÉTAPE 5: Si rien n'est trouvé, essayer sans filtres
    if (!exactResult.objects || exactResult.objects.length === 0) {
      console.log('⚠️ Aucune page trouvée avec ce slug. Vérifications:');
      console.log('1. La page existe-t-elle dans Strapi ?');
      console.log('2. Est-elle publiée (publishedAt non null) ?');
      console.log('3. Le slug est-il exactement:', `"${slug}"`);
      console.log('4. Les permissions permettent-elles l\'accès ?');
      
      return null;
    }
    
    // Si trouvé, essayer avec populate
    console.log('✅ Page trouvée, tentative avec populate...');
    const finalQuery = {
      filters: { 
        slug: { $eq: slug },
        publishedAt: { $notNull: true }
      },
      populate: "*",
      pagination: { pageSize: 1 }
    };
    
    const finalResult = await fetchStrapi<Page>("/pages", finalQuery);
    const page = finalResult.objects?.[0] ?? null;
    
    if (page) {
      console.log(`✅ Page complète récupérée: ${page.titre}`);
    }
    
    return page;
    
  } catch (error) {
    console.error(`❌ Erreur getPageBySlug pour ${slug}:`, error);
    return null;
  }
}

// Fonction utilitaire pour lister toutes les pages (à des fins de debug)
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
      console.log('Vérifiez:');
      console.log('1. Que le Content Type "pages" existe');
      console.log('2. Que des pages ont été créées');
      console.log('3. Les permissions d\'accès');
    }
  } catch (error) {
    console.error('❌ Erreur lors du debug:', error);
  }
}
