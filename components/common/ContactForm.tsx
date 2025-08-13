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
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";

const formSchema = z.object({
  nom: z
    .string()
    .min(2, "Le nom est requis et doit contenir au moins 2 caractères."),
  email: z.string().email("Adresse email invalide."),
  sujet: z.string().min(3, "Le sujet est requis et doit contenir au moins 3 caractères."),
  message: z
    .string()
    .min(10, "Le message est requis et doit contenir au moins 10 caractères."),
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

      if (response.ok) {
        toast({
          title: "Message envoyé !",
          description:
            "Votre message a été envoyé avec succès. Nous vous répondrons bientôt.",
          variant: "default",
        });
        form.reset();
      } else {
        const errorData = await response.json();
        toast({
          title: "Erreur d'envoi",
          description:
            errorData.message || "Une erreur est survenue lors de l'envoi de votre message.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi du formulaire de contact:", error);
      toast({
        title: "Erreur réseau",
        description:
          "Impossible de se connecter au serveur. Veuillez vérifier votre connexion.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
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
                <Textarea placeholder="Écrivez votre message ici..." rows={5} {...field} />
              </FormControl>
              <FormMessage />
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
  );
}
