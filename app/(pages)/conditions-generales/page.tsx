import Image from "next/image";
import { getPageBySlug } from "@/lib/api/strapi";
import { getEnv } from "@/lib/env";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";

export default async function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <ErrorBoundary>
        <Suspense fallback={<LoadingSpinner />}>
          <PageContent slug="conditions-generales" />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}

async function PageContent({ slug }: { slug: string }) {
  const page = await getPageBySlug(slug);

  if (!page) {
    notFound();
  }

  const imageData = page.image_principale;
  const imageUrl = imageData
    ? `${getEnv("NEXT_PUBLIC_STRAPI_URL")}${imageData.url}`
    : null;
  const altText = imageData?.alternativeText || page.titre || "Image";

  return (
    <article className="bg-white p-6 rounded-lg shadow-md">
      <h1 className="text-4xl font-bold text-gray-800 mb-6 text-center">{page.titre}</h1>

      {imageUrl && (
        <div className="relative w-full h-64 mb-6 rounded-lg overflow-hidden">
          <Image src={imageUrl} alt={altText} fill style={{ objectFit: "cover" }} priority />
        </div>
      )}

      <div
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: page.contenu }}
      />
    </article>
  );
}
