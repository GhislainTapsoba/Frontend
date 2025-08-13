"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  images: string[];
}

export function ProductGallery({ images }: ProductGalleryProps) {
  const placeholder = "/placeholder.svg?height=600&width=600";
  const [mainImage, setMainImage] = useState(images?.[0] ?? placeholder);

  if (!images || images.length === 0) {
    return (
      <div className="relative w-full h-96 bg-gray-100 flex items-center justify-center rounded-lg overflow-hidden">
        <Image
          src={placeholder}
          alt="Image non disponible"
          fill
          className="object-contain text-gray-400"
          priority
        />
        <span className="absolute text-gray-500 select-none pointer-events-none">
          Image non disponible
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Image principale */}
      <div className="relative w-full h-96 bg-gray-100 rounded-lg overflow-hidden shadow-md">
        <Image
          src={mainImage || placeholder}
          alt="Image principale du produit"
          fill
          className="object-contain"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 500px"
          priority
        />
      </div>

      {/* Miniatures */}
      {images.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              type="button"
              aria-label={`Voir l'image ${index + 1}`}
              className={cn(
                "relative w-20 h-20 flex-shrink-0 rounded-md overflow-hidden border-2 focus:outline-none focus:ring-2 focus:ring-purple-600",
                mainImage === image
                  ? "border-purple-600"
                  : "border-transparent hover:border-gray-300"
              )}
              onClick={() => setMainImage(image)}
            >
              <Image
                src={image || placeholder}
                alt={`Miniature produit ${index + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
