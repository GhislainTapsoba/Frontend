// ========== TYPES DE BASE STRAPI ==========

export interface FormatImageStrapi {
  ext: string;
  url: string;
  hash: string;
  mime: string;
  name: string;
  path: string | null;
  size: number;
  width: number;
  height: number;
  provider_metadata: any;
}

export interface ImageStrapi {
  id: number;
  name: string;
  alternativeText: string | null;
  caption: string | null;
  width: number;
  height: number;
  formats: Partial<{
    thumbnail: FormatImageStrapi;
    small: FormatImageStrapi;
    medium: FormatImageStrapi;
    large: FormatImageStrapi;
  }>;
  hash: string;
  ext: string;
  mime: string;
  size: number;
  url: string;
  previewUrl: string | null;
  provider: string;
  provider_metadata: any;
  createdAt: string;
  updatedAt: string;
}

// Alias pour compatibilité
export type Media = ImageStrapi;

// ========== TYPES SECTIONS DYNAMIQUES ==========

export interface SectionTexte {
  __component: 'shared.section-texte';
  titre?: string;
  contenu: string;
  couleur_fond?: string;
  centrer_texte: boolean;
}

export interface SectionImage {
  __component: 'shared.section-image';
  titre?: string;
  description?: string;
  image: ImageStrapi;
  position_image: 'gauche' | 'droite' | 'centre';
  lien_url?: string;
  texte_alt?: string;
}

export interface SectionGalerie {
  __component: 'shared.section-galerie';
  titre?: string;
  images: ImageStrapi[];
  colonnes: '2' | '3' | '4';
  affichage: 'grille' | 'carrousel';
}

export interface SectionContact {
  __component: 'shared.section-contact';
  titre?: string;
  adresse?: string;
  telephone?: string;
  email?: string;
  whatsapp?: string;
  horaires?: string;
  afficher_carte: boolean;
}

export type Section = SectionTexte | SectionImage | SectionGalerie | SectionContact;

// ========== INTERFACES PRINCIPALES E-COMMERCE ==========

export interface Categorie {
  id: number;
  nom: string;
  slug: string;
  description?: string;
  image?: ImageStrapi;
  actif: boolean;
  ordre_affichage: number;
  meta_titre?: string;
  meta_description?: string;
  categorie_parente?: Categorie | null;
  sous_categories?: Categorie[];
  produits?: Produit[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface VarianteProduit {
  id: number;
  nom: string;
  valeur: string;
  type: 'couleur' | 'taille' | 'materiau' | 'autre';
  ajustement_prix: number;
  quantite_stock: number;
  suffixe_reference?: string;
  image?: ImageStrapi;
  produit?: Produit;
  actif: boolean;
  ordre_affichage: number;
}

export interface Produit {
  id: number;
  nom: string;
  slug: string;
  description: string;
  description_courte?: string;
  prix: number;
  prix_promo?: number;
  reference?: string;
  quantite_stock: number;
  gerer_stock: boolean;
  en_stock: boolean;
  statut: 'actif' | 'inactif' | 'rupture' | 'bientot';
  poids?: number;
  dimensions?: string;
  images: ImageStrapi[];
  image_principale: ImageStrapi;
  categories?: Categorie[];
  variantes?: VarianteProduit[];
  meta_titre?: string;
  meta_description?: string;
  produit_en_vedette: boolean;
  nouveau_produit: boolean;
  mots_cles?: string;
  informations_complementaires?: any;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface Page {
  id: number;
  titre: string;
  slug: string;
  contenu: string;
  meta_titre?: string;
  meta_description?: string;
  image_principale?: ImageStrapi;
  template: 'defaut' | 'page-complete' | 'contact' | 'a-propos';
  ordre_menu: number;
  afficher_menu: boolean;
  sections?: Section[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface Banniere {
  id: number;
  titre: string;
  description?: string;
  image: ImageStrapi;
  lien_url?: string;
  texte_bouton?: string;
  actif: boolean;
  date_debut?: string;
  date_fin?: string;
  ordre_affichage: number;
  position: 'accueil-hero' | 'accueil-milieu' | 'sidebar' | 'produits';
  couleur_fond?: string;
  couleur_texte?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

// ========== TYPES POUR LE PANIER ==========

export interface ArticlePanier {
  id: string; // Id unique dans le panier (ex: produit+variante)
  produitId: number;
  nom: string;
  prix: number;
  quantite: number;
  image?: string;
  variante?: {
    id: number;
    nom: string;
    valeur: string;
    ajustement_prix: number;
  };
  total: number; // prix * quantité + ajustement
}

export interface Panier {
  articles: ArticlePanier[];
  total: number;
  quantite_totale: number;
}

// ========== TYPES POUR LES COMMANDES ==========

export interface ZoneLivraison {
  id: number;
  nom: string;
  prix: number;
  delai: string;
  actif: boolean;
}

export interface AdresseLivraison {
  nom: string;
  telephone: string;
  adresse: string;
  ville: string;
  code_postal?: string;
  zone_livraison: number;
  instructions?: string;
}

export interface Commande {
  id: number;
  numero_commande: string;
  statut: 'en_attente' | 'confirmee' | 'preparation' | 'livree' | 'annulee';
  articles: ArticlePanier[];
  adresse_livraison: AdresseLivraison;
  sous_total: number;
  frais_livraison: number;
  total: number;
  notes?: string;
  date_commande: string;
  date_livraison_prevue?: string;
}

// ========== TYPES POUR LES FILTRES ==========

export interface FiltresProduits {
  categories?: number[];
  prix_min?: number;
  prix_max?: number;
  en_stock?: boolean;
  nouveaux?: boolean;
  en_vedette?: boolean;
  recherche?: string;
}

export interface OptionsTri {
  field: 'prix' | 'nom' | 'createdAt' | 'ordre_affichage';
  direction: 'asc' | 'desc';
}

// ========== TYPES POUR LES RÉPONSES API ==========

export interface ReponseAPI<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface ReponsePagination<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    pageCount: number;
    total: number;
  };
}

// ========== TYPES POUR LE CONTENU DYNAMIQUE ==========

export interface ConfigurationSite {
  nom_site: string;
  description: string;
  logo?: ImageStrapi;
  favicon?: ImageStrapi;
  couleur_primaire: string;
  couleur_secondaire: string;
  telephone?: string;
  email?: string;
  adresse?: string;
  whatsapp?: string;
  reseaux_sociaux?: Partial<{
    facebook: string;
    instagram: string;
    twitter: string;
  }>;
}

export interface Newsletter {
  email: string;
  nom?: string;
  actif: boolean;
  date_inscription: string;
}

// ========== TYPES UTILITAIRES ==========

export interface MetaDonnees {
  titre: string;
  description: string;
  image?: string;
  url?: string;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
  active?: boolean;
}

// ========== TYPES POUR LES WEBHOOKS/EVENTS ==========

export interface EvenementCommande {
  type: 'commande_creee' | 'commande_confirmee' | 'commande_livree';
  commande: Commande;
  timestamp: string;
}

export interface EvenementStock {
  type: 'stock_bas' | 'rupture_stock' | 'stock_reconstitue';
  produit: Produit;
  quantite_actuelle: number;
  seuil?: number;
  timestamp: string;
}
