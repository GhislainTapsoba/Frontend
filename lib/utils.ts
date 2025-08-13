import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combine des classes CSS conditionnelles avec gestion intelligente des classes Tailwind en conflit.
 * @param inputs Liste de classes ou conditions (format clsx).
 * @returns Chaîne de classes CSS finale fusionnée.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(...inputs));
}
