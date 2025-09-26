"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";

// Schéma qui correspond exactement à votre API
const formSchema = z.object({
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

type ContactFormValues = z.infer<typeof formSchema>;

export function ContactForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nom: "",
      email: "",
      sujet: "",
      message: "",
      consentement: false,
    },
  });

  async function onSubmit(values: ContactFormValues) {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: "Message envoyé !",
          description: data.message,
          variant: "default",
        });
        form.reset();
      } else {
        // Gestion des erreurs de validation
        if (data.errors) {
          // Affichage des erreurs de champs spécifiques
          const fieldErrors = data.errors.fieldErrors;
          Object.keys(fieldErrors || {}).forEach((field) => {
            form.setError(field as keyof ContactFormValues, {
              message: fieldErrors[field][0],
            });
          });
        }

        toast({
          title: "Erreur de validation",
          description: data.message || "Veuillez vérifier les informations saisies.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi du formulaire de contact:", error);
      toast({
        title: "Erreur réseau",
        description: "Impossible de se connecter au serveur. Veuillez vérifier votre connexion.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Envoyez-nous un message
          </h2>

          <FormField
            control={form.control}
            name="nom"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Votre nom</FormLabel>
                <FormControl>
                  <Input placeholder="Votre nom complet" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Votre email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="votre.email@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sujet"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sujet</FormLabel>
                <FormControl>
                  <Input placeholder="Sujet de votre message" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Votre message</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Écrivez votre message ici..." 
                    rows={5} 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="consentement"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-sm">
                    J'accepte la{" "}
                    <a 
                      href="/politique-confidentialite" 
                      className="text-purple-600 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      politique de confidentialité
                    </a>
                  </FormLabel>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Envoi en cours...
              </>
            ) : (
              "Envoyer le message"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}