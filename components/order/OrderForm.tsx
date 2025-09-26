"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2 } from "lucide-react";

// Nouveau type adapté à OrderPage
export interface OrderFormData {
  nom_client: string;
  telephone: string;
  adresse: string;
  ville: string;
  code_postal: string;
  remarques?: string;
  email?: string;
}

const formSchema = z.object({
  nom_client: z.string().min(2, "Le nom est requis et doit contenir au moins 2 caractères."),
  telephone: z.string().regex(/^\+?[0-9\s-()]{8,20}$/, "Numéro de téléphone invalide."),
  adresse: z.string().min(5, "L'adresse est requise et doit contenir au moins 5 caractères."),
  ville: z.string().min(2, "La ville est requise."),
  code_postal: z.string().min(4, "Le code postal est requis."),
  remarques: z.string().optional(),
  email: z.string().email("Email invalide").optional(),
});

interface OrderFormProps {
  onSubmit: (data: OrderFormData) => void;
  isSubmitting: boolean;
}

export function OrderForm({ onSubmit, isSubmitting }: OrderFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nom_client: "",
      telephone: "",
      adresse: "",
      ville: "",
      code_postal: "",
      remarques: "",
      email: "",
    },
  });

  return (
    <div className="bg-gray-800 p-8 rounded-2xl shadow-xl">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <h2 className="text-2xl font-semibold text-white mb-4">Vos informations</h2>

          <FormField
            control={form.control}
            name="nom_client"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-200">Nom complet</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Votre nom et prénom" 
                    className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-purple-400"
                    {...field} 
                  />
                </FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="telephone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-200">Téléphone</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Ex: +226 70 00 00 00" 
                    className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-purple-400"
                    {...field} 
                  />
                </FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-200">Email (facultatif)</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Ex: exemple@domaine.com" 
                    className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-purple-400"
                    {...field} 
                  />
                </FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="adresse"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-200">Adresse de livraison</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Votre adresse complète (rue, quartier)" 
                    className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-purple-400 resize-none"
                    {...field} 
                    rows={3} 
                  />
                </FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="ville"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-200">Ville</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Votre ville" 
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-purple-400"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="code_postal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-200">Code postal</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Code postal" 
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-purple-400"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="remarques"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-200">Remarques (facultatif)</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Ex: Livraison après 18h, laisser chez le voisin..." 
                    className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-purple-400 resize-none"
                    {...field} 
                    rows={3} 
                  />
                </FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />

          <Button 
            type="submit" 
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 transition-all duration-200 hover:shadow-lg" 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Envoi de la commande...
              </>
            ) : (
              "Confirmer la commande"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}