// app/(pages)/conditions-livraison/page.tsx
import Image from "next/image";
import { getPageBySlug } from "@/lib/api/strapi";
import { getStrapiMediaUrl } from "@/lib/api/strapi";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { DynamicSections } from "@/components/common/DynamicSections";

export const metadata = {
  title: "Conditions de livraison",
  description: "Découvrez nos modalités de livraison, délais et tarifs"
};

export default async function DeliveryConditionsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <ErrorBoundary>
          <Suspense fallback={<LoadingSpinner />}>
            <PageContent slug="conditions-livraison" />
          </Suspense>
        </ErrorBoundary>
      </div>
    </div>
  );
}

async function PageContent({ slug }: { slug: string }) {
  const page = await getPageBySlug(slug);

  if (!page) {
    notFound();
  }

  const imageUrl = getStrapiMediaUrl(page.image_principale?.url);
  const altText = page.image_principale?.alternativeText || page.titre || "Conditions de livraison";
  const currentDate = new Date().toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <>
      {/* Header avec icône de livraison */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
          {page.titre}
        </h1>
      </div>

      {/* Image principale */}
      {imageUrl && (
        <div className="relative w-full h-48 md:h-64 mb-12 rounded-2xl overflow-hidden shadow-lg">
          <Image 
            src={imageUrl} 
            alt={altText} 
            fill 
            style={{ objectFit: "contain" }} 
            priority 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          <div className="absolute bottom-4 left-6 right-6">
            <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4">
              <p className="text-sm font-medium text-gray-800">
                🚚 Livraison rapide et sécurisée dans toute la région
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Points clés de livraison */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white p-6 rounded-xl shadow-sm text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-800 mb-2">Délais</h3>
          <p className="text-sm text-gray-600">24-48h en moyenne selon votre zone</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-800 mb-2">Suivi</h3>
          <p className="text-sm text-gray-600">Suivi en temps réel de votre commande</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-4">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-800 mb-2">Sécurité</h3>
          <p className="text-sm text-gray-600">Emballage sécurisé et soigné</p>
        </div>
      </div>

      {/* Contenu principal */}
      <article className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="p-8 md:p-12">
          <div
            className="prose prose-lg max-w-none text-gray-700 
                       prose-headings:text-gray-800 prose-headings:font-semibold
                       prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h2:pb-2 prose-h2:border-b prose-h2:border-green-200
                       prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
                       prose-p:mb-4 prose-p:leading-7
                       prose-ul:my-4 prose-li:mb-2
                       prose-strong:text-gray-800 prose-strong:font-semibold
                       prose-a:text-green-600 prose-a:no-underline hover:prose-a:underline"
            dangerouslySetInnerHTML={{ __html: page.contenu }}
          />
        </div>
      </article>

      {/* Sections dynamiques */}
      {page.sections && page.sections.length > 0 && (
        <div className="mt-12">
          <DynamicSections sections={page.sections} />
        </div>
      )}

      {/* Zone de livraison */}
      <div className="mt-16 bg-gradient-to-br from-green-50 to-blue-50 p-8 md:p-12 rounded-2xl border">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Vérifiez votre zone de livraison
            </h2>
            <p className="text-gray-600 mb-6">
              Saisissez votre adresse pour connaître les modalités de livraison 
              dans votre secteur et obtenir une estimation des délais.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="/zones-livraison"
                className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Voir les zones
              </a>
              <a
                href="/contact"
                className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Nous appeler
              </a>
            </div>
          </div>
          
          <div className="text-center lg:text-right">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full">
              <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Suivi de commande */}
      <div className="mt-16 bg-white p-8 md:p-12 rounded-2xl shadow-lg">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Suivez votre commande
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Une fois votre commande expédiée, vous recevrez un lien de suivi 
            pour connaître sa position en temps réel.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 md:space-x-4">
            {[
              { icon: "📦", title: "Commande préparée", desc: "Votre commande est prête" },
              { icon: "🚚", title: "En transit", desc: "Votre commande est en route" },
              { icon: "📍", title: "En livraison", desc: "Le livreur est proche" },
              { icon: "✅", title: "Livrée", desc: "Commande réceptionnée" }
            ].map((step, index) => (
              <div key={index} className="flex flex-col items-center text-center">
                <div className="text-3xl mb-2">{step.icon}</div>
                <h4 className="font-semibold text-gray-800 mb-1">{step.title}</h4>
                <p className="text-sm text-gray-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}