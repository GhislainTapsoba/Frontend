"use client";

import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Info } from "lucide-react";
import { useEffect, useState } from "react";
import { verifierStatutCommande } from "@/lib/api/laravel";
import { type StatutCommande } from "@/types/laravel";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useToast } from "@/components/ui/use-toast";

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams();
  const numeroCommande = searchParams.get("orderNumber");
  const { toast } = useToast();

  const [statut, setStatut] = useState<StatutCommande | null>(null);
  const [isLoadingStatut, setIsLoadingStatut] = useState(false);

  useEffect(() => {
    if (!numeroCommande) return;

    const fetchStatut = async () => {
      setIsLoadingStatut(true);
      try {
        const result = await verifierStatutCommande(numeroCommande);
        setStatut(result.statut);
      } catch (error) {
        console.error("Failed to fetch order statut:", error);
        toast({
          title: "Erreur de statut",
          description: "Impossible de récupérer le statut de votre commande.",
          variant: "destructive",
        });
        setStatut(null);
      } finally {
        setIsLoadingStatut(false);
      }
    };

    fetchStatut();
  }, [numeroCommande, toast]);

  if (!numeroCommande) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <Card className="max-w-md mx-auto p-6 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-red-600 flex items-center justify-center gap-2">
              <Info className="h-6 w-6" />
              Commande introuvable
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              Le numéro de commande est manquant ou invalide.
            </p>
            <Link href="/">
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                Retour à l&apos;accueil
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 text-center">
      <Card className="max-w-2xl mx-auto p-8 shadow-lg">
        <CardHeader>
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <CardTitle className="text-3xl font-bold text-gray-800">
            Commande Confirmée !
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-lg text-gray-700">
            Merci pour votre commande ! Votre commande a été passée avec succès.
          </p>
          <p className="text-xl font-semibold text-gray-900">
            Numéro de commande:{" "}
            <span className="text-purple-600">{numeroCommande}</span>
          </p>

          {isLoadingStatut ? (
            <LoadingSpinner />
          ) : statut ? (
            <p className="text-md text-gray-600">
              Statut actuel: <span className="font-bold capitalize">{statut}</span>
            </p>
          ) : (
            <p className="text-md text-gray-600">
              Impossible de récupérer le statut actuel de la commande.
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Link href="/produits">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700"
              >
                Continuer vos achats
              </Button>
            </Link>
            <Link href="/">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Retour à l&apos;accueil
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
