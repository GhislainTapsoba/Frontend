// app/(pages)/zones-livraison/page.tsx
import { Suspense } from "react";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { getZonesLivraison } from "@/lib/api/laravel"; // ton fichier Laravel API
import { ZoneLivraison } from "@/types/laravel";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata = {
  title: "Zones de livraison",
  description: "Consultez nos zones de livraison et leurs frais",
};

// Page principale
export default function ZonesLivraisonPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <ErrorBoundary>
          <Suspense fallback={<LoadingSpinner />}>
            <ZoneList />
          </Suspense>
        </ErrorBoundary>
      </div>
    </div>
  );
}

// Liste des zones
async function ZoneList() {
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

  if (!zones.length) {
    return (
      <p className="text-center text-gray-500">
        Aucune zone de livraison disponible.
      </p>
    );
  }

  return (
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
              Frais : <span className="font-semibold">{zone.delivery_fee} FCFA</span>
            </p>
            <p className="text-gray-500 text-sm">
              Temps de livraison : {zone.delivery_time_min} - {zone.delivery_time_max} min
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
  );
}
