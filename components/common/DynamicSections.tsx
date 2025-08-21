// /components/common/DynamicSections.tsx
import Image from "next/image";
import { getStrapiMediaUrl } from "@/lib/api/strapi";
import { type Section } from "@/types/strapi";

interface DynamicSectionsProps {
  sections: Section[];
}

export function DynamicSections({ sections }: DynamicSectionsProps) {
  if (!sections || sections.length === 0) return null;

  return (
    <div className="space-y-12">
      {sections.map((section: any, idx: number) => {
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
          case "sections.section-faq":
            return <SectionFAQ key={idx} data={section} />;
          case "sections.section-avantages":
            return <SectionAvantages key={idx} data={section} />;
          default:
            console.warn(`Type de section non reconnu: ${section.__component}`);
            return null;
        }
      })}
    </div>
  );
}

// Composants pour sections dynamiques

function SectionTexte({ data }: { data: any }) {
  const backgroundColors = {
    "bg-gray-100": "bg-gray-100",
    "bg-blue-50": "bg-blue-50",
    "bg-green-50": "bg-green-50",
    "bg-yellow-50": "bg-yellow-50",
    "bg-purple-50": "bg-purple-50",
    "bg-white": "bg-white",
  };

  const bgColor = backgroundColors[data.couleur_fond as keyof typeof backgroundColors] || "bg-gray-100";

  return (
    <section
      className={`p-6 rounded-lg shadow-sm ${bgColor} ${
        data.centrer_texte ? "text-center" : "text-left"
      }`}
    >
      {data.titre && (
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">
          {data.titre}
        </h2>
      )}
      <div 
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: data.contenu }} 
      />
    </section>
  );
}

function SectionImage({ data }: { data: any }) {
  const imageUrl = getStrapiMediaUrl(data.image?.url);
  const altText = data.image?.alternativeText || data.titre || "Image";

  const positionClasses = {
    gauche: "md:float-left md:mr-6 mb-4",
    droite: "md:float-right md:ml-6 mb-4",
    centre: "mx-auto mb-6",
    pleine_largeur: "w-full mb-6"
  };

  const positionClass = positionClasses[data.position_image as keyof typeof positionClasses] || positionClasses.gauche;

  return (
    <section className="mb-8">
      {data.titre && (
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">
          {data.titre}
        </h2>
      )}
      
      {data.description && (
        <p className="mb-4 text-gray-600">
          {data.description}
        </p>
      )}

      {imageUrl && (
        <div className={`relative h-64 rounded-lg overflow-hidden ${positionClass}`}
             style={{ width: data.position_image === 'pleine_largeur' ? '100%' : '300px' }}>
          <Image 
            src={imageUrl} 
            alt={altText} 
            fill 
            style={{ objectFit: "cover" }} 
            className="transition-transform hover:scale-105"
          />
        </div>
      )}

      {data.lien_url && (
        <a
          href={data.lien_url}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          target={data.lien_url.startsWith('http') ? '_blank' : undefined}
          rel={data.lien_url.startsWith('http') ? 'noopener noreferrer' : undefined}
        >
          {data.texte_lien || "En savoir plus"}
          <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </a>
      )}
    </section>
  );
}

