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
  const [isCalculatingFee, setIsCalculatingFee] = useState(false);

  useEffect(() => {
    if (items.length === 0) router.push("/panier");
  }, [items.length, router]);

  // --- Fonction améliorée de validation des items du panier ---
  const validateCartItems = async () => {
    const STRAPI_BASE_URL = process.env.NEXT_PUBLIC_STRAPI_URL;
    const STRAPI_TOKEN = process.env.NEXT_PUBLIC_STRAPI_TOKEN;
    
    if (!STRAPI_BASE_URL || !STRAPI_TOKEN) return;

    console.log("=== VALIDATION DES ITEMS DU PANIER ===");
    console.log("Items dans le panier:", items.map(item => ({
      id: item.id,
      nom: item.nom,
      quantité: item.quantite
    })));

    const invalidItems: number[] = [];

    try {
      // Récupérer tous les produits disponibles
      const res = await fetch(`${STRAPI_BASE_URL}/api/produits?populate=*&pagination[limit]=1000`, {
        headers: {
          Authorization: `Bearer ${STRAPI_TOKEN}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        console.error("Impossible de valider le panier - erreur Strapi");
        return;
      }

      const data = await res.json();
      const availableProducts = data.data || [];
      const availableIds = availableProducts.map((p: any) => Number(p.id));
      
      console.log("Produits disponibles dans Strapi:", availableIds);

      // Vérifier chaque item du panier
      for (const item of items) {
        const itemId = Number(item.id);
        if (!availableIds.includes(itemId)) {
          console.warn(`❌ Produit ${itemId} (${item.nom}) n'existe plus dans Strapi`);
          invalidItems.push(itemId);
        } else {
          // Vérifier aussi le stock si la gestion est activée
          const product = availableProducts.find((p: any) => Number(p.id) === itemId);
          const gererStock = product?.attributes?.gerer_stock;
          const enStock = product?.attributes?.en_stock;
          const stock = Number(product?.attributes?.quantite_stock ?? 0);
          
          if (gererStock && (!enStock || stock === 0)) {
            console.warn(`❌ Produit ${itemId} (${item.nom}) n'est plus en stock`);
            invalidItems.push(itemId);
          }
        }
      }

      // Informer l'utilisateur si des produits ont été supprimés
      if (invalidItems.length > 0) {
        console.log("Produits à supprimer du panier:", invalidItems);
        toast({
          title: "Panier mis à jour",
          description: `${invalidItems.length} produit(s) non disponible(s) supprimé(s) du panier`,
          variant: "default",
        });
        
        // Note: Vous devrez implémenter removeItems dans votre hook useCart
        // ou appeler une fonction pour supprimer ces items
      } else {
        console.log("✅ Tous les produits du panier sont disponibles");
      }
      
    } catch (error) {
      console.error("Erreur lors de la validation du panier:", error);
    }
    
    console.log("=== FIN VALIDATION PANIER ===");
  };

  // Valider les items du panier au chargement
  useEffect(() => {
    if (items.length > 0) {
      validateCartItems();
    }
    
    // Test de connexion Strapi
    testStrapiConnection();
  }, []);

  // Test de connexion Strapi
  const testStrapiConnection = async () => {
    const STRAPI_BASE_URL = process.env.NEXT_PUBLIC_STRAPI_URL;
    const STRAPI_TOKEN = process.env.NEXT_PUBLIC_STRAPI_TOKEN;
    
    console.log("=== Test Strapi ===");
    console.log("STRAPI_BASE_URL:", STRAPI_BASE_URL);
    console.log("STRAPI_TOKEN:", STRAPI_TOKEN ? "✅ Défini" : "❌ Manquant");
    
    if (!STRAPI_BASE_URL) {
      console.error("❌ NEXT_PUBLIC_STRAPI_URL n'est pas défini");
      return;
    }

    try {
      // Test sans token (permissions publiques)
      console.log("Test 1: Requête sans token...");
      const resPublic = await fetch(`${STRAPI_BASE_URL}/api/produits?populate=*`);
      console.log("Status sans token:", resPublic.status);
      
      if (resPublic.ok) {
        const dataPublic = await resPublic.json();
        console.log("✅ Connexion publique réussie, nombre de produits:", dataPublic.data?.length || 0);
      } else {
        console.log("❌ Connexion publique échouée");
      }

      // Test avec token si disponible
      if (STRAPI_TOKEN) {
        console.log("Test 2: Requête avec token...");
        const resWithToken = await fetch(`${STRAPI_BASE_URL}/api/produits?populate=*`, {
          headers: {
            Authorization: `Bearer ${STRAPI_TOKEN}`,
            "Content-Type": "application/json",
          },
        });
        console.log("Status avec token:", resWithToken.status);
        
        if (resWithToken.ok) {
          const dataWithToken = await resWithToken.json();
          console.log("✅ Connexion avec token réussie, nombre de produits:", dataWithToken.data?.length || 0);
          
          // Lister les IDs disponibles
          const ids = dataWithToken.data?.map((p: any) => p.id) || [];
          console.log("IDs disponibles:", ids);
        } else {
          const errorText = await resWithToken.text();
          console.log("❌ Connexion avec token échouée:", errorText);
        }
      }
    } catch (error) {
      console.error("Erreur test Strapi:", error);
    }
    console.log("=== Fin Test Strapi ===");
  };

  // --- Vérification et décrémentation du stock Strapi v5 AMÉLIORÉE ---
  const checkAndDecrementStock = async (items: PayloadCommandeFrontend["items"]) => {
    const STRAPI_BASE_URL = process.env.NEXT_PUBLIC_STRAPI_URL;
    const STRAPI_TOKEN = process.env.NEXT_PUBLIC_STRAPI_TOKEN;
    
    if (!STRAPI_BASE_URL || !STRAPI_TOKEN) {
      throw new Error("Configuration Strapi manquante");
    }

    console.log("=== DÉBUT VÉRIFICATION STOCK ===");
    console.log("Items à vérifier:", items.map(i => ({ id: i.product_id, nom: i.product_name, qté: i.quantity })));

    const ruptures: string[] = [];
    const productsToUpdate: { id: number; nom: string; currentStock: number; newStock: number }[] = [];

    // Récupérer tous les produits d'abord
    console.log("Récupération de tous les produits depuis Strapi...");
    try {
      const allProductsRes = await fetch(`${STRAPI_BASE_URL}/api/produits?populate=*&pagination[limit]=1000`, {
        headers: {
          Authorization: `Bearer ${STRAPI_TOKEN}`,
          "Content-Type": "application/json",
        },
      });

      if (!allProductsRes.ok) {
        const errorText = await allProductsRes.text();
        console.error("Erreur récupération produits:", errorText);
        throw new Error(`Impossible de récupérer les produits (status ${allProductsRes.status})`);
      }

      const allProductsData = await allProductsRes.json();
      const allProducts = allProductsData.data || [];
      
      console.log("Produits récupérés:", allProducts.length);
      console.log("Liste des produits Strapi:", allProducts.map((p: any) => ({
        id: p.id,
        nom: p.attributes?.nom,
        stock: p.attributes?.quantite_stock,
        gerer_stock: p.attributes?.gerer_stock,
        en_stock: p.attributes?.en_stock
      })));

      // DIAGNOSTIC : Vérifier la correspondance des IDs
      console.log("=== DIAGNOSTIC IDs ===");
      console.log("IDs dans le panier:", items.map(i => ({ id: Number(i.product_id), nom: i.product_name })));
      console.log("IDs disponibles Strapi:", allProducts.map((p: any) => ({ id: Number(p.id), nom: p.attributes?.nom })));
      
      // Chercher des correspondances par nom si l'ID ne correspond pas
      for (const item of items) {
        const foundById = allProducts.find((p: any) => Number(p.id) === Number(item.product_id));
        const foundByName = allProducts.find((p: any) => 
          p.attributes?.nom?.toLowerCase().includes(item.product_name?.toLowerCase()) || 
          item.product_name?.toLowerCase().includes(p.attributes?.nom?.toLowerCase())
        );
        
        console.log(`Item "${item.product_name}" (ID panier: ${item.product_id}):`);
        console.log("- Trouvé par ID:", foundById ? `✅ ID ${foundById.id}` : "❌ Non");
        console.log("- Trouvé par nom:", foundByName ? `✅ ID ${foundByName.id} "${foundByName.attributes?.nom}"` : "❌ Non");
      }
      console.log("=== FIN DIAGNOSTIC ===");

      // Vérifier chaque item du panier
      for (const item of items) {
        console.log(`\n--- Vérification produit ID: ${item.product_id} ---`);
        console.log("Nom dans panier:", item.product_name);
        console.log("Quantité demandée:", item.quantity);

        // Chercher le produit dans la liste (conversion en nombre pour être sûr)
        let product = allProducts.find((p: any) => Number(p.id) === Number(item.product_id));
        
        // Si pas trouvé par ID, essayer de trouver par nom (fallback)
        if (!product) {
          console.warn(`⚠️ Produit ID ${item.product_id} non trouvé, tentative de recherche par nom...`);
          product = allProducts.find((p: any) => 
            p.attributes?.nom?.toLowerCase().trim() === item.product_name?.toLowerCase().trim()
          );
          
          if (product) {
            console.log(`✅ Produit trouvé par nom ! ID correct: ${product.id} (au lieu de ${item.product_id})`);
            // Optionnel: mettre à jour l'ID dans l'item pour les prochaines utilisations
            item.product_id = Number(product.id);
          }
        }
        
        if (!product) {
          console.error("❌ Produit non trouvé dans Strapi!");
          console.log("ID recherché:", item.product_id, "Type:", typeof item.product_id);
          console.log("Nom recherché:", item.product_name);
          console.log("IDs disponibles:", allProducts.map((p: any) => ({ id: p.id, type: typeof p.id })));
          throw new Error(`Produit "${item.product_name}" introuvable dans Strapi (ID: ${item.product_id})`);
        }

        console.log("✅ Produit trouvé dans Strapi:", product.attributes?.nom);
        
        // Vérifier la gestion du stock
        const gererStock = product.attributes?.gerer_stock;
        const enStock = product.attributes?.en_stock;
        
        console.log("Gestion stock activée:", gererStock);
        console.log("Marqué en stock:", enStock);

        if (!gererStock) {
          console.log("⚠️ Gestion de stock désactivée pour ce produit - pas de vérification");
          continue;
        }

        if (!enStock) {
          console.log("❌ Produit marqué comme non disponible");
          ruptures.push(`${item.product_name} (produit indisponible)`);
          continue;
        }

        // Récupérer le stock actuel
        const stockActuel = Number(product.attributes?.quantite_stock ?? 0);
        
        console.log("Stock actuel dans Strapi:", stockActuel);
        console.log("Quantité demandée:", item.quantity);

        if (item.quantity > stockActuel) {
          console.log("❌ Stock insuffisant");
          ruptures.push(`${item.product_name} (disponible: ${stockActuel}, demandé: ${item.quantity})`);
        } else {
          const nouveauStock = stockActuel - item.quantity;
          console.log("✅ Stock suffisant - nouveau stock après commande:", nouveauStock);
          
          productsToUpdate.push({ 
            id: Number(product.id), 
            nom: product.attributes?.nom,
            currentStock: stockActuel,
            newStock: nouveauStock 
          });
        }
      }

      console.log("\n=== RÉSUMÉ VÉRIFICATION ===");
      console.log("Ruptures de stock:", ruptures);
      console.log("Produits à mettre à jour:", productsToUpdate);

      if (ruptures.length > 0) {
        throw new Error(`Stock insuffisant pour : ${ruptures.join(", ")}`);
      }

      // Procéder à la décrémentation des stocks
      console.log("\n=== MISE À JOUR DES STOCKS ===");
      
      for (const p of productsToUpdate) {
        console.log(`Mise à jour stock produit ${p.id} (${p.nom}): ${p.currentStock} → ${p.newStock}`);
        
        try {
          const updateRes = await fetch(`${STRAPI_BASE_URL}/api/produits/${p.id}`, {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${STRAPI_TOKEN}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ 
              data: { 
                quantite_stock: p.newStock,
                // Si le stock tombe à 0, marquer comme non disponible
                en_stock: p.newStock > 0
              } 
            }),
          });

          if (!updateRes.ok) {
            const errorText = await updateRes.text();
            console.error(`❌ Erreur mise à jour stock pour produit ${p.id}:`, errorText);
            throw new Error(`Impossible de mettre à jour le stock du produit "${p.nom}"`);
          }

          const updatedProduct = await updateRes.json();
          console.log(`✅ Stock mis à jour avec succès pour "${p.nom}"`);
          console.log("Nouveau stock confirmé:", updatedProduct.data?.attributes?.quantite_stock);
          
        } catch (error) {
          console.error(`Erreur critique lors de la mise à jour du stock:`, error);
          throw error;
        }
      }

      console.log("=== FIN VÉRIFICATION STOCK - SUCCÈS ===");

    } catch (error) {
      console.error("Erreur lors de la vérification/mise à jour du stock:", error);
      throw error;
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

    if (fraisLivraison === 0 && zoneSelectionneeId) {
      toast({
        title: "Livraison offerte",
        description: "Les frais de livraison sont à 0 FCFA quand les achats atteignent 50 000 FCFA.",
        variant: "default",
      });
      // On continue la commande normalement
    }

    setIsSubmitting(true);

    try {
      // --- Version améliorée du mapping des items ---
      const itemsPayload = items.map(item => {
        console.log("Mapping item:", {
          id: item.id,
          nom: item.nom,
          prix: item.prix,
          variant: item.variant,
          quantite: item.quantite
        });

        const prixBase = parseFloat(String(item.prix || 0));
        const ajustementVariante = parseFloat(String(item.variant?.price_adjustment || 0));
        const quantite = parseInt(String(item.quantite || 0), 10);

        if (isNaN(prixBase) || isNaN(ajustementVariante) || isNaN(quantite)) {
          console.error("Données invalides pour:", item);
          throw new Error(`Données invalides pour le produit "${item.nom}"`);
        }

        if (quantite <= 0) {
          throw new Error(`Quantité invalide pour le produit "${item.nom}"`);
        }

        const prixUnitaire = prixBase + ajustementVariante;
        const prixTotal = prixUnitaire * quantite;

        const mappedItem = {
          product_id: Number(item.id), // Conversion explicite en nombre
          product_name: item.nom,
          unit_price: Math.round(prixUnitaire * 100) / 100,
          quantity: quantite,
          total_price: Math.round(prixTotal * 100) / 100,
        };

        console.log("Item mappé:", mappedItem);
        return mappedItem;
      });

      console.log("Items du panier bruts:", items);
      console.log("Items transformés:", itemsPayload);

      const sousTotal = itemsPayload.reduce((acc, item) => acc + item.total_price, 0);
      const fraisLivraisonNum = parseFloat(String(fraisLivraison || 0));
      
      if (isNaN(fraisLivraisonNum)) {
        throw new Error("Frais de livraison invalides");
      }

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
      console.log("Vérification du stock...");
      await checkAndDecrementStock(payload.items);
      console.log("Stock vérifié et mis à jour avec succès");

      // Création de la commande dans Laravel
      console.log("Création de la commande Laravel...");
      const nouvelleCommande: ReponseCommandeLaravel = await creerCommande(payload);
      console.log("Commande créée avec succès:", nouvelleCommande);

      clearCart();
      router.push(`/commande/confirmation?orderNumber=${nouvelleCommande.order_number}`);

      toast({
        title: "Commande réussie",
        description: "Votre commande a été créée avec succès !",
        variant: "default",
      });
    } catch (error: any) {
      console.error("Erreur création commande :", error);
      
      // Messages d'erreur plus spécifiques
      let errorMessage = "Une erreur est survenue lors de la création de la commande";
      
      if (error.message?.includes("introuvable")) {
        errorMessage = "Un des produits de votre panier n'est plus disponible. Veuillez actualiser la page.";
      } else if (error.message?.includes("Stock insuffisant")) {
        errorMessage = error.message;
      } else if (error.message?.includes("Configuration Strapi manquante")) {
        errorMessage = "Erreur de configuration. Veuillez contacter le support.";
      } else if (error.message?.includes("Données invalides")) {
        errorMessage = error.message;
      } else if (error.message?.includes("Quantité invalide")) {
        errorMessage = error.message;
      }

      toast({
        title: "Erreur",
        description: errorMessage,
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
          <OrderForm onSubmit={handleOrderSubmit} isSubmitting={isSubmitting || isCalculatingFee} />
          {isCalculatingFee && (
            <div className="text-center text-purple-600 mt-4">
              <span>Calcul des frais de livraison en cours...</span>
            </div>
          )}
        </div>
        <div className="lg:col-span-1">
          <CartSummary
            onDeliveryFeeChange={setFraisLivraison}
            onZoneSelect={setZoneSelectionneeId}
            selectedZoneId={zoneSelectionneeId}
            isCalculatingFee={isCalculatingFee}
            setIsCalculatingFee={setIsCalculatingFee}
          />
        </div>
      </div>
    </div>
  );
}