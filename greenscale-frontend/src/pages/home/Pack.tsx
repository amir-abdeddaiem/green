import MarketingNavbar from "@/components/marketing/MarketingNavbar";
import {
  useState,
  useEffect,
  useRef,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import Footer from "./Footer";

const PACKS = [
  {
    id: 1,
    tag: "Pack 1",
    title: "Mesure de l'Émission Carbone",
    tagline: "Suivez et réduisez vos émissions de GES grâce à une solution automatisée.",
    icon: "🌡️",
    badge: "Le plus populaire",
    headerBg: "from-green-950 to-green-900",
    badgeClass: "bg-green-500 text-white",
    accentText: "text-green-400",
    accentBorder: "border-green-500",
    accentBg: "bg-green-500/10",
    featureIconBg: "bg-green-900/60",
    ctaClass: "bg-green-500 hover:bg-green-400 text-white",
    glowClass: "hover:shadow-green-500/20",
    features: [
      { icon: "⚡", text: "Collecte automatique des données (ERP, Excel ou factures)" },
      { icon: "📊", text: "Mesure de l'empreinte carbone (Scopes 1, 2, 3)" },
      { icon: "📡", text: "Suivi temps réel" },
      { icon: "📋", text: "Rapports carbone conformes aux standards ESG" },
    ],
  },
  {
    id: 2,
    tag: "Pack 2",
    title: "Analyse ACV de Production",
    tagline: "Analysez l'impact environnemental de vos produits sur tout leur cycle de vie.",
    icon: "♻️",
    badge: null,
    headerBg: "from-green-900 to-green-800",
    badgeClass: "",
    accentText: "text-green-300",
    accentBorder: "border-green-400",
    accentBg: "bg-green-400/10",
    featureIconBg: "bg-green-800/60",
    ctaClass: "bg-green-400 hover:bg-green-300 text-white",
    glowClass: "hover:shadow-green-400/20",
    features: [
      { icon: "🔗", text: "Intégration des données (production, matières, fournisseurs)" },
      { icon: "🔄", text: "Analyse des flux de matières première jusqu'au produit final" },
      { icon: "🎯", text: "Identification des leviers d'éco-conception" },
      { icon: "💡", text: "Aide à la prise de décision durable" },
    ],
  },
  {
    id: 3,
    tag: "Pack 3",
    title: "Édition de Rapport ESG",
    tagline: "Pilotez votre conformité et votre performance ESG en toute simplicité.",
    icon: "📑",
    badge: "CSRD Ready",
    headerBg: "from-green-800 to-green-700",
    badgeClass: "bg-green-400 text-white",
    accentText: "text-green-300",
    accentBorder: "border-green-400",
    accentBg: "bg-green-400/10",
    featureIconBg: "bg-green-700/60",
    ctaClass: "bg-green-400 hover:bg-green-300 text-white",
    glowClass: "hover:shadow-green-400/20",
    features: [
      { icon: "🗄️", text: "Centralisation des données (ERP, fichiers, capteurs IoT)" },
      { icon: "🗑️", text: "Suivi des déchets et des matières" },
      { icon: "🤖", text: "Reporting ESG automatisé (CSRD, export)" },
      { icon: "✅", text: "Assurance de la conformité aux standards ESG" },
    ],
  },
  {
    id: 4,
    tag: "Pack 4",
    title: "Package Personnalisé",
    tagline: "Une solution adaptée aux besoins spécifiques des entreprises.",
    icon: "🛠️",
    badge: "Sur mesure",
    headerBg: "from-green-700 to-green-600",
    badgeClass: "bg-green-300 text-white",
    accentText: "text-green-200",
    accentBorder: "border-green-300",
    accentBg: "bg-green-300/10",
    featureIconBg: "bg-green-600/60",
    ctaClass: "bg-green-300 hover:bg-green-200 text-white",
    glowClass: "hover:shadow-green-300/20",
    features: [
      { icon: "🧩", text: "Modules Carbone, ACV et ESG combinables" },
      { icon: "🔌", text: "Intégration ERP et capteurs IoT" },
      { icon: "⚙️", text: "Fonctionnalités sur mesure" },
      { icon: "🤝", text: "Accompagnement personnalisé" },
    ],
  },
];

const STATS = [
  { val: "70%", label: "Gain de temps sur le reporting", icon: "⏱️" },
  { val: "4", label: "Solutions modulables", icon: "🧩" },
  { val: "100%", label: "Conformité CSRD & CBAM", icon: "✅" },
  { val: "24/7", label: "Suivi temps réel", icon: "📡" },
];

const INTEGRATIONS = [
  { name: "SAP ERP", icon: "🏢" },
  { name: "Microsoft Excel", icon: "📊" },
  { name: "Factures PDF", icon: "🧾" },
  { name: "Capteurs IoT", icon: "📡" },
  { name: "REST API", icon: "⚙️" },
  { name: "Google Cloud", icon: "☁️" },
  { name: "Power BI", icon: "📈" },
  { name: "Salesforce", icon: "💼" },
];

const PROCESS = [
  { step: "01", title: "Diagnostic", desc: "Analyse de vos besoins et de votre maturité ESG actuelle", icon: "🔍" },
  { step: "02", title: "Configuration", desc: "Paramétrage personnalisé et intégration de vos sources de données", icon: "⚙️" },
  { step: "03", title: "Déploiement", desc: "Mise en production accompagnée par nos experts certifiés", icon: "🚀" },
  { step: "04", title: "Optimisation", desc: "Suivi continu et amélioration de votre performance ESG", icon: "📈" },
];

const COMPARISON_ROWS = [
  ["Collecte automatique (ERP, Excel)", true, true, true, true],
  ["Mesure Scope 1, 2, 3", true, true, true, true],
  ["Suivi temps réel", true, false, true, true],
  ["Rapports carbone ESG", true, false, true, true],
  ["Analyse cycle de vie (ACV)", false, true, false, true],
  ["Leviers éco-conception", false, true, false, true],
  ["Centralisation données IoT", false, false, true, true],
  ["Suivi déchets & matières", false, false, true, true],
  ["Reporting CSRD automatisé", false, false, true, true],
  ["Modules sur mesure", false, false, false, true],
  ["Accompagnement dédié", false, false, false, true],
];

function useReveal() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState<boolean>(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible] as const;
}

type RevealSectionProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
} & Omit<HTMLAttributes<HTMLDivElement>, "children" | "className" | "style">;

function RevealSection({ children, className = "", style, ...rest }: RevealSectionProps) {
  const [ref, visible] = useReveal();
  return (
    <div
      ref={ref}
      style={style}
      {...rest}
      className={`transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${className}`}
    >
      {children}
    </div>
  );
}

export function SolutionsPage() {
  const [hoveredPack, setHoveredPack] = useState<number | null>(null);
  const [scrolled, setScrolled] = useState<boolean>(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground font-sans">

      <MarketingNavbar/>

      {/* HERO */}
      <section className="relative overflow-hidden pt-32 pb-24">
        {/* Background layers */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_50%,_rgba(34,197,94,0.12)_0%,_transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,_rgba(6,182,212,0.08)_0%,_transparent_60%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(34,197,94,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.04)_1px,transparent_1px)] bg-[size:64px_64px]" />

        {/* Floating orbs */}
        <div className="absolute top-20 left-10 h-64 w-64 rounded-full bg-green-500/5 blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 h-96 w-96 rounded-full bg-cyan-500/5 blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-4 py-1.5 text-xs font-semibold tracking-widest text-green-400 uppercase mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
                </span>
                Plateforme ESG Intelligente
              </div>

              <h1 className="text-5xl font-black tracking-tight leading-[1.08] sm:text-6xl lg:text-7xl">
                <span className="text-foreground">Pilotez votre</span>
                <br />
                <span className="bg-gradient-to-r from-green-400 via-emerald-300 to-cyan-400 bg-clip-text text-transparent">
                  impact carbone
                </span>
                <br />
                <span className="text-foreground">avec l'IA</span>
              </h1>

              <p className="mt-6 text-base leading-7 text-muted-foreground max-w-lg sm:text-lg">
                De la mesure des émissions carbone au reporting ESG complet — choisissez le pack adapté à votre entreprise et passez à la conformité en quelques semaines.
              </p>

              <div className="mt-10 flex flex-col sm:flex-row gap-3">
                <a href="#packs" className="inline-flex items-center justify-center rounded-xl bg-green-500 hover:bg-green-400 transition-all duration-200 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-green-500/25 hover:shadow-green-500/40 hover:-translate-y-0.5">
                  Découvrir les packs →
                </a>
                <a href="#contact" className="inline-flex items-center justify-center rounded-xl border border-border hover:border-foreground/20 bg-card hover:bg-muted transition-all duration-200 px-7 py-3.5 text-sm font-semibold text-foreground">
                  Parler à un expert
                </a>
              </div>

              {/* Trust badges */}
              <div className="mt-10 flex flex-wrap items-center gap-3">
                {["CSRD Conforme", "ISO 14064", "CBAM Ready", "RGPD"].map((b) => (
                  <span key={b} className="rounded-full border border-border/60 bg-card/80 px-3 py-1 text-xs font-medium text-muted-foreground">
                    ✓ {b}
                  </span>
                ))}
              </div>
            </div>

            {/* Hero cards grid */}
            <div className="hidden lg:grid grid-cols-2 gap-3">
              {PACKS.map((p) => (
                <div key={p.id} className={`rounded-2xl border border-border bg-card/60 backdrop-blur p-5 transition-all duration-300 hover:border-foreground/20 hover:-translate-y-1 group`}>
                  <div className="text-2xl mb-3">{p.icon}</div>
                  <div className={`text-xs font-bold uppercase tracking-widest mb-1 ${p.accentText}`}>{p.tag}</div>
                  <div className="text-sm font-semibold text-foreground leading-snug">{p.title}</div>
                </div>
              ))}
              <div className="col-span-2 rounded-2xl border border-green-500/20 bg-green-500/5 p-5 flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-green-500/20 flex items-center justify-center text-xl shrink-0">🤖</div>
                <div>
                  <div className="text-sm font-bold text-foreground">IA Verdustry</div>
                  <div className="text-xs text-muted-foreground mt-0.5 leading-5">Collecte, calcul et rapport automatisés — intégration ERP, Excel & IoT en temps réel</div>
                </div>
                <div className="ml-auto">
                  <span className="flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS STRIP */}
      <section className="border-y border-border/70 bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-border/70">
            {STATS.map((s) => (
              <div key={s.label} className="flex flex-col items-center justify-center py-10 px-4 text-center gap-2">
                <div className="text-2xl">{s.icon}</div>
                <div className="text-4xl font-black tracking-tight text-foreground">{s.val}</div>
                <div className="text-xs text-muted-foreground font-medium leading-snug">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PACKS */}
      <section className="py-24" id="packs">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <RevealSection className="mb-14">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-green-400 mb-4">
              <span className="h-px w-6 bg-green-400" />
              Nos Solutions
            </div>
            <h2 className="text-4xl font-black tracking-tight sm:text-5xl text-foreground">
              Choisissez votre{" "}
              <span className="bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">
                pack ESG
              </span>
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
              Des packs modulables conçus pour s'adapter à chaque étape de votre maturité ESG — du premier bilan carbone au reporting CSRD complet.
            </p>
          </RevealSection>

          <div className="grid gap-5 lg:grid-cols-2">
            {PACKS.map((pack, idx) => {
              const isHovered = hoveredPack === pack.id;
              return (
                <RevealSection key={pack.id} className="" style={{ transitionDelay: `${idx * 100}ms` }}>
                  <div
                    className={`group flex flex-col overflow-hidden rounded-2xl border transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:shadow-2xl ${isHovered ? pack.accentBorder : "border-border"} bg-card ${pack.glowClass}`}
                    onMouseEnter={() => setHoveredPack(pack.id)}
                    onMouseLeave={() => setHoveredPack(null)}
                  >
                    {/* Card header */}
                    <div className={`relative bg-gradient-to-br ${pack.headerBg} px-8 pt-8 pb-7 overflow-hidden`}>
                      <div className="absolute right-6 top-5 text-8xl font-black opacity-[0.06] text-white select-none">
                        {pack.id}
                      </div>
                      <div className="absolute -bottom-6 -right-6 h-32 w-32 rounded-full bg-white/5 blur-2xl" />

                      {pack.badge && (
                        <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-widest mb-5 ${pack.badgeClass}`}>
                          {pack.badge}
                        </span>
                      )}
                      {!pack.badge && <div className="mb-5" />}

                      <div className="text-4xl mb-4">{pack.icon}</div>
                      <div className={`text-xs font-black uppercase tracking-widest mb-2 ${pack.accentText}`}>{pack.tag}</div>
                      <h3 className="text-xl font-black tracking-tight text-foreground">{pack.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{pack.tagline}</p>
                    </div>

                    {/* Features */}
                    <div className="flex-1 px-8 py-6 space-y-1">
                      {pack.features.map((f, i) => (
                        <div
                          key={i}
                          className={`flex items-start gap-4 py-3 ${i !== pack.features.length - 1 ? "border-b border-border/70" : ""}`}
                        >
                          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-base ${pack.featureIconBg}`}>
                            {f.icon}
                          </div>
                          <span className="pt-1.5 text-sm font-medium leading-5 text-foreground">{f.text}</span>
                        </div>
                      ))}
                    </div>

                    {/* CTA */}
                    <div className="px-8 pb-8">
                      <a
                        href="#contact"
                        className={`flex w-full items-center justify-center rounded-xl py-3.5 text-sm font-bold transition-all duration-200 hover:-translate-y-0.5 ${pack.ctaClass}`}
                      >
                        {pack.id === 4 ? "Demander un devis →" : "Démarrer ce pack →"}
                      </a>
                    </div>
                  </div>
                </RevealSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* COMPARISON */}
      <section className="bg-muted/30 py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <RevealSection className="mb-12">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-green-400 mb-4">
              <span className="h-px w-6 bg-green-400" />
              Comparaison
            </div>
            <h2 className="text-4xl font-black tracking-tight sm:text-5xl text-foreground">
              Toutes les{" "}
              <span className="bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">
                fonctionnalités
              </span>{" "}
              en un coup d'œil
            </h2>
          </RevealSection>

          <RevealSection>
            <div className="overflow-hidden rounded-2xl border border-border bg-card">
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full border-separate border-spacing-0">
                  <thead>
                    <tr>
                      <th className="bg-muted/60 px-6 py-5 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground rounded-tl-2xl">
                        Fonctionnalité
                      </th>
                      {[
                        { label: "🌡️ Pack 1", cls: "text-green-400" },
                        { label: "♻️ Pack 2", cls: "text-green-400" },
                        { label: "📑 Pack 3", cls: "text-green-400" },
                        { label: "🛠️ Pack 4", cls: "text-green-400" },
                      ].map((col, i) => (
                        <th
                          key={i}
                          className={`bg-muted/60 px-6 py-5 text-center text-sm font-black ${col.cls} ${i === 3 ? "rounded-tr-2xl" : ""}`}
                        >
                          {col.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {COMPARISON_ROWS.map(([feature, ...vals], rowIdx) => (
                      <tr key={feature} className={rowIdx % 2 === 0 ? "bg-card" : "bg-muted/20"}>
                        <td className="px-6 py-4 text-sm font-semibold text-foreground border-t border-border/60">
                          {feature}
                        </td>
                        {vals.map((v, i) => (
                          <td key={i} className="px-6 py-4 text-center border-t border-border/60">
                            {v ? (
                              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-green-500/15 text-green-400 text-sm font-bold">✓</span>
                            ) : (
                              <span className="text-muted-foreground/70 text-lg">—</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="block lg:hidden p-6 text-sm text-muted-foreground">
                La comparaison détaillée est disponible sur grand écran.
              </div>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* INTEGRATIONS */}
      <section className="py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 text-center">
          <RevealSection>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-green-400 mb-4">
              <span className="h-px w-6 bg-green-400" />
              Intégrations
            </div>
            <h2 className="text-4xl font-black tracking-tight sm:text-5xl text-foreground">
              Compatible avec vos{" "}
              <span className="bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
                outils existants
              </span>
            </h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground max-w-xl mx-auto">
              Connectez Verdustry à vos sources de données en quelques clics, sans développement technique.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              {INTEGRATIONS.map((item) => (
                <div
                  key={item.name}
                  className="inline-flex items-center gap-2.5 rounded-full border border-border/70 bg-card hover:border-green-500/40 hover:bg-green-500/5 transition-all duration-200 px-5 py-2.5 text-sm font-semibold text-foreground cursor-default"
                >
                  <span className="text-base">{item.icon}</span>
                  <span>{item.name}</span>
                </div>
              ))}
            </div>
          </RevealSection>
        </div>
      </section>

      {/* PROCESS */}
      <section className="bg-muted/30 py-24" id="process">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <RevealSection className="mb-16">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-green-400 mb-4">
              <span className="h-px w-6 bg-green-400" />
              Comment ça marche
            </div>
            <h2 className="text-4xl font-black tracking-tight sm:text-5xl text-foreground">
              Déployé en{" "}
              <span className="bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">
                4 étapes
              </span>
            </h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
              De la signature à la première publication de rapport, nos experts vous accompagnent à chaque phase.
            </p>
          </RevealSection>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PROCESS.map((p, idx) => (
              <RevealSection key={p.step}>
                <div className="relative rounded-2xl border border-border bg-card p-7 hover:border-green-500/30 hover:bg-green-500/5 transition-all duration-300 group h-full">
                  {idx < PROCESS.length - 1 && (
                    <div className="hidden lg:block absolute top-10 -right-3 text-muted-foreground/70 text-lg z-10">→</div>
                  )}
                  <div className="text-3xl mb-5">{p.icon}</div>
                  <div className="text-xs font-black uppercase tracking-widest text-green-400 mb-2">{p.step}</div>
                  <h4 className="text-base font-black text-foreground tracking-tight mb-2">{p.title}</h4>
                  <p className="text-sm leading-6 text-muted-foreground">{p.desc}</p>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden py-32" id="contact">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,_rgba(34,197,94,0.15)_0%,_transparent_70%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(34,197,94,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.04)_1px,transparent_1px)] bg-[size:64px_64px]" />

        <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <RevealSection>
            <div className="inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-4 py-1.5 text-xs font-bold tracking-widest text-green-400 uppercase mb-8">
              🌿 Passez à l'action
            </div>
            <h2 className="text-4xl font-black tracking-tight sm:text-6xl text-foreground">
              Prêt à transformer
              <br />
              votre{" "}
              <span className="bg-gradient-to-r from-green-400 via-emerald-300 to-cyan-400 bg-clip-text text-transparent">
                conformité ESG
              </span>{" "}?
            </h2>
            <p className="mt-6 text-base leading-7 text-muted-foreground max-w-xl mx-auto sm:text-lg">
              Choisissez le pack qui vous correspond ou parlez à un expert pour une solution sur mesure. Déploiement en quelques semaines.
            </p>

            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="#" className="inline-flex items-center justify-center rounded-xl bg-green-500 hover:bg-green-400 transition-all duration-200 px-9 py-4 text-sm font-black text-white shadow-lg shadow-green-500/30 hover:shadow-green-500/50 hover:-translate-y-0.5">
                Demander une démo gratuite →
              </a>
              <a href="#" className="inline-flex items-center justify-center rounded-xl border border-border hover:border-foreground/20 bg-card hover:bg-muted transition-all duration-200 px-9 py-4 text-sm font-semibold text-foreground">
                Voir nos tarifs
              </a>
            </div>

            <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground font-medium">
              <span>✓ Déploiement en 2–4 semaines</span>
              <span>✓ Support expert inclus</span>
              <span>✓ Conformité CSRD garantie</span>
              <span>✓ Données hébergées en France</span>
            </div>
          </RevealSection>
        </div>
      </section>

      <Footer/>
    </div>
  );
}