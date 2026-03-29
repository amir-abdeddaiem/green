import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
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
import { cn } from "@/lib/utils";

/* ─── PALETTE ───────────────────────────────────────────────────────────────
   bg section    → #16a34a  (green-600)
   card bg       → rgba(20,51,30,0.95)  (green-900/95)
   accent bright → #86efac  (green-300)
   accent mid    → #4ade80  (green-400)
   text muted    → rgba(187,247,208,0.55)  (green-200/55)
   border idle   → rgba(134,239,172,0.12)
   border hover  → rgba(134,239,172,0.35)
   ──────────────────────────────────────────────────────────────────────── */

const V = {
  bg: "#16a34a",
  card: "rgba(20,51,30,0.95)",
  bright: "#86efac",
  mid: "#4ade80",
  muted: "rgba(187,247,208,0.55)",
  borderIdle: "rgba(134,239,172,0.12)",
  borderHover: "rgba(134,239,172,0.35)",
  shadow: "0 24px 48px rgba(10,30,18,0.7)",
};
export const ZDQS = [
  {
    step: "01",
    title: "Connexion & Import",
    desc: "Intégration ERP (SAP, Odoo...), import de documents comptables et données opérationnelles en quelques clics.",
    accent: "green",
  },
  {
    step: "02",
    title: "IA + IoT en temps réel",
    desc: "OCR et IA extraient les données clés. Les capteurs IoT alimentent le système en continu sans intervention humaine.",
    accent: "green",
  },
  {
    step: "03",
    title: "Rapports & Recommandations",
    desc: "Génération automatique de rapports CBAM/CSRD + recommandations d'optimisation carbone personnalisées par l'IA.",
    accent: "green",
  },
] as const;
const PACKS = [
  {
    id: 1,
    tag: "STARTER",
    title: "300 TND/mois",
    tagline: "PME < 50 salariés",
    badge: "Essentiel",
    features: [
      "Scopes 1 & 2 automatisés",
      "Dashboard carbone",
      "Rapport Carbone automatisé",
      "Support basic",
    ],
  },

  {
    id: 2,
    tag: "PRO",
    title: "600 TND/mois",
    tagline: "ETI 50–200 salariés",
    badge: "Le plus populaire",
    features: [
      "Scope 3 inclus",
      "Intégration ERP + Capteurs IoT + API",
      "Rapports ESG conformes CBAM / CSRD",
      "Support Premium",
    ],
  },

  {
    id: 3,
    tag: "ENTERPRISE",
    title: "1200 TND/mois",
    tagline: "Grande industrie",
    badge: "Solution complète",
    features: [
      "Multi-sites",
      "Intégration ERP + Capteurs + API",
      "Chatbot et Recommendation IA",
      "Rapports ESG conformes CBAM / CSRD",
      "Support Premium + formation",
    ],
  },
];

const STATS = [
  { val: "70%", label: "Gain de temps sur le reporting" },
  { val: "4",   label: "Solutions modulables" },
  { val: "100%", label: "Conformité CSRD & CBAM" },
  { val: "24/7", label: "Suivi temps réel" },
];

const INTEGRATIONS = [
  "SAP ERP",
  "Microsoft Excel",
  "Factures PDF",
  "Capteurs IoT",
  "REST API",
  "Google Cloud",
  "Power BI",
  "Salesforce",
];

const PROCESS = [
  { step: "01", title: "Diagnostic",    desc: "Analyse de vos besoins et de votre maturité ESG actuelle" },
  { step: "02", title: "Configuration", desc: "Paramétrage personnalisé et intégration de vos sources de données" },
  { step: "03", title: "Déploiement",   desc: "Mise en production accompagnée par nos experts certifiés" },
  { step: "04", title: "Optimisation",  desc: "Suivi continu et amélioration de votre performance ESG" },
];

type ComparisonRow = readonly [string, boolean, boolean, boolean, boolean];

