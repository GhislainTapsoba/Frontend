import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import Link from "next/link";

export function WhatsAppButton() {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

  if (!whatsappNumber) {
    return null; // Ne pas afficher si le numéro n'est pas configuré
  }

  return (
    <Link
      href={`https://wa.me/${whatsappNumber}`}
      target="_blank"
      rel="noopener noreferrer nofollow"
      aria-label="Contacter via WhatsApp"
      className="fixed bottom-6 right-6 z-50"
    >
      <Button
        size="lg"
        className="rounded-full w-16 h-16 shadow-lg bg-green-600 hover:bg-green-700 text-white"
        aria-hidden="true"
      >
        <MessageCircle className="h-8 w-8" />
      </Button>
    </Link>
  );
}
