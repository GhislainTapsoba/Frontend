import { z } from 'zod';

// Schéma de validation pour le formulaire de commande
export const OrderFormSchema = z.object({
  nom_client: z.string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(100, "Le nom ne peut pas dépasser 100 caractères"),
  telephone: z.string()
    .min(8, "Le téléphone doit contenir au moins 8 caractères")
    .max(20, "Le téléphone ne peut pas dépasser 20 caractères"),
  adresse: z.string()
    .min(5, "L'adresse doit contenir au moins 5 caractères")
    .max(200, "L'adresse ne peut pas dépasser 200 caractères"),
  ville: z.string()
    .min(2, "La ville doit contenir au moins 2 caractères")
    .max(50, "La ville ne peut pas dépasser 50 caractères"),
  code_postal: z.string()
    .min(4, "Le code postal doit contenir au moins 4 caractères")
    .max(10, "Le code postal ne peut pas dépasser 10 caractères"),
  remarques: z.string()
    .max(500, "Les remarques ne peuvent pas dépasser 500 caractères")
    .optional(),
});

// Fonction de validation qui retourne un résultat safeParse (success ou erreur)
export function validateOrderForm(data: unknown) {
  return OrderFormSchema.safeParse(data);
}
