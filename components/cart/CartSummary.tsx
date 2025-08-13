"use client";

import { useCart } from "@/lib/hooks/useCart";
import { formatPrice } from "@/lib/utils/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState, useRef } from "react";
import { getZonesLivraison, calculerFraisLivraison } from "@/lib/api/laravel";
import { type ZoneLivraison } from "@/types/laravel";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useToast } from "@/components/ui/use-toast";

interface CartSummaryProps {
  onDeliveryFeeChange?: (fee: number) => void;
  onZoneSelect?: (zoneId: number | null) => void;
  selectedZoneId?: number | null;
}

export function CartSummary({
  onDeliveryFeeChange,
  onZoneSelect,
  selectedZoneId: propSelectedZoneId,
}: CartSummaryProps) {
  const { getTotalPrice } = useCart();
  const subtotal = getTotalPrice();
  const { toast } = useToast();

  const [zonesLivraison, setZonesLivraison] = useState<ZoneLivraison[]>([]);
  const [zoneSelectionnee, setZoneSelectionnee] = useState<ZoneLivraison | null>(null);
  const [fraisLivraison, setFraisLivraison] = useState<number>(0);
  const [isLoadingZones, setIsLoadingZones] = useState(true);
  const [isCalculatingFee, setIsCalculatingFee] = useState(false);

  const selectedZoneId = propSelectedZoneId ?? zoneSelectionnee?.id ?? null;

  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Chargement des zones
  useEffect(() => {
    async function fetchZones() {
      setIsLoadingZones(true);
      try {
        const zones = await getZonesLivraison();
        setZonesLivraison(zones);

        if (propSelectedZoneId) {
          const preSelected = zones.find((z) => z.id === propSelectedZoneId) ?? null;
          setZoneSelectionnee(preSelected);
        }
      } catch (error) {
        console.error("Erreur chargement zones de livraison :", error);
        toast({
          title: "Erreur de chargement",
          description: "Impossible de charger les zones de livraison.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingZones(false);
      }
    }
    fetchZones();
  }, [propSelectedZoneId, toast]);

  // Calcul des frais de livraison avec debounce
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      if (selectedZoneId && subtotal > 0) {
        setIsCalculatingFee(true);
        try {
          const result = await calculerFraisLivraison(selectedZoneId, subtotal);

          const fee = result.delivery_fee ?? 0;
          setFraisLivraison(fee);
          onDeliveryFeeChange?.(fee);

          // Mise à jour de la zone sélectionnée avec les infos retournées par Laravel
          setZoneSelectionnee((prev) => {
            const zone = zonesLivraison.find((z) => z.id === selectedZoneId);
            return zone
              ? { ...zone, delivery_time_min: result.delivery_time_min, delivery_time_max: result.delivery_time_max, zone_name: result.zone_name, delivery_fee: result.delivery_fee }
              : prev;
          });
        } catch (error) {
          console.error("Erreur calcul frais livraison :", error);
          setFraisLivraison(0);
          onDeliveryFeeChange?.(0);
          toast({
            title: "Erreur de calcul",
            description: "Impossible de calculer les frais de livraison.",
            variant: "destructive",
          });
        } finally {
          setIsCalculatingFee(false);
        }
      } else {
        setFraisLivraison(0);
        onDeliveryFeeChange?.(0);
      }
    }, 400); // 400ms debounce

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [selectedZoneId, subtotal, onDeliveryFeeChange, toast, zonesLivraison]);

  // Changement de zone
  const handleZoneChange = (zoneIdString: string) => {
    const id = parseInt(zoneIdString, 10);
    const zone = zonesLivraison.find((z) => z.id === id) ?? null;
    setZoneSelectionnee(zone);
    onZoneSelect?.(zone?.id ?? null);
  };

  const total = subtotal + fraisLivraison;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Récapitulatif de la commande</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between">
          <span>Sous-total:</span>
          <span>{formatPrice(subtotal)}</span>
        </div>

        <div>
          <Label htmlFor="delivery-zone">Zone de livraison</Label>
          {isLoadingZones ? (
            <LoadingSpinner />
          ) : (
            <Select onValueChange={handleZoneChange} value={selectedZoneId?.toString() ?? ""}>
              <SelectTrigger id="delivery-zone" className="w-full">
                <SelectValue placeholder="Sélectionnez une zone de livraison" />
              </SelectTrigger>
              <SelectContent>
                {zonesLivraison.map((zone) => (
                  <SelectItem key={zone.id} value={zone.id.toString()}>
                    {zone.name} ({formatPrice(zone.delivery_fee ?? 0)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="flex justify-between">
          <span>Frais de livraison:</span>
          {isCalculatingFee ? <LoadingSpinner /> : <span>{formatPrice(fraisLivraison)}</span>}
        </div>

        <Separator />

        <div className="flex justify-between font-bold text-lg">
          <span>Total:</span>
          <span>{formatPrice(total)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
