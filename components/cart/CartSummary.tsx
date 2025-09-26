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
  isCalculatingFee?: boolean;
  setIsCalculatingFee?: (val: boolean) => void;
}

export function CartSummary({
  onDeliveryFeeChange,
  onZoneSelect,
  selectedZoneId: propSelectedZoneId,
  isCalculatingFee,
  setIsCalculatingFee,
}: CartSummaryProps) {
  const { getTotalPrice } = useCart();
  const subtotal = Number(getTotalPrice()) || 0;
  const { toast } = useToast();

  const [zonesLivraison, setZonesLivraison] = useState<ZoneLivraison[]>([]);
  const [zoneSelectionnee, setZoneSelectionnee] = useState<ZoneLivraison | null>(null);
  const [fraisLivraison, setFraisLivraison] = useState<number>(0);
  const [isLoadingZones, setIsLoadingZones] = useState(true);
  // Si la page fournit le contrôle, utilise-le, sinon local
  const [localCalculatingFee, setLocalCalculatingFee] = useState(false);
  const calculatingFee = typeof isCalculatingFee === "boolean" ? isCalculatingFee : localCalculatingFee;
  const setCalculatingFee = setIsCalculatingFee || setLocalCalculatingFee;

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
        setCalculatingFee(true);
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
          setCalculatingFee(false);
        }
      } else {
        setFraisLivraison(0);
        onDeliveryFeeChange?.(0);
        setCalculatingFee(false);
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

  const total = Number(subtotal) + Number(fraisLivraison);

  return (
    <div className="bg-gray-800 p-8 rounded-2xl shadow-xl">
      <Card className="bg-transparent border-none shadow-none">
        <CardHeader className="px-0 pb-6">
          <CardTitle className="text-white text-2xl font-semibold">Récapitulatif de la commande</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 px-0">
          <div className="flex justify-between items-center">
            <span className="text-gray-200 text-lg">Sous-total:</span>
            <span className="text-white font-semibold text-lg">{formatPrice(subtotal)}</span>
          </div>

          <div className="space-y-2">
            <Label htmlFor="delivery-zone" className="text-gray-200 font-medium">Zone de livraison</Label>
            {isLoadingZones ? (
              <div className="flex justify-center py-4">
                <LoadingSpinner />
              </div>
            ) : (
              <Select onValueChange={handleZoneChange} value={selectedZoneId?.toString() ?? ""}>
                <SelectTrigger 
                  id="delivery-zone" 
                  className="w-full bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-purple-400 focus:ring-purple-400/20"
                >
                  <SelectValue placeholder="Sélectionnez une zone de livraison" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  {zonesLivraison.map((zone) => (
                    <SelectItem 
                      key={zone.id} 
                      value={zone.id.toString()}
                      className="text-white hover:bg-gray-600 focus:bg-gray-600 cursor-pointer"
                    >
                      {zone.name} ({formatPrice(zone.delivery_fee ?? 0)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-200 text-lg">Frais de livraison:</span>
            {calculatingFee ? (
              <LoadingSpinner />
            ) : (
              <span className="text-white font-semibold text-lg">{formatPrice(fraisLivraison)}</span>
            )}
          </div>

          <Separator className="bg-gray-600" />

          <div className="flex justify-between items-center bg-gradient-to-r from-purple-600/20 to-purple-500/20 p-4 rounded-xl border border-purple-500/30">
            <span className="text-white font-bold text-xl">Total:</span>
            <span className="text-white font-bold text-2xl">{formatPrice(total)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}