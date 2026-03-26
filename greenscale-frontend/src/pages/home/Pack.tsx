import MarketingNavbar from "@/components/marketing/MarketingNavbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { type CSSProperties, useState } from "react";
import Footer from "./Footer";

const PACKS = [
  {
    id: 1,
    tag: "Pack 1",
    title: "Mesure de l'Émission Carbone",
    tagline: "Suivez et réduisez vos émissions de GES grâce à une solution automatisée.",
    icon: "🌡️",
    color: "#16a34a",
    colorLight: "#dcfce7",
    colorBorder: "#86efac",
    gradient: "linear-gradient(135deg, #052e16 0%, #14532d 100%)",
    features: [
      { icon: "⚡", text: "Collecte automatique des données (ERP, Excel ou factures)" },
      { icon: "📊", text: "Mesure de l'empreinte carbone (Scopes 1, 2, 3)" },
      { icon: "📡", text: "Suivi temps réel" },
      { icon: "📋", text: "Rapports carbone conformes aux standards ESG" },
    ],
    badge: "Le plus populaire",
    badgeBg: "#16a34a",
  },
  {
    id: 2,
    tag: "Pack 2",
    title: "Analyse ACV de Production",
    tagline: "Analysez l'impact environnemental de vos produits sur tout leur cycle de vie.",
    icon: "♻️",
    color: "#0891b2",
    colorLight: "#cffafe",
    colorBorder: "#67e8f9",
    gradient: "linear-gradient(135deg, #083344 0%, #164e63 100%)",
    features: [
      { icon: "🔗", text: "Intégration des données (production, matières, fournisseurs)" },
      { icon: "🔄", text: "Analyse des flux de matières première jusqu'au produit final" },
      { icon: "🎯", text: "Identification des leviers d'éco-conception" },
      { icon: "💡", text: "Aide à la prise de décision durable" },
    ],
    badge: null,
    badgeBg: null,
  },
  {
    id: 3,
    tag: "Pack 3",
    title: "Édition de Rapport ESG",
    tagline: "Pilotez votre conformité et votre performance ESG en toute simplicité.",
    icon: "📑",
    color: "#7c3aed",
    colorLight: "#ede9fe",
    colorBorder: "#c4b5fd",
    gradient: "linear-gradient(135deg, #2e1065 0%, #4c1d95 100%)",
    features: [
      { icon: "🗄️", text: "Centralisation des données (ERP, fichiers, capteurs IoT)" },
      { icon: "🗑️", text: "Suivi des déchets et des matières" },
      { icon: "🤖", text: "Reporting ESG automatisé (CSRD, export)" },
      { icon: "✅", text: "Assurance de la conformité aux standards ESG" },
    ],
    badge: "CSRD Ready",
    badgeBg: "#7c3aed",
  },
  {
    id: 4,
    tag: "Pack 4",
    title: "Package Personnalisé",
    tagline: "Une solution adaptée aux besoins spécifiques des entreprises.",
    icon: "🛠️",
    color: "#b45309",
    colorLight: "#fef3c7",
    colorBorder: "#fcd34d",
    gradient: "linear-gradient(135deg, #451a03 0%, #78350f 100%)",
    features: [
      { icon: "🧩", text: "Modules Carbone, ACV et ESG combinables" },
      { icon: "🔌", text: "Intégration ERP et capteurs IoT" },
      { icon: "⚙️", text: "Fonctionnalités sur mesure" },
      { icon: "🤝", text: "Accompagnement personnalisé" },
    ],
    badge: "Sur mesure",
    badgeBg: "#b45309",
  },
];

const STATS = [
  { val: "70%", label: "Gain de temps sur le reporting" },
  { val: "4", label: "Solutions modulables" },
  { val: "100%", label: "Conformité CSRD & CBAM" },
  { val: "24/7", label: "Suivi temps réel" },
];

const INTEGRATIONS = [
  { name: "ERP", icon: "🏢" },
  { name: "Excel", icon: "📊" },
  { name: "Factures", icon: "🧾" },
  { name: "IoT", icon: "📡" },
  { name: "API", icon: "⚙️" },
  { name: "Cloud", icon: "☁️" },
];

