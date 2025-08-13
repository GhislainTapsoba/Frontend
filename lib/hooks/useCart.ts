"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { type ArticlePanier } from "@/types/cart";

interface EtatPanier {
  items: ArticlePanier[];
  addItem: (item: ArticlePanier) => void;
  removeItem: (productId: number, variant?: { type: string; value: string }) => void;
  updateQuantity: (
    productId: number,
    quantity: number,
    variant?: { type: string; value: string }
  ) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCart = create<EtatPanier>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (newItem) => {
        set((state) => {
          const existingIndex = state.items.findIndex(
            (item) =>
              item.id === newItem.id &&
              item.variant?.type === newItem.variant?.type &&
              item.variant?.value === newItem.variant?.value
          );

          if (existingIndex > -1) {
            const updatedItems = [...state.items];
            updatedItems[existingIndex] = {
              ...updatedItems[existingIndex],
              quantite: updatedItems[existingIndex].quantite + newItem.quantite,
            };
            return { items: updatedItems };
          } else {
            return { items: [...state.items, newItem] };
          }
        });
      },
      removeItem: (productId, variant) => {
        set((state) => ({
          items: state.items.filter(
            (item) =>
              !(item.id === productId &&
                item.variant?.type === variant?.type &&
                item.variant?.value === variant?.value)
          ),
        }));
      },
      updateQuantity: (productId, quantity, variant) => {
        set((state) => ({
          items: state.items
            .map((item) =>
              item.id === productId &&
              item.variant?.type === variant?.type &&
              item.variant?.value === variant?.value
                ? { ...item, quantite: quantity }
                : item
            )
            .filter((item) => item.quantite > 0),
        }));
      },
      clearCart: () => set({ items: [] }),
      getTotalItems: () => get().items.reduce((total, item) => total + item.quantite, 0),
      getTotalPrice: () =>
        get().items.reduce((total, item) => {
          const itemPrice = item.prix + (item.variant?.price_adjustment ?? 0);
          return total + itemPrice * item.quantite;
        }, 0),
    }),
    {
      name: "ecms-cart-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
