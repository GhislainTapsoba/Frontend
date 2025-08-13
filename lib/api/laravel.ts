import { ZoneLivraison, Commande, PayloadCommandeFrontend, ReponseStatutCommande, ReponseCommandeLaravel } from '@/types/laravel';

const LARAVEL_API_URL = process.env.NEXT_PUBLIC_LARAVEL_API_URL;
const LARAVEL_API_TOKEN = process.env.LARAVEL_API_TOKEN; // token serveur uniquement

if (!LARAVEL_API_URL) {
  throw new Error("Missing NEXT_PUBLIC_LARAVEL_API_URL environment variable");
}

async function fetchLaravel<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${LARAVEL_API_URL}${path}`;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  if (typeof window === 'undefined' && LARAVEL_API_TOKEN) {
    headers['Authorization'] = `Bearer ${LARAVEL_API_TOKEN}`;
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    console.error(`Laravel API error at ${path}`, errorData);
    throw new Error(`Laravel API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// --- Zones de livraison ---
export async function getZonesLivraison(): Promise<ZoneLivraison[]> {
  const res = await fetchLaravel<{ success: boolean; data: any[] }>('/v1/delivery-zones');
  return res.data.map(z => ({
    id: z.id,
    name: z.name,
    delivery_fee: z.delivery_fee,
    delivery_time_min: z.delivery_time_min,
    delivery_time_max: z.delivery_time_max,
    zone_name: z.name, // utile pour CartSummary
  }));
}

// --- Calcul des frais de livraison ---
export async function calculerFraisLivraison(zoneId: number, subtotal: number): Promise<{
  delivery_fee: number;
  delivery_time_min: number;
  delivery_time_max: number;
  zone_name: string;
  subtotal: number;
  total: number;
}> {
  return fetchLaravel<{
    success: boolean;
    data: {
      delivery_fee: number;
      delivery_time_min: number;
      delivery_time_max: number;
      zone_name: string;
      subtotal: number;
      total: number;
    };
  }>('/v1/calculate-delivery', {
    method: 'POST',
    body: JSON.stringify({ delivery_zone_id: zoneId, subtotal }),
  }).then(res => res.data);
}

// --- Création d'une commande ---
export async function creerCommande(payload: PayloadCommandeFrontend): Promise<ReponseCommandeLaravel> {
  const res = await fetch("http://localhost:8000/api/v1/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) throw data;

  return data.data as ReponseCommandeLaravel;
}

// --- Vérification du statut d'une commande ---
export async function verifierStatutCommande(numeroCommande: string): Promise<ReponseStatutCommande> {
  return fetchLaravel<ReponseStatutCommande>(`/v1/orders/${numeroCommande}/status`);
}
