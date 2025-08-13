import { NextResponse } from "next/server";
import { z } from "zod";

// Schéma de validation avec messages en français
const ContactSchema = z.object({
  nom: z.string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(100, "Le nom ne peut excéder 100 caractères"),
  email: z.string()
    .email("Veuillez entrer une adresse email valide"),
  sujet: z.string()
    .min(5, "Le sujet doit contenir au moins 5 caractères")
    .max(120, "Le sujet ne peut excéder 120 caractères"),
  message: z.string()
    .min(20, "Le message doit contenir au moins 20 caractères")
    .max(2000, "Le message ne peut excéder 2000 caractères"),
  consentement: z.boolean()
    .refine(v => v === true, {
      message: "Vous devez accepter notre politique de confidentialité"
    })
});

export async function POST(request: Request) {
  try {
    // Récupération et validation des données
    const rawData = await request.json();
    const validation = ContactSchema.safeParse(rawData);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, errors: validation.error.flatten() },
        { status: 400 }
      );
    }

    // Nettoyage des données
    const { nom, email, sujet, message } = validation.data;
    const cleanData = {
      nom: nom.trim(),
      email: email.trim().toLowerCase(),
      sujet: sujet.trim(),
      message: message.trim(),
    };

    // Simulation d'enregistrement (remplace par ta logique métier)
    const dbRecord = { id: Date.now().toString() };

    // Journalisation sécurisée
    console.log(
      `Nouveau contact de ${cleanData.nom[0]}*** (${cleanData.email.slice(0, 3)}***@***${cleanData.email.split('@')[1]})`
    );
    console.log(
      'Email simulé:', { sujet: cleanData.sujet, message: cleanData.message.slice(0, 50) + "..." }
    );

    // Réponse réussie
    return NextResponse.json(
      {
        success: true,
        message: "Merci pour votre message ! Nous vous répondrons bientôt.",
        reference: dbRecord.id,
      },
      {
        status: 201,
        headers: {
          "X-Contact-Received": "true",
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Erreur traitement formulaire contact:", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });

    // Toujours 500 en cas d’erreur inattendue (car erreur custom avec status peu probable ici)
    return NextResponse.json(
      {
        success: false,
        message: "Une erreur technique est survenue.",
        errorId: Date.now(),
      },
      { status: 500 }
    );
  }
}
