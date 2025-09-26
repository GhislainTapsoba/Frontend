import { Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ContactForm } from "@/components/common/ContactForm";

export default function ContactPage() {
  const companyEmail = process.env.NEXT_PUBLIC_COMPANY_EMAIL || "arseneghislaintaps@gmail.com";
  const whatsappNumberRaw = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "+22605929883";
  // On enlève les caractères non numériques pour le lien WhatsApp (ex: +, espaces)
  const whatsappNumber = whatsappNumberRaw.replace(/\D/g, "");
  const adresse = process.env.NEXT_PUBLIC_ADRESSE || "123 Rue de l'Entreprise, Ville, Pays";

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">Contactez-nous</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white p-8 rounded-lg shadow-md">
        <div className="space-y-6">
          <p className="text-lg text-gray-700">
            Nous sommes là pour répondre à toutes vos questions et vous aider avec vos commandes. N&apos;hésitez pas à nous contacter.
          </p>

          <div className="flex items-center space-x-4">
            <Mail className="h-6 w-6 text-purple-600" />
            <span className="text-lg text-gray-800">
              Email:{" "}
              <a href={`mailto:${companyEmail}`} className="text-purple-600 hover:underline">
                {companyEmail}
              </a>
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <Phone className="h-6 w-6 text-purple-600" />
            <span className="text-lg text-gray-800">Téléphone: {whatsappNumberRaw}</span>
          </div>

          <div className="flex items-center space-x-4">
            <MapPin className="h-6 w-6 text-purple-600" />
            <span className="text-lg text-gray-800">Adresse: {adresse}</span>
          </div>

          <div className="pt-4">
            <Link
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="lg" className="bg-green-500 hover:bg-green-600 text-white flex items-center">
                <Mail className="mr-2 h-5 w-5" />
                Envoyer un message WhatsApp
              </Button>
            </Link>
          </div>
        </div>

        <div>
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
