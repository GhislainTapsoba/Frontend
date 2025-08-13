import { NextResponse } from "next/server";
import { z } from "zod";
import { creerCommande } from "@/lib/api/laravel";
import type { PayloadCommande } from "@/types/laravel";

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

    const nouvelleCommande = await creerCommande(payload);

    return NextResponse.json(
      {
        success: true,
        data: {
          id: nouvelleCommande.id,
          numero: nouvelleCommande.numero_commande,
          date: nouvelleCommande.created_at,
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
