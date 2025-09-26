// app/(pages)/faq/page.tsx
import Image from "next/image";
import { getPageBySlug } from "@/lib/api/strapi";
import { getStrapiMediaUrl } from "@/lib/api/strapi";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { DynamicSections } from "@/components/common/DynamicSections";

export const metadata = {
  title: "Questions fréquentes (FAQ)",
  description: "Trouvez rapidement les réponses à vos questions les plus courantes"
};

export default async function FAQPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <ErrorBoundary>
          <Suspense fallback={<LoadingSpinner />}>
            <PageContent slug="faq" />
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
  const altText = page.image_principale?.alternativeText || page.titre || "FAQ";
  
  // FAQ statiques par défaut si pas de contenu dynamique
  const defaultFAQs = [
    {
      category: "Commandes",
      questions: [
        {
          question: "Comment passer une commande ?",
          answer: "Parcourez notre catalogue, ajoutez les produits à votre panier, puis suivez les étapes de commande. Vous recevrez une confirmation par email."
        },
        {
          question: "Puis-je modifier ma commande ?",
          answer: "Vous pouvez modifier votre commande dans les 30 minutes suivant sa validation, en nous contactant directement."
        },
        {
          question: "Quels sont les moyens de paiement acceptés ?",
          answer: "Nous acceptons les paiements par carte bancaire, virement bancaire, et paiement à la livraison selon votre zone."
        }
      ]
    },
    {
      category: "Livraison",
      questions: [
        {
          question: "Quels sont les délais de livraison ?",
          answer: "Les délais varient de 24h à 48h selon votre zone de livraison. Vous recevrez une estimation précise lors de votre commande."
        },
        {
          question: "Comment suivre ma commande ?",
          answer: "Vous recevrez un lien de suivi par SMS et email dès l'expédition de votre commande."
        },
        {
          question: "Que faire si je ne suis pas présent lors de la livraison ?",
          answer: "Notre livreur vous contactera pour convenir d'un nouveau créneau de livraison dans la journée."
        }
      ]
    },
    {
      category: "Produits",
      questions: [
        {
          question: "Les produits sont-ils frais ?",
          answer: "Tous nos produits sont sélectionnés avec soin et livrés dans les meilleures conditions de fraîcheur."
        },
        {
          question: "Puis-je retourner un produit ?",
          answer: "Pour les produits non périssables, vous disposez de 14 jours pour nous signaler tout problème."
        }
      ]
    }
  ];

  return (
    <>
      {/* Header avec icône de questions */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-6">
          <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
          {page.titre}
        </h1>
      
        
        {/* Barre de recherche */}
        <div className="max-w-md mx-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher dans les questions..."
              className="w-full px-4 py-3 pl-10 bg-white border border-gray-300 rounded-full focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition-colors"
            />
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
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
        </div>
      )}

      {/* Accès rapide aux catégories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {defaultFAQs.map((category, index) => (
          <div key={index} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">{category.category}</h3>
              <p className="text-sm text-gray-600">{category.questions.length} questions</p>
            </div>
          </div>
        ))}
      </div>

      {/* Contenu principal de la page */}
      {page.contenu && (
        <article className="bg-white p-8 md:p-12 rounded-2xl shadow-lg mb-12">
          <div
            className="prose prose-lg max-w-none text-gray-700"
            dangerouslySetInnerHTML={{ __html: page.contenu }}
          />
        </article>
      )}

      {/* FAQ par catégories */}
      <div className="space-y-8">
        {defaultFAQs.map((category, categoryIndex) => (
          <div key={categoryIndex} className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-8 py-6 border-b">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {category.category}
              </h2>
              <p className="text-gray-600">
                {category.questions.length} question{category.questions.length > 1 ? 's' : ''} fréquente{category.questions.length > 1 ? 's' : ''}
              </p>
            </div>
            
            <div className="p-8">
              <div className="space-y-4">
                {category.questions.map((faq, questionIndex) => (
                  <details key={questionIndex} className="group border border-gray-200 rounded-lg overflow-hidden">
                    <summary className="px-6 py-4 cursor-pointer font-medium text-gray-800 hover:bg-gray-50 transition-colors flex items-center justify-between">
                      <span>{faq.question}</span>
                      <svg className="w-5 h-5 text-gray-500 group-open:transform group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>
                    <div className="px-6 pb-4 pt-2 text-gray-600 bg-gray-50">
                      <p>{faq.answer}</p>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Sections dynamiques */}
      {page.sections && page.sections.length > 0 && (
        <div className="mt-12">
          <DynamicSections sections={page.sections} />
        </div>
      )}

      {/* Section "Question non trouvée" */}
      <div className="mt-16 bg-gradient-to-br from-yellow-50 to-orange-50 p-8 md:p-12 rounded-2xl border">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-6">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Vous ne trouvez pas votre réponse ?
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Notre équipe est là pour vous aider ! N'hésitez pas à nous contacter 
            directement pour toute question spécifique.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="inline-flex items-center px-8 py-4 bg-yellow-600 text-white font-semibold rounded-full hover:bg-yellow-700 transition-colors shadow-lg"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a2 2 0 002.82 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Nous contacter
            </a>
            
            <a
              href="tel:+22605929883"
              className="inline-flex items-center px-8 py-4 border-2 border-yellow-600 text-yellow-700 font-semibold rounded-full hover:bg-yellow-600 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Nous appeler
            </a>
            
            <a
              href="https://wa.me/22605929883"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-8 py-4 bg-green-600 text-white font-semibold rounded-full hover:bg-green-700 transition-colors shadow-lg"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.570-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
              </svg>
              WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* Section conseils */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-blue-50 p-8 rounded-2xl">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Conseil</h3>
          </div>
          <p className="text-gray-600">
            Pour une réponse plus rapide, consultez d'abord notre FAQ. 
            La plupart des questions courantes y trouvent leur réponse.
          </p>
        </div>
        
        <div className="bg-green-50 p-8 rounded-2xl">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Horaires</h3>
          </div>
          <p className="text-gray-600">
            Notre service client est disponible du lundi au vendredi 
            de 8h à 18h et le samedi de 9h à 13h.
          </p>
        </div>
      </div>
    </>
  );
}