function SectionGalerie({ data }: { data: any }) {
  const images = data.images || [];
  
  const colsClasses = {
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  };
  
  const affichage = data.affichage || "grille";
  const colonnes = colsClasses[data.colonnes as keyof typeof colsClasses] || colsClasses[3];

  if (affichage === "carrousel") {
    // Pour un carrousel simple avec défilement horizontal
    return (
      <section>
        {data.titre && (
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            {data.titre}
          </h2>
        )}
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {images.map((img: any, idx: number) => {
            const url = getStrapiMediaUrl(img.url);
            const alt = img.alternativeText || `Image ${idx + 1}`;
            return (
              <div key={idx} className="relative flex-shrink-0 w-64 h-48 rounded-lg overflow-hidden">
                <Image 
                  src={url} 
                  alt={alt} 
                  fill 
                  style={{ objectFit: "cover" }}
                  className="transition-transform hover:scale-105"
                />
              </div>
            );
          })}
        </div>
      </section>
    );
  }

  return (
    <section>
      {data.titre && (
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">
          {data.titre}
        </h2>
      )}
      <div className={`grid gap-4 ${colonnes}`}>
        {images.map((img: any, idx: number) => {
          const url = getStrapiMediaUrl(img.url);
          const alt = img.alternativeText || `Image ${idx + 1}`;
          return (
            <div key={idx} className="relative w-full h-48 rounded-lg overflow-hidden group">
              <Image 
                src={url} 
                alt={alt} 
                fill 
                style={{ objectFit: "cover" }}
                className="transition-transform group-hover:scale-105"
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}

function SectionContact({ data }: { data: any }) {
  return (
    <section className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-lg shadow-inner">
      {data.titre && (
        <h2 className="text-2xl font-semibold mb-6 text-gray-800 text-center">
          {data.titre}
        </h2>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          {data.adresse && (
            <div className="flex items-start space-x-3">
              <svg className="h-5 w-5 text-blue-600 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div>
                <p className="font-semibold text-gray-800">Adresse</p>
                <p className="text-gray-600">{data.adresse}</p>
              </div>
            </div>
          )}

          {data.telephone && (
            <div className="flex items-center space-x-3">
              <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <div>
                <p className="font-semibold text-gray-800">Téléphone</p>
                <a href={`tel:${data.telephone}`} className="text-blue-600 hover:text-blue-800">
                  {data.telephone}
                </a>
              </div>
            </div>
          )}

          {data.email && (
            <div className="flex items-center space-x-3">
              <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a2 2 0 002.82 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <div>
                <p className="font-semibold text-gray-800">Email</p>
                <a href={`mailto:${data.email}`} className="text-blue-600 hover:text-blue-800">
                  {data.email}
                </a>
              </div>
            </div>
          )}

          {data.whatsapp && (
            <div className="flex items-center space-x-3">
              <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.570-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
              </svg>
              <div>
                <p className="font-semibold text-gray-800">WhatsApp</p>
                <a href={`https://wa.me/${data.whatsapp.replace(/[^\d]/g, '')}`} 
                   className="text-green-600 hover:text-green-800"
                   target="_blank" 
                   rel="noopener noreferrer">
                  {data.whatsapp}
                </a>
              </div>
            </div>
          )}
        </div>

        <div>
          {data.horaires && (
            <div className="bg-white p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">Horaires</h3>
              <div dangerouslySetInnerHTML={{ __html: data.horaires }} />
            </div>
          )}
        </div>
      </div>

      {data.afficher_carte && (
        <div className="mt-6 bg-white p-4 rounded-lg">
          <p className="text-center text-gray-600">
            <svg className="inline h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7"/>
            </svg>
            Carte interactive disponible prochainement
          </p>
        </div>
      )}
    </section>
  );
}

function SectionFAQ({ data }: { data: any }) {
  const faqs = data.questions || [];

  return (
    <section>
      {data.titre && (
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">
          {data.titre}
        </h2>
      )}
      <div className="space-y-4">
        {faqs.map((faq: any, idx: number) => (
          <details key={idx} className="bg-white border border-gray-200 rounded-lg">
            <summary className="px-6 py-4 cursor-pointer font-medium text-gray-800 hover:bg-gray-50 transition-colors">
              {faq.question}
            </summary>
            <div className="px-6 pb-4 text-gray-600">
              <div dangerouslySetInnerHTML={{ __html: faq.reponse }} />
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}

function SectionAvantages({ data }: { data: any }) {
  const avantages = data.avantages || [];

  return (
    <section>
      {data.titre && (
        <h2 className="text-2xl font-semibold mb-6 text-gray-800 text-center">
          {data.titre}
        </h2>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {avantages.map((avantage: any, idx: number) => (
          <div key={idx} className="text-center p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
            {avantage.icone && (
              <div className="text-4xl mb-4">{avantage.icone}</div>
            )}
            <h3 className="font-semibold text-gray-800 mb-2">{avantage.titre}</h3>
            <p className="text-gray-600">{avantage.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}