/**
 * Type représentant une relation simple vers une entité Strapi.
 * Peut être null si la relation n'existe pas.
 */
export type StrapiRelation<T> = {
  data: {
    id: number;
    attributes: T;
  } | null;
};

/**
 * Type représentant une relation multiple (liste) vers des entités Strapi.
 */
export type StrapiRelationArray<T> = {
  data: Array<{
    id: number;
    attributes: T;
  }>;
};