const PROCESS = [
  { step: "01", title: "Diagnostic", desc: "Analyse de vos besoins et de votre maturité ESG" },
  { step: "02", title: "Configuration", desc: "Paramétrage personnalisé et intégration de vos sources de données" },
  { step: "03", title: "Déploiement", desc: "Mise en production accompagnée par nos experts" },
  { step: "04", title: "Optimisation", desc: "Suivi continu et amélioration de votre performance" },
];

export function SolutionsPage() {
  const [hoveredPack, setHoveredPack] = useState<number | null>(null);

  const gridBgStyle: CSSProperties = {
    backgroundImage:
      "linear-gradient(hsl(var(--primary) / 0.08) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary) / 0.08) 1px, transparent 1px)",
    backgroundSize: "60px 60px",
  };

  const heroGlowStyle: CSSProperties = {
    background:
      "radial-gradient(ellipse, hsl(var(--primary) / 0.22) 0%, transparent 70%)",
  };

  const ctaGlowStyle: CSSProperties = {
    background:
      "radial-gradient(circle at 50% 50%, hsl(var(--primary) / 0.22) 0%, transparent 60%)",
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <MarketingNavbar />

      {/* HERO */}
      <section className="relative overflow-hidden bg-foreground text-background">
        <div className="absolute inset-0 opacity-100" style={gridBgStyle} />
        <div
          className="pointer-events-none absolute -top-52 left-1/2 h-[520px] w-[820px] -translate-x-1/2"
          style={heroGlowStyle}
        />

        <div className="relative mx-auto max-w-6xl px-4 pt-28 pb-20 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold tracking-[0.16em] text-emerald-200">
                ✦ Nos Solutions
              </span>

              <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl">
                Une plateforme,
                <br />
                <span className="text-emerald-300">quatre solutions</span>
                <br />
                ESG puissantes
              </h1>

              <p className="mt-5 max-w-xl text-base leading-7 text-background/65 sm:text-lg">
                De la mesure des émissions carbone au reporting ESG complet — choisissez le pack adapté à votre entreprise et passez à la conformité en quelques semaines.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild className="h-11 bg-emerald-600 px-7 text-white shadow-[0_0_30px_hsl(var(--primary)_/_0.35)] hover:bg-emerald-700">
                  <a href="#packs">Découvrir les packs →</a>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  className="h-11 border-white/15 bg-white/5 px-7 text-white hover:bg-white/10 hover:text-white"
                >
                  <a href="#contact">Parler à un expert</a>
                </Button>
              </div>
            </div>

            <div className="hidden grid-cols-2 gap-3 lg:grid">
              {[
                { icon: "🌡️", title: "Émissions Carbone", sub: "Scopes 1, 2 & 3 automatisés" },
                { icon: "♻️", title: "Analyse ACV", sub: "Cycle de vie produit" },
                { icon: "📑", title: "Rapport ESG", sub: "CSRD conforme & automatisé" },
                { icon: "🛠️", title: "Sur Mesure", sub: "Modules combinables" },
              ].map((c) => (
                <Card
                  key={c.title}
                  className="rounded-2xl border-white/10 bg-white/5 text-white shadow-none transition-colors hover:border-white/25"
                >
                  <CardContent className="p-6">
                    <div className="text-2xl">{c.icon}</div>
                    <div className="mt-3 text-sm font-semibold tracking-tight">{c.title}</div>
                    <div className="mt-1 text-xs leading-5 text-white/50">{c.sub}</div>
                  </CardContent>
                </Card>
              ))}

              <Card className="col-span-2 rounded-2xl border-emerald-400/20 bg-emerald-500/10 text-white shadow-none">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="text-3xl">🤖</div>
                  <div>
                    <div className="text-sm font-semibold tracking-tight">IA ProVerdy</div>
                    <div className="mt-1 text-xs leading-5 text-white/55">
                      Collecte, calcul et rapport automatisés par intelligence artificielle — intégration ERP, Excel & IoT
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="border-y border-emerald-200/70 bg-emerald-50/70">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-4xl font-extrabold tracking-tight text-emerald-600">{s.val}</div>
                <div className="mt-1 text-xs font-medium text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PACKS */}
      <section className="py-20 sm:py-24" id="packs">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-600">
              <span className="h-0.5 w-5 rounded bg-emerald-600" />
              Packages
            </div>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Choisissez votre <span className="text-emerald-600">solution</span>
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
              Des packs modulables conçus pour s'adapter à chaque étape de votre maturité ESG — du premier bilan carbone au reporting CSRD complet.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {PACKS.map((pack) => {
              const isHovered = hoveredPack === pack.id;
              return (
                <div
                  key={pack.id}
                  className={cn(
                    "group flex flex-col overflow-hidden rounded-2xl border bg-card transition-[transform,box-shadow,border-color] duration-300",
                    "hover:-translate-y-1 hover:shadow-2xl"
                  )}
                  onMouseEnter={() => setHoveredPack(pack.id)}
                  onMouseLeave={() => setHoveredPack(null)}
                  style={{
                    borderColor: isHovered ? pack.colorBorder : "hsl(var(--border))",
                    boxShadow: isHovered ? `0 20px 60px ${pack.color}18` : undefined,
                  }}
                >
                  <div className="relative px-8 pt-8 pb-6 text-white" style={{ background: pack.gradient }}>
                    <div className="pointer-events-none absolute right-6 top-6 text-6xl font-extrabold opacity-10">
                      {pack.id}
                    </div>

                    {pack.badge && (
                      <div className="mb-4">
                        <span
                          className="inline-flex rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.10em] text-white"
                          style={{ background: pack.color }}
                        >
                          {pack.badge}
                        </span>
                      </div>
                    )}

                    <div className="text-3xl">{pack.icon}</div>
                    <div className="mt-3 text-xs font-extrabold uppercase tracking-[0.16em] text-white/60">{pack.tag}</div>
                    <div className="mt-2 text-xl font-extrabold tracking-tight">{pack.title}</div>
                    <div className="mt-2 text-sm leading-6 text-white/65">{pack.tagline}</div>
                  </div>

                  <div className="flex-1 px-8 py-6">
                    {pack.features.map((f, idx) => (
                      <div
                        key={idx}
                        className={cn(
                          "flex gap-3 py-3",
                          idx !== pack.features.length - 1 && "border-b border-border/60"
                        )}
                      >
                        <div
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[15px]"
                          style={{ background: pack.colorLight }}
                        >
                          {f.icon}
                        </div>
                        <div className="pt-1 text-sm font-medium leading-6 text-foreground/85">{f.text}</div>
                      </div>
                    ))}
                  </div>

                  <a
                    href="#contact"
                    className="mx-8 mb-8 inline-flex items-center justify-center rounded-xl border-2 px-4 py-3 text-sm font-bold transition-colors"
                    style={{
                      borderColor: pack.color,
                      color: isHovered ? "#fff" : pack.color,
                      background: isHovered ? pack.color : "transparent",
                    }}
                  >
                    {pack.id === 4 ? "Demander un devis →" : "Démarrer ce pack →"}
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* COMPARISON TABLE */}
      <section className="bg-muted/30 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-600">
              <span className="h-0.5 w-5 rounded bg-emerald-600" />
              Comparaison
            </div>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Toutes les <span className="text-emerald-600">fonctionnalités</span> en un coup d'œil
            </h2>
          </div>

          <div className="overflow-hidden rounded-2xl border bg-card">
            <table className="hidden w-full border-separate border-spacing-0 lg:table">
              <thead>
                <tr className="text-sm">
                  <th className="bg-muted/50 px-6 py-5 text-left text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    Fonctionnalité
                  </th>
                  <th className="bg-emerald-950 px-6 py-5 text-center font-extrabold text-white">🌡️ Pack 1</th>
                  <th className="bg-cyan-950 px-6 py-5 text-center font-extrabold text-white">♻️ Pack 2</th>
                  <th className="bg-violet-950 px-6 py-5 text-center font-extrabold text-white">📑 Pack 3</th>
                  <th className="bg-amber-950 px-6 py-5 text-center font-extrabold text-white">🛠️ Pack 4</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {[
                  ["Collecte automatique (ERP, Excel)", "✓", "✓", "✓", "✓"],
                  ["Mesure Scope 1, 2, 3", "✓", "✓", "✓", "✓"],
                  ["Suivi temps réel", "✓", "—", "✓", "✓"],
                  ["Rapports carbone ESG", "✓", "—", "✓", "✓"],
                  ["Analyse cycle de vie (ACV)", "—", "✓", "—", "✓"],
                  ["Identification leviers éco-conception", "—", "✓", "—", "✓"],
                  ["Centralisation données IoT", "—", "—", "✓", "✓"],
                  ["Suivi déchets & matières", "—", "—", "✓", "✓"],
                  ["Reporting CSRD automatisé", "—", "—", "✓", "✓"],
                  ["Modules sur mesure", "—", "—", "—", "✓"],
                  ["Accompagnement personnalisé", "—", "—", "—", "✓"],
                ].map(([feature, ...vals], rowIdx) => (
                  <tr key={feature as string} className={rowIdx % 2 === 1 ? "bg-muted/10" : undefined}>
                    <td className="whitespace-nowrap px-6 py-4 font-semibold text-foreground">
                      {feature}
                    </td>
                    {vals.map((v, i) => (
                      <td key={i} className={cn("border-t px-6 py-4 text-center", i === 2 && "bg-emerald-50/70")}>
                        {v === "✓" ? (
                          <span className="text-lg font-bold text-emerald-600">✓</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="block p-6 text-sm text-muted-foreground lg:hidden">
              La comparaison détaillée est disponible sur grand écran.
            </div>
          </div>
        </div>
      </section>

      {/* INTEGRATIONS */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-600">
            <span className="h-0.5 w-5 rounded bg-emerald-600" />
            Intégrations
          </div>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Compatible avec vos <span className="text-emerald-600">outils existants</span>
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
            Connectez ProVerdy à vos sources de données en quelques clics, sans développement technique.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {INTEGRATIONS.map((i) => (
              <div
                key={i.name}
                className="inline-flex items-center gap-2 rounded-full border bg-card px-5 py-2 text-sm font-semibold text-foreground/85 transition-colors hover:border-emerald-200 hover:bg-emerald-50"
              >
                <span className="text-base">{i.icon}</span>
                <span>{i.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="bg-muted/30 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-600">
              <span className="h-0.5 w-5 rounded bg-emerald-600" />
              Comment ça marche
            </div>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Déployé en <span className="text-emerald-600">4 étapes</span>
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
              De la signature à la première publication de rapport, nos experts vous accompagnent à chaque phase.
            </p>
          </div>

          <div className="relative grid gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-0">
            <div className="pointer-events-none absolute left-[calc(12.5%+28px)] right-[calc(12.5%+28px)] top-7 hidden h-0.5 bg-gradient-to-r from-emerald-600 to-emerald-300 lg:block" />
            {PROCESS.map((p) => (
              <div key={p.step} className="relative z-10 px-4 text-center">
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border-2 border-emerald-600 bg-background text-sm font-extrabold text-emerald-600 shadow-[0_0_0_6px_hsl(var(--primary)_/_0.18)]">
                  {p.step}
                </div>
                <h4 className="text-base font-extrabold tracking-tight">{p.title}</h4>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-foreground py-24 text-center text-background" id="contact">
        <div className="absolute inset-0" style={ctaGlowStyle} />
        <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
            Prêt à transformer
            <br />
            votre <span className="text-emerald-300">conformité ESG</span> ?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-background/65 sm:text-lg">
            Choisissez le pack qui vous correspond ou parlez à un expert pour une solution sur mesure. Déploiement en quelques semaines.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild className="h-12 bg-emerald-600 px-9 text-white shadow-[0_0_40px_hsl(var(--primary)_/_0.30)] hover:bg-emerald-700">
              <a href="#">Demander une démo gratuite →</a>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-12 border-white/15 bg-white/5 px-9 text-white hover:bg-white/10 hover:text-white"
            >
              <a href="#">Voir nos tarifs</a>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}