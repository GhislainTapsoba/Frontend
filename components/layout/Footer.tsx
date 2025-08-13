import Link from "next/link";

export function Footer() {
  const appName = process.env.NEXT_PUBLIC_APP_NAME || "ECMS";
  const companyEmail = process.env.NEXT_PUBLIC_COMPANY_EMAIL || "contact@example.com";
  const phoneNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || null;
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white py-8">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-lg font-semibold mb-4">{appName}</h3>
          <p className="text-gray-400">Votre destination pour des produits de qualité.</p>
        </div>

        <nav aria-label="Liens rapides">
          <h3 className="text-lg font-semibold mb-4">Liens rapides</h3>
          <ul className="space-y-2">
            <li>
              <Link href="/conditions-generales" className="text-gray-400 hover:text-white transition-colors">
                Conditions Générales de Vente
              </Link>
            </li>
            <li>
              <Link href="/conditions-livraison" className="text-gray-400 hover:text-white transition-colors">
                Conditions de Livraison
              </Link>
            </li>
            <li>
              <Link href="/faq" className="text-gray-400 hover:text-white transition-colors">
                FAQ
              </Link>
            </li>
          </ul>
        </nav>

        <address className="not-italic">
          <h3 className="text-lg font-semibold mb-4">Contact</h3>
          <p className="text-gray-400">
            Email :{" "}
            <a href={`mailto:${companyEmail}`} className="hover:underline">
              {companyEmail}
            </a>
          </p>
          {phoneNumber && (
            <p className="text-gray-400">
              Téléphone :{" "}
              <a
                href={`https://wa.me/${phoneNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
                aria-label={`Contact WhatsApp au ${phoneNumber}`}
              >
                {phoneNumber}
              </a>
            </p>
          )}
        </address>
      </div>

      <div className="mt-8 border-t border-gray-700 pt-4 text-center text-gray-500 text-sm select-none">
        &copy; {currentYear} {appName}. Tous droits réservés.
      </div>
    </footer>
  );
}