const COMPARISON_ROWS: ReadonlyArray<ComparisonRow> = [
  ["Collecte automatique (ERP, Excel)",  true,  true,  true,  true],
  ["Mesure Scope 1, 2, 3",               true,  true,  true,  true],
  ["Suivi temps réel",                   true,  false, true,  true],
  ["Rapports carbone ESG",               true,  false, true,  true],
  ["Analyse cycle de vie (ACV)",         false, true,  false, true],
  ["Leviers éco-conception",             false, true,  false, true],
  ["Centralisation données IoT",         false, false, true,  true],
  ["Suivi déchets & matières",           false, false, true,  true],
  ["Reporting CSRD automatisé",          false, false, true,  true],
  ["Modules sur mesure",                 false, false, false, true],
  ["Accompagnement dédié",               false, false, false, true],
];
function accentClasses(accent: string) {
  switch (accent) {
    case "green":
      return { text: "text-green-600", dot: "bg-green-600", pill: "bg-green-600" };
    case "blue":
      return { text: "text-blue-600", dot: "bg-blue-600", pill: "bg-blue-600" };
    case "yellow":
      return { text: "text-yellow-600", dot: "bg-yellow-600", pill: "bg-yellow-600" };
    default:
      return { text: "text-zinc-600", dot: "bg-zinc-600", pill: "bg-zinc-600" };
  }
}
/* ─── HOOK ──────────────────────────────────────────────────────────────── */
function useReveal() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.08 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible] as const;
}

type RevealProps = { children: ReactNode; className?: string; style?: CSSProperties }
  & Omit<HTMLAttributes<HTMLDivElement>, "children" | "className" | "style">;

function Reveal({ children, className = "", style, ...rest }: RevealProps) {
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

/* ─── REUSABLE ───────────────────────────────────────────────────────────── */
function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span className="h-px w-8" style={{ background: V.mid }} />
      <span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: V.mid }}>
        {children}
      </span>
    </div>
  );
}

