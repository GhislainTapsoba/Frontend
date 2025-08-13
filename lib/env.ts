// lib/env.ts

/**
 * Récupère une variable d'environnement en s'assurant qu'elle existe.
 * @param key Clé de la variable d'environnement.
 * @param defaultValue Valeur par défaut optionnelle si la variable n'existe pas.
 * @param required Si true, lance une erreur si la variable est absente.
 * @returns La valeur de la variable d'environnement.
 */
export function getEnv(
  key: string,
  defaultValue?: string,
  required: boolean = false
): string {
  const value = process.env[key] ?? defaultValue;
  if (required && (value === undefined || value === null || value === "")) {
    throw new Error(`La variable d'environnement ${key} est requise mais n'est pas définie.`);
  }
  return value ?? "";
}
