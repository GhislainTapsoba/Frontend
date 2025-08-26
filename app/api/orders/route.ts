import { NextResponse } from "next/server";
import { z } from "zod";
import { creerCommande } from "@/lib/api/laravel";
import type { PayloadCommandeFrontend } from "@/types/laravel";

// Type for the incoming request payload
interface PayloadCommande {
  nom_client: string;
  telephone: string;
  adresse: string;
  ville: string;
  code_postal: string;
  zone_livraison_id: number;
  remarques?: string;
  total: number;
  frais_livraison: number;
  ligne_commandes: Array<{
    product_id: number;
    quantite: number;
    prixUnitaire: number;
    nom_produit?: string;
  }>;
  payment_method?: 'cash' | 'card' | 'transfer';
}

const CommandeSchema = z.object({
  nom_client: z.string().min(2),
  telephone: z.string().min(8),
  adresse: z.string().min(10),
  ville: z.string().min(2),
  code_postal: z.string().min(4),
  zone_livraison_id: z.number().int().positive(),
  remarques: z.string().optional(),
  total: z.number().positive(),
  frais_livraison: z.number().min(0),
  ligne_commandes: z.array(
    z.object({
      product_id: z.number().int().positive(),
      quantite: z.number().int().min(1),
      prixUnitaire: z.number().positive(),
      nom_produit: z.string().optional(),
    })
  ).min(1),
  payment_method: z.enum(['cash', 'card', 'transfer']).optional(),
});

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const validation = CommandeSchema.safeParse(data);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: "Données invalides", errors: validation.error.flatten() },
        { status: 400 }
      );
    }

    const payload: PayloadCommande = validation.data;

    console.log(`Commande reçue pour client : ${payload.nom_client}`);

    // Transform to Laravel API format
    const laravelPayload: PayloadCommandeFrontend = {
      customer: {
        name: payload.nom_client,
        phone: payload.telephone,
        address: `${payload.adresse}, ${payload.ville} ${payload.code_postal}`
      },
      delivery_zone_id: payload.zone_livraison_id,
      items: payload.ligne_commandes.map(item => ({
        product_id: item.product_id,
        product_name: item.nom_produit || '',
        unit_price: item.prixUnitaire,
        quantity: item.quantite,
        total_price: item.prixUnitaire * item.quantite
      })),
      subtotal: payload.total - payload.frais_livraison,
      delivery_fee: payload.frais_livraison,
      total: payload.total,
      remarks: payload.remarques
    };

    const nouvelleCommande = await creerCommande(laravelPayload);

    return NextResponse.json(
      {
        success: true,
        data: {
          id: nouvelleCommande.order_id,
          numero: nouvelleCommande.order_number,
          status: nouvelleCommande.status,
          total: nouvelleCommande.total
        }
      },
      {
        status: 201,
        headers: {
          'Cache-Control': 'no-store',
          'Content-Security-Policy': "default-src 'self'"
        }
      }
    );
  } catch (error) {
    console.error("Erreur création commande:", error);
    return NextResponse.json(
      { success: false, message: "Erreur serveur", errorId: Date.now() },
      { status: 500 }
    );
  }
}
