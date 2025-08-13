import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getPageBySlug } from "@/lib/api/strapi";
import { getEnv } from "@/lib/env";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";

export default async function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <ErrorBoundary>
        <Suspense fallback={<LoadingSpinner />}>
          <PageContent slug="a-propos" />
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
  const imageUrl = imageData ? `${getEnv("NEXT_PUBLIC_STRAPI_URL")}${imageData.url}` : null;
  const altText = imageData?.alternativeText || page.titre;

  return (
    <article className="bg-white p-6 rounded-lg shadow-md">
      <h1 className="text-4xl font-bold text-gray-800 mb-6 text-center">{page.titre}</h1>

      {imageUrl && (
        <div className="relative w-full h-64 mb-6 rounded-lg overflow-hidden">
          <Image src={imageUrl} alt={altText} fill style={{ objectFit: "cover" }} priority />
        </div>
      )}

      {/* Contenu principal */}
      <div
        className="prose max-w-none mb-8"
        dangerouslySetInnerHTML={{ __html: page.contenu }}
      />

      {/* Rendu dynamique des sections (dynamic zone) */}
      {page.sections && page.sections.length > 0 && (
        <div className="space-y-12">
          {page.sections.map((section: any, idx: number) => {
            // Le type du composant dans Strapi est dans __component
            switch (section.__component) {
              case "sections.section-texte":
                return <SectionTexte key={idx} data={section} />;
              case "sections.section-image":
                return <SectionImage key={idx} data={section} />;
              case "sections.section-galerie":
                return <SectionGalerie key={idx} data={section} />;
              case "sections.section-contact":
                return <SectionContact key={idx} data={section} />;
              default:
                return null;
            }
          })}
        </div>
      )}
    </article>
  );
}

// Composants pour sections dynamiques

function SectionTexte({ data }: { data: any }) {
  return (
    <section
      className={`p-6 rounded ${
        data.couleur_fond ? data.couleur_fond : "bg-gray-100"
      } ${data.centrer_texte ? "text-center" : "text-left"}`}
    >
      {data.titre && <h2 className="text-2xl font-semibold mb-4">{data.titre}</h2>}
      <div dangerouslySetInnerHTML={{ __html: data.contenu }} />
    </section>
  );
}

function SectionImage({ data }: { data: any }) {
  const imageData = data.image?.data?.attributes;
  const imageUrl = imageData ? `${getEnv("NEXT_PUBLIC_STRAPI_URL")}${imageData.url}` : null;
  const altText = imageData?.alternativeText || data.titre || "Image";

  const positionMap = {
    gauche: "float-left mr-6",
    droite: "float-right ml-6",
    centre: "mx-auto",
  };

  return (
    <section className="mb-8">
      {data.titre && <h2 className="text-2xl font-semibold mb-4">{data.titre}</h2>}
      {data.description && <p className="mb-4">{data.description}</p>}

      {imageUrl && (
        <div className={`relative w-full h-64 rounded overflow-hidden ${positionMap[data.position_image as keyof typeof positionMap] || positionMap.gauche}`}>
          <Image src={imageUrl} alt={altText} fill style={{ objectFit: "cover" }} />
        </div>
      )}

      {data.lien_url && (
        <a
          href={data.lien_url}
          className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {data.texte_alt || "En savoir plus"}
        </a>
      )}
    </section>
  );
}

function SectionGalerie({ data }: { data: any }) {
  const images = data.images?.data || [];
  const colsMap = {
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
  };
  const affichage = data.affichage || "grille";
  const colonnes = colsMap[data.colonnes as keyof typeof colsMap] || "grid-cols-3";

  if (affichage === "carrousel") {
    // À toi d’intégrer un carrousel comme react-slick ou Swiper si tu veux
    return <p>Carrousel non implémenté</p>;
  }

  return (
    <section>
      {data.titre && <h2 className="text-2xl font-semibold mb-4">{data.titre}</h2>}
      <div className={`grid gap-4 ${colonnes}`}>
        {images.map((img: any, idx: number) => {
          const attr = img.attributes;
          const url = `${getEnv("NEXT_PUBLIC_STRAPI_URL")}${attr.url}`;
          const alt = attr.alternativeText || `Image ${idx + 1}`;
          return (
            <div key={idx} className="relative w-full h-48 rounded overflow-hidden">
              <Image src={url} alt={alt} fill style={{ objectFit: "cover" }} />
            </div>
          );
        })}
      </div>
    </section>
  );
}

function SectionContact({ data }: { data: any }) {
  return (
    <section className="bg-gray-50 p-6 rounded-lg shadow-inner">
      {data.titre && <h2 className="text-2xl font-semibold mb-4">{data.titre}</h2>}

      {data.adresse && <p><strong>Adresse :</strong> {data.adresse}</p>}
      {data.telephone && <p><strong>Téléphone :</strong> {data.telephone}</p>}
      {data.email && <p><strong>Email :</strong> {data.email}</p>}
      {data.whatsapp && <p><strong>WhatsApp :</strong> {data.whatsapp}</p>}
      {data.horaires && <p><strong>Horaires :</strong> {data.horaires}</p>}

      {data.afficher_carte && (
        <div className="mt-4">
          {/* Intègre ici ta carte Google Maps ou autre */}
          <p>Carte non implémentée</p>
        </div>
      )}
    </section>
  );
}
