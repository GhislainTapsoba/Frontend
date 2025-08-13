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

  const checkAndDecrementStock = async (items: PayloadCommandeFrontend["items"]) => {
    for (const item of items) {
      const res = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/produits/${item.product_id}`, {
        headers: {
          Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error(`Erreur Strapi pour le produit ${item.product_name}`);

      const productData = await res.json();
      const currentStock = Number(productData.data.attributes.stock);

      if (item.quantity > currentStock) {
        throw new Error(`Stock insuffisant pour ${item.product_name} (stock restant: ${currentStock})`);
      }

      await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/produits/${item.product_id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: { stock: currentStock - item.quantity },
        }),
      });
    }
  };

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
      // ✅ Conversion numérique stricte
      const itemsPayload = items.map(item => {
        const prix = Number(item.prix ?? 0);
        const ajustement = Number(item.variant?.price_adjustment ?? 0);
        const quantity = Number(item.quantite ?? 0);

        const unitPrice = prix + ajustement;          // addition numérique
        const totalPrice = unitPrice * quantity;      // multiplication numérique

        return {
          product_id: Number(item.id),
          product_name: item.nom,
          unit_price: unitPrice,
          quantity,
          total_price: totalPrice,
        };
      });

      const subtotal = itemsPayload.reduce((acc, item) => acc + item.total_price, 0);
      const livraison = Number(fraisLivraison);
      const total = subtotal + livraison;

      const payload: PayloadCommandeFrontend = {
        customer: {
          name: formData.nom_client,
          phone: formData.telephone,
          email: formData.email?.trim() || undefined,
          address: formData.adresse,
        },
        delivery_zone_id: zoneSelectionneeId!,
        items: itemsPayload,
        subtotal,
        delivery_fee: livraison,
        total,
        remarks: formData.remarques || "",
      };

      console.log("Payload à envoyer :", payload);

      await checkAndDecrementStock(payload.items);

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
        description: error.message || "Erreur inconnue",
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
