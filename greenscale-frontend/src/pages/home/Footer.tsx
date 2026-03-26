// components/Footer.tsx
import React from "react";

const FOOTER_COLUMNS = [
  { title: "Produits", links: ["Bilan Carbone", "Plans d'action", "Reporting ESG", "Analyse du cycle de vie"] },
  { title: "Solutions", links: ["PME", "Entreprises", "Secteur public", "Finance"] },
  { title: "Ressources", links: ["Blog", "Guides", "Webinaires", "Centre d'aide"] },
];

const SOCIAL_ICONS = [
  {
    name: "Facebook",
    href: "#",
    svg: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12a9.995 9.995 0 0 0 7 9.54v-6.77H6.5v-2.77H9V9.5c0-2.48 1.49-3.86 3.77-3.86 1.09 0 2.23.2 2.23.2v2.45h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.44 2.77h-2.34V21.54A9.995 9.995 0 0 0 22 12z"/>
      </svg>
    ),
  },
  {
    name: "Twitter",
    href: "#",
    svg: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19.615 3.184a9.72 9.72 0 0 1 2.6 6.016c0 6.592-5.338 14.19-14.19 14.19-2.82 0-5.443-.82-7.643-2.234.392.047.79.07 1.19.07 2.345 0 4.503-.794 6.217-2.13-2.19-.04-4.033-1.49-4.67-3.482.305.06.618.093.94.093.455 0 .897-.06 1.317-.174-2.29-.46-4.015-2.48-4.015-4.9v-.062c.672.37 1.442.59 2.26.62-1.344-.897-2.23-2.426-2.23-4.16 0-.91.243-1.765.667-2.5 2.438 2.99 6.09 4.96 10.203 5.17-.08-.36-.123-.74-.123-1.13 0-2.73 2.21-4.94 4.94-4.94 1.422 0 2.708.598 3.613 1.56a9.85 9.85 0 0 0 3.13-1.197 9.82 9.82 0 0 1-2.77 2.85z"/>
      </svg>
    ),
  },
];

const Footer: React.FC = () => {
  return (
    <footer className="bg-green-900 text-white">
      <div className="mx-auto max-w-6xl px-6 py-16 lg:grid lg:grid-cols-4 gap-10">
        {/* Logo & Description */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <img src="/Verdustry.svg" alt="Verdustry" className="h-10 w-auto" />
            <span className="font-bold text-lg">Verdustry</span>
          </div>
          <p className="text-sm text-green-200">
            La plateforme carbone des entreprises ambitieuses.
          </p>
          {/* Social Icons */}
          <div className="flex gap-4 mt-2">
            {SOCIAL_ICONS.map((icon) => (
              <a key={icon.name} href={icon.href} className="hover:text-emerald-400 transition-colors">
                {icon.svg}
              </a>
            ))}
          </div>
        </div>

        {/* Footer Columns */}
        {FOOTER_COLUMNS.map((col) => (
          <div key={col.title} className="space-y-3">
            <h3 className="text-white font-semibold tracking-wide">{col.title}</h3>
            {col.links.map((link) => (
              <a
                key={link}
                href="#"
                className="block text-green-200 hover:text-emerald-400 transition-colors"
              >
                {link}
              </a>
            ))}
          </div>
        ))}
      </div>

      {/* Footer Bottom */}
      <div className="border-t border-green-800 py-6 text-center text-sm text-green-300">
        © 2026 Verdustry • Tous droits réservés • Politique de confidentialité • Mentions légales
      </div>
    </footer>
  );
};

export default Footer;