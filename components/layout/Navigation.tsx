import Link from "next/link";

interface NavigationProps {
  onLinkClick?: () => void;
}

export function Navigation({ onLinkClick }: NavigationProps) {
  const navLinks = [
    { href: "/", label: "Accueil" },
    { href: "/produits", label: "Produits" },
    { href: "/a-propos", label: "À propos" },
    { href: "/contact", label: "Contact" },
    { href: "/conditions-generales", label: "Conditions Générales" },
    { href: "/conditions-livraison", label: "Conditions de Livraison" },
    { href: "/faq", label: "FAQ" },
  ];

  return (
    <nav aria-label="Navigation principale">
      <ul className="space-y-4">
        {navLinks.map(({ href, label }) => (
          <li key={href}>
            <Link
              href={href}
              className="block text-lg font-medium text-gray-700 hover:text-gray-900 transition-colors"
              onClick={onLinkClick}
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
