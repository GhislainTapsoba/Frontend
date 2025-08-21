// app/(pages)/a-propos/page.tsx
import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getPageBySlug } from "@/lib/api/strapi";
import { getStrapiMediaUrl } from "@/lib/api/strapi";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { DynamicSections } from "@/components/common/DynamicSections";

export const metadata = {
  title: "À propos de nous",
  description: "Découvrez notre histoire, nos valeurs et notre équipe"
};

export default async function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <ErrorBoundary>
          <Suspense fallback={<LoadingSpinner />}>
            <PageContent slug="a-propos" />
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
  const altText = page.image_principale?.alternativeText || page.titre || "À propos";

  return (
    <>
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
          {page.titre}
        </h1>
      </div>

      {/* Image principale */}
      {imageUrl && (
        <div className="relative w-full h-64 md:h-96 mb-12 rounded-2xl overflow-hidden shadow-xl">
          <Image 
            src={imageUrl} 
            alt={altText} 
            fill 
            style={{ objectFit: "cover" }} 
            priority 
            className="transition-transform hover:scale-105 duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>
      )}

      {/* Contenu principal */}
      <article className="bg-white p-8 md:p-12 rounded-2xl shadow-lg mb-12">
        <div
          className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: page.contenu }}
        />
      </article>

      {/* Sections dynamiques */}
      {page.sections && page.sections.length > 0 && (
        <DynamicSections sections={page.sections} />
      )}

      {/* Section CTA */}
      <div className="mt-16 text-center bg-gradient-to-br from-blue-600 to-purple-700 text-white p-12 rounded-2xl">
        <h2 className="text-3xl font-bold mb-4">
          Prêt à découvrir nos produits ?
        </h2>
        <p className="text-xl mb-8 opacity-90">
          Explorez notre catalogue et trouvez ce qui vous convient
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/produits"
            className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-full hover:bg-gray-100 transition-colors shadow-lg"
          >
            Voir nos produits
            <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
          <a
            href="/contact"
            className="inline-flex items-center px-8 py-4 border-2 border-white text-white font-semibold rounded-full hover:bg-white hover:text-blue-600 transition-colors"
          >
            Nous contacter
            <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a2 2 0 002.82 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </a>
        </div>
      </div>
    </>
  );
}