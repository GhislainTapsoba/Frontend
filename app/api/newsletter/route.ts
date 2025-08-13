import { NextResponse } from "next/server";
import { z } from "zod";

// Schéma de validation
const NewsletterSchema = z.object({
  email: z.string().email("Format d'email invalide"),
  consent: z.boolean().refine(v => v === true, {
    message: "Vous devez accepter les conditions"
  }),
  source: z.string().optional()
});

export async function POST(request: Request) {
  try {
    // 1. Récupération et validation des données
    const payload = await request.json();
    const result = NewsletterSchema.safeParse(payload);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          errors: result.error.flatten()
        },
        { status: 400 }
      );
    }

    // 2. Nettoyage des données
    const cleanEmail = result.data.email.trim().toLowerCase();

    // 3. Simulation d'enregistrement (à remplacer par intégration réelle)
    const subscriber = {
      id: Date.now().toString(),
      email: cleanEmail,
      source: result.data.source || null
    };

    // 4. Journalisation sécurisée (masque partiel de l'email)
    console.log(`Nouvelle inscription newsletter: ${cleanEmail.slice(0,3)}...@...${cleanEmail.split('@')[1]}`);

    // 5. Réponse HTTP
    return NextResponse.json(
      {
        success: true,
        message: "Inscription confirmée !",
        data: subscriber
      },
      {
        status: 201,
        headers: {
          "X-Newsletter-Sub": "true",
          "Cache-Control": "no-store"
        }
      }
    );

  } catch (error) {
    console.error("Erreur newsletter:", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    });

    // Toujours 500 pour erreurs serveur non anticipées
    return NextResponse.json(
      {
        success: false,
        message: "Erreur interne du serveur",
        errorId: Date.now()
      },
      { status: 500 }
    );
  }
}
