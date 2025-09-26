// app/(pages)/zones-livraison/page.tsx
import { Suspense } from "react";
import Image from "next/image";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { getZonesLivraison } from "@/lib/api/laravel";
import { ZoneLivraison } from "@/types/laravel";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Zones de livraison",
  description: "Consultez nos zones de livraison et leurs frais",
};

export default function ZonesLivraisonPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <ErrorBoundary>
          <Suspense fallback={<LoadingSpinner />}>
            <PageContent />
          </Suspense>
        </ErrorBoundary>
      </div>
    </div>
  );
}

async function PageContent() {
  let zones: ZoneLivraison[] = [];

  try {
    zones = await getZonesLivraison();
  } catch (error: any) {
    return (
      <p className="text-center text-red-500">
        Erreur lors de la récupération des zones : {error.message}
      </p>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
          Zones de livraison
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Découvrez les secteurs où nous livrons et les frais associés à chaque
          zone.
        </p>
      </div>

      {/* Image principale */}
      <div className="relative w-full h-64 md:h-96 mb-12 rounded-2xl overflow-hidden shadow-xl">
        <Image 
          src="/images/zoneslivraison.jpg" // Remplacez par le chemin de votre image
          alt="Carte des zones de livraison" 
          fill 
          style={{ objectFit: "contain" }} 
          priority 
          className="transition-transform hover:scale-105 duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        
        {/* Overlay avec texte sur l'image */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">
              Livraison rapide et fiable
            </h2>
            <p className="text-lg opacity-90">
              Partout où vous êtes, nous sommes là pour vous servir
            </p>
          </div>
        </div>
      </div>

      {/* Liste des zones */}
      {zones.length === 0 ? (
        <p className="text-center text-gray-500">
          Aucune zone de livraison disponible.
        </p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {zones.map((zone) => (
            <div
              key={zone.id}
              className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow flex flex-col justify-between"
            >
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">
                  {zone.name}
                </h2>
                <p className="text-gray-600 mb-4">
                  Frais :{" "}
                  <span className="font-semibold">
                    {zone.delivery_fee} FCFA
                  </span>
                </p>
                <p className="text-gray-500 text-sm">
                  Temps de livraison : {zone.delivery_time_min} -{" "}
                  {zone.delivery_time_max} min
                </p>
              </div>

              <Link href="/commande">
                <Button
                  size="lg"
                  className="w-full bg-green-600 hover:bg-green-700 mt-4"
                >
                  Commander
                </Button>
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Section infos complémentaires */}
      <div className="mt-16 bg-gradient-to-br from-green-50 to-blue-50 p-8 md:p-12 rounded-2xl border">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Besoin d'aide ?
            </h2>
            <p className="text-gray-600 mb-6">
              Contactez-nous pour toute question concernant les zones de
              livraison ou pour des demandes spéciales.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="/contact"
                className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
              >
                📞 Nous contacter
              </a>
              <a
                href="/conditions-livraison"
                className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                📃 Voir conditions
              </a>
            </div>
          </div>

          <div className="text-center lg:text-right">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full">
              <svg
                className="w-12 h-12 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}