// types/laravel.ts

export interface ZoneLivraison {
  id: number;
  name: string;               // nom affiché
  delivery_fee: number;       // frais de livraison
  delivery_time_min?: number;
  delivery_time_max?: number;
  zone_name?: string;
  created_at?: string;
  updated_at?: string;
}

export type StatutCommande =
  | 'nouvelle'
  | 'en cours de livraison'
  | 'livree'
  | 'annulee'
  | 'payee';

export interface LigneCommandeLaravel {
  product_id: number;
  quantite: number;
  prixUnitaire: number;
  nom_produit?: string;
  variants?: Array<{
    type: string;
    value: string;
    price_adjustment?: number;
  }>;
}

export interface Commande {
  id: number;
  nom_client: string;
  telephone: string;
  adresse: string;
  statut: StatutCommande;
  total: number;
  numero_commande: string; // numéro unique généré par Laravel
  zone_livraison_id: number;
  remarques?: string;
  created_at: string;
  updated_at: string;
  ligne_commandes?: LigneCommandeLaravel[];
  zone_livraison?: ZoneLivraison;
}

export interface ReponseStatutCommande {
  numero_commande: string;
  statut: StatutCommande;
  message: string;
}

export interface PayloadCommandeFrontend {
  customer: {
    name: string;
    phone: string;
    email?: string;
    address: string;
  };
  delivery_zone_id: number;
  items: Array<{
    product_id: number;
    product_name: string;
    unit_price: number;
    quantity: number;
    total_price: number;
  }>;
  subtotal: number;
  delivery_fee: number;
  total: number;
  remarks?: string;
}


export interface ReponseCommandeLaravel {
  order_number: string;
  order_id: number;
  status: string;
  total: number;
}
