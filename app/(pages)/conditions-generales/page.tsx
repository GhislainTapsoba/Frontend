// app/(pages)/conditions-generales/page.tsx
import Image from "next/image";
import { getPageBySlug } from "@/lib/api/strapi";
import { getStrapiMediaUrl } from "@/lib/api/strapi";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { DynamicSections } from "@/components/common/DynamicSections";

export const metadata = {
  title: "Conditions générales",
  description: "Consultez nos conditions générales d'utilisation et de vente"
};

export default async function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <ErrorBoundary>
          <Suspense fallback={<LoadingSpinner />}>
            <PageContent slug="conditions-generales" />
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
  const altText = page.image_principale?.alternativeText || page.titre || "Conditions générales";
  const currentDate = new Date().toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <>
      {/* Header avec icône légale */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
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
        </div>
      )}

      {/* Navigation rapide */}
      <div className="bg-white p-6 rounded-xl shadow-sm mb-8 border-l-4 border-blue-500">
        <div className="flex items-center mb-4">
          <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="font-semibold text-gray-800">Information importante</h2>
        </div>
        <p className="text-gray-600 text-sm">
          En utilisant nos services, vous acceptez nos conditions générales. 
          Nous vous recommandons de les lire attentivement et de les conserver.
        </p>
      </div>

      {/* Contenu principal */}
      <article className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="p-8 md:p-12">
          <div
            className="prose prose-lg max-w-none text-gray-700 
                       prose-headings:text-gray-800 prose-headings:font-semibold
                       prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h2:pb-2 prose-h2:border-b prose-h2:border-gray-200
                       prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
                       prose-p:mb-4 prose-p:leading-7
                       prose-ul:my-4 prose-li:mb-2
                       prose-strong:text-gray-800 prose-strong:font-semibold
                       prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline"
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

      {/* Section contact pour questions */}
      <div className="mt-16 bg-gradient-to-br from-gray-50 to-blue-50 p-8 md:p-12 rounded-2xl border">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Questions sur nos conditions ?
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Si vous avez des questions concernant nos conditions générales, 
            n'hésitez pas à nous contacter. Notre équipe se fera un plaisir de vous répondre.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a2 2 0 002.82 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Nous contacter
            </a>
            <a
              href="/faq"
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Voir la FAQ
            </a>
          </div>
        </div>
      </div>
    </>
  );
}