/* ─── PAGE ───────────────────────────────────────────────────────────────── */
export function SolutionsPage() {
  const [hovered, setHovered] = useState<number | null>(null);
  const navigate = useNavigate();
  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground font-sans">
      <MarketingNavbar variant="light" />

       <section className="relative overflow-hidden pt-36 pb-0">
      {/* ── Background layer ──────────────────────────────────────── */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(34,197,94,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.04)_1px,transparent_1px)] bg-[size:72px_72px]" />
      <div
        className="absolute top-16 left-0 h-[520px] w-[520px] rounded-full opacity-[0.07]"
        style={{ background: "radial-gradient(circle, #16a34a 0%, transparent 65%)" }}
      />
      <div
        className="absolute bottom-0 right-0 h-[380px] w-[380px] rounded-full opacity-[0.05]"
        style={{ background: "radial-gradient(circle, #4ade80 0%, transparent 65%)" }}
      />
 
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* ── Main grid ─────────────────────────────────────────────── */}
        <div className="grid items-center gap-20 lg:grid-cols-2">
          {/* Left — copy */}
          <div>
            <h1 className="text-5xl font-black tracking-tight leading-[1.06] sm:text-6xl lg:text-[4.5rem]">
              <span className="text-foreground">Pilotez votre</span>
              <br />
              <span style={{ color: V.bg }}>impact carbone</span>
            </h1>
 
            <p className="mt-6 text-base leading-7 text-muted-foreground max-w-lg sm:text-lg">
              De la mesure des émissions carbone au reporting ESG complet — choisissez le pack adapté à votre entreprise et passez à la conformité en quelques semaines.
            </p>
 
            <div className="mt-10 flex flex-col sm:flex-row gap-3">
              <a
                href="#packs"
                className="inline-flex items-center justify-center rounded-xl px-8 py-3.5 text-sm font-black text-white transition-all duration-200 hover:-translate-y-0.5"
                style={{ background: V.bg, boxShadow: `0 8px 24px rgba(22,163,74,0.3)` }}
              >
                Découvrir les packs →
              </a>
              <a
                href="#contact"
                className="inline-flex items-center justify-center rounded-xl border border-border hover:border-foreground/20 bg-card hover:bg-muted transition-all duration-200 px-8 py-3.5 text-sm font-semibold text-foreground"
              >
                Parler à un expert
              </a>
            </div>
 
            {/* Trust badges */}
            <div className="mt-10 flex flex-wrap gap-2">
              {["CSRD Conforme", "ISO 14064", "CBAM Ready", "RGPD"].map((b) => (
                <span
                  key={b}
                  className="rounded-full border border-border/50 bg-card/70 px-3.5 py-1 text-xs font-semibold text-muted-foreground"
                >
                  ✓ {b}
                </span>
              ))}
            </div>
          </div>
 
          {/* Right — pack grid preview */}
          <div className="hidden lg:grid grid-cols-2 gap-3">
            {PACKS.map((p) => (
              <div
                key={p.id}
                className="group rounded-2xl border border-border bg-card/60 backdrop-blur p-6 transition-all duration-300 hover:border-green-500/30 hover:-translate-y-1 cursor-pointer"
                role="button"
                tabIndex={0}
                onClick={() => navigate(`/solutions/packs/${p.id}`)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    navigate(`/solutions/packs/${p.id}`);
                  }
                }}
                aria-label={`Open ${p.title}`}
              >
                <div
                  className="text-[10px] font-black uppercase tracking-[0.18em] mb-2"
                  style={{ color: V.mid }}
                >
                  {p.tag}
                </div>
                <div className="text-sm font-bold text-foreground leading-snug">{p.title}</div>
                {p.badge && (
                  <span
                    className="mt-3 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest"
                    style={{ background: "rgba(74,222,128,0.12)", color: V.mid }}
                  >
                    {p.badge}
                  </span>
                )}
              </div>
            ))}
 
            {/* AI banner */}
            <div
              className="col-span-2 rounded-2xl border p-5 flex items-center gap-4"
              style={{ borderColor: V.borderHover, background: "rgba(74,222,128,0.05)" }}
            >
              <div
                className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0 text-xs font-black"
                style={{
                  background: "rgba(74,222,128,0.1)",
                  color: V.mid,
                  border: `1px solid ${V.borderHover}`,
                }}
              >
                IA
              </div>
              <div>
                <div className="text-sm font-bold text-foreground">IA Verdustry</div>
                <div className="text-xs text-muted-foreground mt-0.5 leading-5">
                  Collecte, calcul et rapport automatisés — intégration ERP, Excel & IoT en temps réel
                </div>
              </div>
              <div className="ml-auto">
                <span className="relative flex h-2 w-2">
                  <span
                    className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                    style={{ background: V.mid }}
                  />
                  <span
                    className="relative inline-flex rounded-full h-2 w-2"
                    style={{ background: V.mid }}
                  />
                </span>
              </div>
            </div>
          </div>
        </div>
 
        {/* ── Stats strip — merged, flush to hero bottom ─────────────── */}
        <div className="relative  mt-20 rounded-lg border border-border/60 bg-card/50 backdrop-blur-sm">
          {/* Hairline separator that bleeds full width */}
          <div className="absolute inset-x-[-9999px] top-0 border-t border-border/60" />
 
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-border/60">
            {STATS.map((s) => (
              <div
                key={s.label}
                className="group flex flex-col items-center justify-center py-10 px-4 text-center gap-1.5 transition-colors duration-200 hover:bg-muted/30"
              >
                <div
                  className="text-4xl font-black tracking-tight transition-transform duration-200 group-hover:-translate-y-0.5"
                  style={{ color: V.bg }}
                >
                  {s.val}
                </div>
                <div className="text-xs text-muted-foreground font-medium leading-snug max-w-[120px]">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>

      {/* ── PACKS ────────────────────────────────────────────────────────── */}
      <section className="py-28" id="packs">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <Reveal className="mb-16">
            <SectionLabel>Nos Solutions</SectionLabel>
            <h2 className="text-4xl font-black tracking-tight sm:text-5xl text-foreground">
              Choisissez votre{" "}
              <span style={{ color: V.bg }}>pack ESG</span>
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
              Des packs modulables conçus pour s'adapter à chaque étape de votre maturité ESG — du premier bilan carbone au reporting CSRD complet.
            </p>
          </Reveal>

          <div className="grid gap-5 lg:grid-cols-3">
            {PACKS.map((pack, idx) => {
              const isHov = hovered === pack.id;
              return (
                <Reveal key={pack.id} style={{ transitionDelay: `${idx * 80}ms` }}>
                  <div
                    className="group flex flex-col overflow-hidden rounded-[1.75rem] transition-all duration-300 cursor-pointer hover:-translate-y-1.5 h-full"
                    style={{
                      background: V.card,
                      border: `1px solid ${isHov ? V.borderHover : V.borderIdle}`,
                      boxShadow: isHov ? V.shadow : "none",
                    }}
                    onMouseEnter={() => setHovered(pack.id)}
                    onMouseLeave={() => setHovered(null)}
                    onClick={() => navigate(`/solutions/packs/${pack.id}`)}
                  >
                    {/* Shimmer top line */}
                    <div className="absolute inset-x-0 top-0 h-px opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none"
                      style={{ background: `linear-gradient(90deg, transparent, ${V.bright}, transparent)` }} />

                    {/* Header */}
                    <div className="relative px-8 pt-8 pb-7 overflow-hidden"
                      style={{ borderBottom: `1px solid ${V.borderIdle}` }}>
                      {/* Large watermark number */}
                      <div className="absolute right-6 bottom-2 text-[7rem] font-black leading-none select-none pointer-events-none"
                        style={{ color: "rgba(20,51,30,0.18)" }}>
                        {pack.id}
                      </div>

                      <div className="flex items-start justify-between mb-6">
                        <div className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: V.mid }}>
                          {pack.tag}
                        </div>
                        {pack.badge && (
                          <span className="rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest"
                            style={{ background: "rgba(134,239,172,0.10)", color: V.bright, border: `1px solid ${V.borderHover}` }}>
                            {pack.badge}
                          </span>
                        )}
                      </div>

                      <h3 className="text-xl font-black tracking-tight text-white leading-snug">{pack.title}</h3>
                      <p className="mt-2 text-sm leading-6" style={{ color: V.muted }}>{pack.tagline}</p>
                    </div>

                    {/* Features */}
                    <div className="flex-1 px-8 py-6 space-y-0">
                      {pack.features.map((f, i) => (
                        <div key={i}
                          className={`flex items-start gap-4 py-3.5 ${i !== pack.features.length - 1 ? "border-b" : ""}`}
                          style={{ borderColor: V.borderIdle }}>
                          {/* Minimal check mark */}
                          <span className="mt-0.5 shrink-0 h-5 w-5 flex items-center justify-center rounded-full text-[10px] font-black"
                            style={{ background: "rgba(74,222,128,0.1)", color: V.mid }}>
                            ✓
                          </span>
                          <span className="text-sm font-medium leading-5 text-white/80">{f}</span>
                        </div>
                      ))}
                    </div>

                    {/* CTA */}
                    <div className="px-8 pb-8">
                      <button
                        type="button"
                        className="flex w-full items-center justify-center rounded-xl py-3.5 text-sm font-black transition-all duration-200 hover:-translate-y-0.5"
                        style={{
                          background: V.bg,
                          color: "#fff",
                          boxShadow: `0 4px 16px rgba(22,163,74,0.25)`,
                        }}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          navigate(`/solutions/packs/${pack.id}`);
                        }}
                      >
                        Démarrer ce pack →
                      </button>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>
{/* PARCOURS PRODUIT SECTION */}
{/* PARCOURS PRODUIT SECTION */}
<section id="parcours-produit" className="py-14 scroll-mt-28 rounded-[2rem] bg-green-100/50">
  <div className="mx-auto max-w-5xl px-6">

    {/* Header */}
    <div className="text-center mb-14">
      
      <h2 className="text-3xl md:text-4xl font-black tracking-tight leading-snug mx-auto max-w-3xl text-gray-900">
        De la donnée brute au rapport conforme en{' '}
        <em className="not-italic" style={{ color: V.bg }}>3 étapes</em>{' '}
        entièrement automatisées
      </h2>
    </div>

    {/* Steps Grid */}
    <div className="grid items-start"
      style={{ gridTemplateColumns: '1fr 36px 1fr 36px 1fr' }}>

      {/* ── STEP 1 ── */}
      <div className="relative rounded-[1.75rem] p-7 overflow-hidden"
        style={{ background: V.card, border: `1px solid ${V.borderIdle}` }}>
        <div className="absolute right-4 bottom-2 text-[6rem] font-black leading-none select-none pointer-events-none"
          style={{ color: "rgba(20,51,30,0.10)" }}>01</div>

        <div className="flex items-center gap-2 mb-5">
          <span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: V.mid }}>Étape</span>
          <span className="text-4xl font-black leading-none" style={{ color: V.mid }}>01</span>
        </div>
        <div className="w-9 h-px mb-4" style={{ background: `linear-gradient(90deg, ${V.bright}, transparent)` }} />
        <h3 className="text-base font-black tracking-tight mb-3 text-white">Ingestion des données</h3>
        <p className="text-sm leading-relaxed" style={{ color: V.muted }}>
          Collecte automatique depuis vos sources : ERP, CRM, fichiers plats.
          Normalisation et validation en temps réel.
        </p>
        <div className="flex flex-wrap gap-1.5 mt-5">
          {['ERP', 'CRM', 'CSV'].map((tag) => (
            <span key={tag} className="text-[10px] font-black uppercase tracking-widest rounded-full px-2.5 py-0.5"
              style={{ background: "rgba(20,51,30,0.18)", color: V.bright, border: `1px solid ${V.borderHover}` }}>
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* ── CONNECTOR 1 ── */}
      <div className="flex items-center justify-center" style={{ paddingTop: '52px' }}>
        <div className="flex flex-col items-center gap-1">
          <div className="w-px h-5" style={{ background: `linear-gradient(to bottom, transparent, ${V.bg})` }} />
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="9" stroke={V.bg} strokeWidth="1" fill="rgba(20,51,30,0.06)" />
            <path d="M7 10H13M13 10L10.5 7.5M13 10L10.5 12.5"
              stroke={V.bg} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div className="w-px h-5" style={{ background: `linear-gradient(to bottom, ${V.bg}, transparent)` }} />
        </div>
      </div>

      {/* ── STEP 2 ── */}
      <div className="relative rounded-[1.75rem] p-7 overflow-hidden"
        style={{ background: V.card, border: `1px solid ${V.borderIdle}` }}>
        <div className="absolute right-4 bottom-2 text-[6rem] font-black leading-none select-none pointer-events-none"
          style={{ color: "rgba(20,51,30,0.10)" }}>02</div>

        <div className="flex items-center gap-2 mb-5">
          <span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: V.mid }}>Étape</span>
          <span className="text-4xl font-black leading-none" style={{ color: V.mid }}>02</span>
        </div>
        <div className="w-9 h-px mb-4" style={{ background: `linear-gradient(90deg, ${V.bright}, transparent)` }} />
        <h3 className="text-base font-black tracking-tight mb-3 text-white">Traitement & analyse IA</h3>
        <p className="text-sm leading-relaxed" style={{ color: V.muted }}>
          Détection d'anomalies, enrichissement sémantique et calcul des indicateurs
          réglementaires par nos modèles.
        </p>
        <div className="flex flex-wrap gap-1.5 mt-5">
          {['IA', 'Temps réel'].map((tag) => (
            <span key={tag} className="text-[10px] font-black uppercase tracking-widest rounded-full px-2.5 py-0.5"
              style={{ background: "rgba(20,51,30,0.18)", color: V.bright, border: `1px solid ${V.borderHover}` }}>
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* ── CONNECTOR 2 ── */}
      <div className="flex items-center justify-center" style={{ paddingTop: '52px' }}>
        <div className="flex flex-col items-center gap-1">
          <div className="w-px h-5" style={{ background: `linear-gradient(to bottom, transparent, ${V.bg})` }} />
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="9" stroke={V.bg} strokeWidth="1" fill="rgba(20,51,30,0.06)" />
            <path d="M7 10H13M13 10L10.5 7.5M13 10L10.5 12.5"
              stroke={V.bg} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div className="w-px h-5" style={{ background: `linear-gradient(to bottom, ${V.bg}, transparent)` }} />
        </div>
      </div>

      {/* ── STEP 3 ── */}
      <div className="relative rounded-[1.75rem] p-7 overflow-hidden"
        style={{
          background: V.card,
          border: `1px solid ${V.borderHover}`,
          boxShadow: V.shadow,
        }}>
        <div className="absolute right-4 bottom-2 text-[6rem] font-black leading-none select-none pointer-events-none"
          style={{ color: "rgba(20,51,30,0.10)" }}>03</div>

        {/* Badge */}
        <div className="absolute top-3.5 right-3.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest"
          style={{ background: "rgba(20,51,30,0.18)", color: V.bright, border: `1px solid ${V.borderHover}` }}>
          ✓ Conforme
        </div>

        <div className="flex items-center gap-2 mb-5">
          <span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: V.mid }}>Étape</span>
          <span className="text-4xl font-black leading-none" style={{ color: V.mid }}>03</span>
        </div>
        <div className="w-9 h-px mb-4" style={{ background: `linear-gradient(90deg, ${V.bright}, transparent)` }} />
        <h3 className="text-base font-black tracking-tight mb-3 text-white">Génération du rapport</h3>
        <p className="text-sm leading-relaxed" style={{ color: V.muted }}>
          Production automatique des rapports aux formats réglementaires,
          prêts à soumettre, avec audit trail complet.
        </p>
        <div className="flex flex-wrap gap-1.5 mt-5">
          {['PDF', 'XML', 'Audit'].map((tag) => (
            <span key={tag} className="text-[10px] font-black uppercase tracking-widest rounded-full px-2.5 py-0.5"
              style={{ background: "rgba(20,51,30,0.18)", color: V.bright, border: `1px solid ${V.borderHover}` }}>
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>

    {/* Stat Bar */}
    <div className="mt-8 grid grid-cols-3 rounded-[1.75rem] overflow-hidden"
      style={{ border: `1px solid ${V.borderIdle}` }}>
      {[
        { value: '100%', label: 'Automatisé' },
        { value: '< 2 min', label: 'De la donnée au rapport' },
        { value: '0 erreur', label: 'Taux de conformité' },
      ].map((stat, i) => (
        <div key={stat.label} className="text-center py-5 px-6"
          style={{
            background: "rgba(20,51,30,0.05)",
            borderRight: i < 2 ? `1px solid ${V.borderIdle}` : 'none',
          }}>
          <div className="text-2xl font-black tracking-tight" style={{ color: V.bg }}>{stat.value}</div>
          <div className="text-xs font-medium mt-1 text-gray-500">{stat.label}</div>
        </div>
      ))}
    </div>

  </div>
</section>      {/* ── COMPARISON ───────────────────────────────────────────────────── */}
      <section className="py-28" style={{ background: "rgba(20,51,30,0.18)" }}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <Reveal className="mb-14">
            <SectionLabel>Comparaison</SectionLabel>
            <h2 className="text-4xl font-black tracking-tight sm:text-5xl text-foreground">
              Toutes les{" "}
              <span style={{ color: V.bg }}>fonctionnalités</span>{" "}
              en un coup d'œil
            </h2>
          </Reveal>

          <Reveal>
            <div className="overflow-hidden rounded-[1.75rem] border" style={{ borderColor: V.borderIdle, background: V.card }}>
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full border-separate border-spacing-0">
                  <thead>
                    <tr>
                      <th className="px-7 py-5 text-left text-[10px] font-black uppercase tracking-[0.18em]"
                        style={{ color: V.muted, borderBottom: `1px solid ${V.borderIdle}` }}>
                        Fonctionnalité
                      </th>
                      {["Pack 01", "Pack 02", "Pack 03", "Pack 04"].map((col) => (
                        <th key={col} className="px-6 py-5 text-center text-[10px] font-black uppercase tracking-[0.18em]"
                          style={{ color: V.mid, borderBottom: `1px solid ${V.borderIdle}` }}>
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {COMPARISON_ROWS.map(([feature, ...vals], rowIdx) => (
                      <tr key={feature}
                        style={{ background: rowIdx % 2 === 0 ? "transparent" : "rgba(134,239,172,0.025)" }}>
                        <td className="px-7 py-4 text-sm font-semibold text-white/80"
                          style={{ borderTop: `1px solid ${V.borderIdle}` }}>
                          {feature}
                        </td>
                        {vals.map((v, i) => (
                          <td key={i} className="px-6 py-4 text-center"
                            style={{ borderTop: `1px solid ${V.borderIdle}` }}>
                            {v ? (
                              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-black"
                                style={{ background: "rgba(74,222,128,0.12)", color: V.mid }}>
                                ✓
                              </span>
                            ) : (
                              <span style={{ color: "rgba(134,239,172,0.2)", fontSize: "1.1rem" }}>—</span>
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
          </Reveal>
        </div>
      </section>

      {/* ── INTEGRATIONS ─────────────────────────────────────────────────── */}
      <section className="py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 text-center">
          <Reveal>
            <SectionLabel>Intégrations</SectionLabel>
            <h2 className="text-4xl font-black tracking-tight sm:text-5xl text-foreground">
              Compatible avec vos{" "}
              <span style={{ color: V.bg }}>outils existants</span>
            </h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground max-w-xl mx-auto">
              Connectez Verdustry à vos sources de données en quelques clics, sans développement technique.
            </p>
            <div className="mt-12 flex flex-wrap justify-center gap-3">
              {INTEGRATIONS.map((name) => (
                <div key={name}
                  className="group rounded-full border px-5 py-2.5 text-sm font-semibold text-white/70 transition-all duration-200 cursor-default"
                  style={{
                    borderColor: V.borderIdle,
                    background: V.card,
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = V.borderHover;
                    (e.currentTarget as HTMLElement).style.color = V.bright;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = V.borderIdle;
                    (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.7)";
                  }}>
                  {name}
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>
{/* How it Works */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="text-[#16a34a] font-medium text-sm tracking-widest mb-3">COMMENT ÇA MARCHE</div>
            <h2 className="text-5xl font-bold text-[#0f172a]">4 étapes simples</h2>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-12">
              {[
                "1. Collecte automatique des données ESG depuis les ERP, rapports, capteurs et questionnaires",
                "2. Analyse et calcul des indicateurs carbone et climatiques",
                "3. Agrégation au niveau du portefeuille d’investissement",
                "4. Génération automatique de rapports ESG et climatiques conformes"
              ].map((step, index) => (
                <div key={index} className="flex gap-8 items-start">
                  <div className="w-14 h-14 rounded-2xl bg-[#16a34a] text-white flex items-center justify-center font-bold text-2xl flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="pt-3 text-xl text-[#475569]">{step}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      {/* ── PROCESS ──────────────────────────────────────────────────────── */}
      <section className="py-28" id="process" style={{ background: "rgba(20,51,30,0.18)" }}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <Reveal className="mb-16">
            <SectionLabel>Comment ça marche</SectionLabel>
            <h2 className="text-4xl font-black tracking-tight sm:text-5xl text-foreground">
              Déployé en{" "}
              <span style={{ color: V.bg }}>4 étapes</span>
            </h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
              De la signature à la première publication de rapport, nos experts vous accompagnent à chaque phase.
            </p>
          </Reveal>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {PROCESS.map((p, idx) => (
              <Reveal key={p.step} style={{ transitionDelay: `${idx * 80}ms` }}>
                <div
                  className="relative rounded-[1.5rem] p-7 h-full transition-all duration-300 group cursor-default hover:-translate-y-1"
                  style={{
                    background: V.card,
                    border: `1px solid ${V.borderIdle}`,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = V.borderHover)}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = V.borderIdle)}
                >
                  {/* Connector arrow */}
                  {idx < PROCESS.length - 1 && (
                    <div className="hidden lg:block absolute top-10 -right-3 z-10 text-base font-bold"
                      style={{ color: V.borderHover }}>
                      →
                    </div>
                  )}
                  <div className="text-[11px] font-black uppercase tracking-[0.22em] mb-5" style={{ color: V.mid }}>
                    {p.step}
                  </div>
                  <h4 className="text-lg font-black text-white tracking-tight mb-3">{p.title}</h4>
                  <p className="text-sm leading-6" style={{ color: V.muted }}>{p.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

        {/* FINAL CTA */}
<section className="py-10 border-t rounded-[2rem] bg-green-600">
  <div className="max-w-3xl mx-auto text-center px-6">
    <h2 className="text-4xl font-semibold tracking-tight text-white leading-snug">
      Prêt à réduire votre empreinte{" "}
      <span className="text-green-200">environnementale</span>,
      sécuriser vos parts de marché{" "}
      <span className="text-green-200">et accéder aux marchés européens ?</span>
    </h2>
    <p className="mt-6 text-white/90">
      Rejoignez nous pour transformer l'impact climatique en avantage compétitif.
    </p>
    <div className="mt-12 flex flex-wrap justify-center gap-4">
      <Button
        size="lg"
        className="bg-green-900/95 hover:bg-green-500 text-white px-12 py-7 text-lg rounded-2xl"
        onClick={() => navigate("/register")}
      >
        Commencer gratuitement
      </Button>
      <Button
        variant="outline"
        size="lg"
        className="border-green-400 text-green-600 hover:bg-green-500 hover:text-white px-12 py-7 text-lg rounded-2xl"
        onClick={() => navigate("/book-demo")}
      >
        Parler à un expert
      </Button>
    </div>
  </div>
</section>

      <Footer />
    </div>
  );
}