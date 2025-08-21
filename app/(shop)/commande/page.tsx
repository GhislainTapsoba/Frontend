"use client";

import { useCart } from "@/lib/hooks/useCart";
import { CartSummary } from "@/components/cart/CartSummary";
import { OrderForm } from "@/components/order/OrderForm";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { creerCommande } from "@/lib/api/laravel";
import { useToast } from "@/components/ui/use-toast";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import type { PayloadCommandeFrontend, ReponseCommandeLaravel } from "@/types/laravel";

export default function OrderPage() {
  const { items, clearCart } = useCart();
  const router = useRouter();
  const { toast } = useToast();

  const [fraisLivraison, setFraisLivraison] = useState<number>(0);
  const [zoneSelectionneeId, setZoneSelectionneeId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (items.length === 0) router.push("/panier");
  }, [items.length, router]);

  // --- Vérification et décrémentation du stock Strapi v5 ---
  const checkAndDecrementStock = async (items: PayloadCommandeFrontend["items"]) => {
    const STRAPI_BASE_URL = process.env.NEXT_PUBLIC_STRAPI_URL;
    const STRAPI_TOKEN = process.env.NEXT_PUBLIC_STRAPI_TOKEN;
    if (!STRAPI_BASE_URL || !STRAPI_TOKEN) throw new Error("Configuration Strapi manquante");

    const ruptures: string[] = [];
    const productsToUpdate: { id: number; newStock: number }[] = [];

    for (const item of items) {
      // Fetch en incluant explicitement quantite_stock
      const res = await fetch(
        `${STRAPI_BASE_URL}/api/produits?filters[id][$eq]=${item.product_id}&fields=quantite_stock,nom`,
        {
          headers: {
            Authorization: `Bearer ${STRAPI_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Erreur Strapi pour "${item.product_name}" (status ${res.status}): ${text}`);
      }

      const data = await res.json();
      const product = data.data?.[0];
      if (!product) {
        throw new Error(`Produit "${item.product_name}" introuvable`);
      }

      const stock = Number(product.attributes?.quantite_stock ?? 0);
      console.log(`Produit "${item.product_name}" stock réel:`, stock);

      if (item.quantity > stock) {
        ruptures.push(`${item.product_name} (dispo: ${stock})`);
      } else {
        productsToUpdate.push({ id: product.id, newStock: stock - item.quantity });
      }
    }

    if (ruptures.length > 0) {
      throw new Error(`Stock insuffisant pour : ${ruptures.join(", ")}`);
    }

    // Décrémentation des stocks
    for (const p of productsToUpdate) {
      await fetch(`${STRAPI_BASE_URL}/api/produits/${p.id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${STRAPI_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: { quantite_stock: p.newStock } }),
      });
    }
  };

  // --- Soumission de commande ---
  const handleOrderSubmit = async (formData: {
    nom_client: string;
    telephone: string;
    adresse: string;
    ville: string;
    code_postal: string;
    remarques?: string;
    email?: string;
  }) => {
    if (!zoneSelectionneeId) {
      toast({
        title: "Zone requise",
        description: "Sélectionnez une zone de livraison",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const itemsPayload = items.map(item => {
        const prixBase = parseFloat(String(item.prix || 0));
        const ajustementVariante = parseFloat(String(item.variant?.price_adjustment || 0));
        const quantite = parseInt(String(item.quantite || 0), 10);

        if (isNaN(prixBase) || isNaN(ajustementVariante) || isNaN(quantite)) {
          throw new Error(`Données invalides pour le produit "${item.nom}"`);
        }

        const prixUnitaire = prixBase + ajustementVariante;
        const prixTotal = prixUnitaire * quantite;

        return {
          product_id: Number(item.id),
          product_name: item.nom,
          unit_price: Math.round(prixUnitaire * 100) / 100,
          quantity: quantite,
          total_price: Math.round(prixTotal * 100) / 100,
        };
      });

      const sousTotal = itemsPayload.reduce((acc, item) => acc + item.total_price, 0);
      const fraisLivraisonNum = parseFloat(String(fraisLivraison || 0));
      if (isNaN(fraisLivraisonNum)) throw new Error("Frais de livraison invalides");

      const totalFinal = sousTotal + fraisLivraisonNum;

      const payload: PayloadCommandeFrontend = {
        customer: {
          name: formData.nom_client,
          phone: formData.telephone,
          email: formData.email?.trim() || undefined,
          address: formData.adresse,
        },
        delivery_zone_id: zoneSelectionneeId,
        items: itemsPayload,
        subtotal: Math.round(sousTotal * 100) / 100,
        delivery_fee: Math.round(fraisLivraisonNum * 100) / 100,
        total: Math.round(totalFinal * 100) / 100,
        remarks: formData.remarques || "",
      };

      console.log("Payload final :", payload);

      // Vérification et décrémentation du stock
      await checkAndDecrementStock(payload.items);

      // Création de la commande dans Laravel
      const nouvelleCommande: ReponseCommandeLaravel = await creerCommande(payload);

      clearCart();
      router.push(`/commande/confirmation?orderNumber=${nouvelleCommande.order_number}`);

      toast({
        title: "Commande réussie",
        description: "Votre commande a été créée avec succès !",
        variant: "default",
      });
    } catch (error: any) {
      console.error("Erreur création commande :", error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la création de la commande",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) return <LoadingSpinner />;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
        Finaliser votre commande
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
          <OrderForm onSubmit={handleOrderSubmit} isSubmitting={isSubmitting} />
        </div>
        <div className="lg:col-span-1">
          <CartSummary
            onDeliveryFeeChange={setFraisLivraison}
            onZoneSelect={setZoneSelectionneeId}
            selectedZoneId={zoneSelectionneeId}
          />
        </div>
      </div>
    </div>
  );
}
