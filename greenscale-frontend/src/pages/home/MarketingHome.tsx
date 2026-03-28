import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import MarketingNavbar from "@/components/marketing/MarketingNavbar";
import LogoLoop from "@/components/LogoLoop";
import { FAQSection } from "./Fq";
import Footer from "./Footer";
const IMPACT_STATS = [
  {
    target: 52,
    prefix: "-",
    suffix: "%",
    label: "Réduction des coûts liés à la gestion carbone et conformité",
  },
  {
    target: 93,
    prefix: "-",
    suffix: "%",
    label: "Réduction du nombre d'employés impliqués dans le processus",
  },
  {
    target: 80,
    prefix: "-",
    suffix: "%",
    label: "Réduction du temps passé sur la comptabilité carbone",
  },
] as const;

const WHY_US = [
  {
    num: "01",
    tag: "PRÉCISION",
    title: "Collecte de données sans compromis",
    desc: "Connectez vos sources de données en quelques clics. Notre moteur de collecte automatisée élimine les erreurs manuelles et garantit une traçabilité complète de chaque émission.",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7">
        <path d="M24 6L40 14L40 34L24 42L8 34L8 14Z" stroke="#4ade80" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M24 6L24 19M40 14L29 19M40 34L29 29M24 42L24 29M8 34L19 29M8 14L19 19" stroke="#4ade80" strokeWidth="1" opacity=".3" />
        <circle cx="24" cy="24" r="5" fill="#4ade80" />
        <circle cx="24" cy="24" r="2" fill="#132b1e" />
      </svg>
    ),
    stat: "99.8%",
    statLabel: "précision",
  },
  {
    num: "02",
    tag: "INTELLIGENCE",
    title: "IA pour optimiser vos émissions",
    desc: "Notre IA analyse en continu vos données pour détecter les anomalies, anticiper les dérives et vous proposer les actions à plus fort impact sur votre trajectoire de réduction.",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7">
        <rect x="10" y="10" width="28" height="28" rx="6" stroke="#4ade80" strokeWidth="1.5" />
        <circle cx="18" cy="18" r="2.5" fill="#4ade80" />
        <circle cx="30" cy="18" r="2.5" fill="#4ade80" />
        <circle cx="18" cy="30" r="2.5" fill="#4ade80" />
        <circle cx="30" cy="30" r="2.5" fill="#4ade80" />
        <circle cx="24" cy="24" r="4" fill="#4ade80" />
        <path d="M18 18L24 24M30 18L24 24M18 30L24 24M30 30L24 24" stroke="#132b1e" strokeWidth="1.5" />
      </svg>
    ),
    stat: "3×",
    statLabel: "plus rapide",
  },
  {
    num: "03",
    tag: "MISE À JOUR",
    title: "Facteurs d'émission toujours précis",
    desc: "Accédez à plus de 150 000 facteurs d'émissions issus des meilleures bases mondiales — ADEME, IPCC, Ecoinvent — mis à jour en continu pour refléter la réalité terrain.",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7">
        <circle cx="24" cy="24" r="16" stroke="#4ade80" strokeWidth="1.5" />
        <path d="M24 8A16 16 0 0 1 40 24" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" />
        <path d="M37 20L40 24L44 22" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M20 24L24 20L28 24M24 20V30" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    stat: "150k+",
    statLabel: "facteurs",
  },
  {
    num: "04",
    tag: "SÉCURITÉ",
    title: "Vos données sont en sécurité",
    desc: "Infrastructure certifiée SOC 2 Type II, chiffrement de bout en bout, hébergement européen. Vos données ESG restent confidentielles et sous votre contrôle total.",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7">
        <path d="M24 6L38 12L38 26C38 34 32 40 24 43C16 40 10 34 10 26L10 12Z" stroke="#4ade80" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M24 6L38 12L38 26C38 34 32 40 24 43C16 40 10 34 10 26L10 12Z" fill="#4ade80" fillOpacity=".06" />
        <path d="M18 24L22 28L30 20" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    stat: "SOC 2",
    statLabel: "Type II",
  },
] as const;

const STEPS = [
  {
    num: "01",
    title: "Comptabilité carbone",
    desc: "Suivez vos émissions GES et identifiez vos principaux domaines de réduction.",
    tag: "MESURE",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10">
        <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 2" className="text-green-200" />
        <path d="M14 32 L19 24 L24 28 L30 18 L34 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600" />
        <circle cx="34" cy="22" r="2.5" fill="currentColor" className="text-green-600" />
        <path d="M12 36h24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-green-300" />
      </svg>
    ),
  },
  {
    num: "02",
    title: "Analyse du cycle de vie",
    desc: "Évaluez les impacts du cycle de vie de vos produits pour une durabilité à tous les niveaux.",
    tag: "ANALYSE",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10">
        <path d="M24 8 C30 8 36 14 36 20 C36 28 28 32 24 40 C20 32 12 28 12 20 C12 14 18 8 24 8Z" stroke="currentColor" strokeWidth="1.5" className="text-green-300" />
        <path d="M24 14 C27 14 30 17 30 20 C30 24 27 26 24 30 C21 26 18 24 18 20 C18 17 21 14 24 14Z" fill="currentColor" className="text-green-500" fillOpacity="0.3" />
        <circle cx="24" cy="20" r="3" fill="currentColor" className="text-green-600" />
        <path d="M24 8 V5M36 20 H39M12 20 H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-green-400" />
      </svg>
    ),
  },
  {
    num: "03",
    title: "Reporting ESG",
    desc: "Centralisez vos données ESG pour gagner du temps et faciliter la conformité. Bénéficiez d'analyses stratégiques et de conseils d'experts.",
    tag: "CONFORMITÉ",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10">
        <rect x="10" y="8" width="28" height="32" rx="3" stroke="currentColor" strokeWidth="1.5" className="text-green-300" />
        <path d="M16 18h16M16 24h16M16 30h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-green-500" />
        <circle cx="34" cy="34" r="7" fill="currentColor" className="text-green-600" />
        <path d="M31 34l2 2 4-3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    num: "04",
    title: "Plans d'action & Suivi",
    desc: "Transformez vos insights en actions concrètes avec un suivi en temps réel et un accompagnement expert.",
    tag: "ACTION",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10">
        <path d="M12 24L20 32L36 16" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-green-600" />
        <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="1.5" className="text-green-200" />
      </svg>
    ),
  },
] as const;

const SECURITY_FEATURES = [
  { icon: "🔒", title: "Chiffrement des données", desc: "Chiffrement de bout en bout (AES-256) et TLS 1.3 sur toutes les communications" },
 
  { icon: "👥", title: "Authentification sécurisée et Gestion des accès", desc: "Contrôle granulaire par rôle, département et projet et authentification adaptative" },
  { icon: "☁️", title: "Infrastructure cloud sécurisée", desc: "Hébergement souverain en Europe – SOC 2 Type II & ISO 27001" },
 
  { icon: "📋", title: "Journalisation & Traçabilité", desc: "Audit complet de toutes les actions sur vos données" },
];

const AI_SECTION = {
  title: "Powered by Verdustry AI",
  subtitle: "Une intelligence artificielle conçue par des experts climat",
  description: "Développée avec des ingénieurs et scientifiques du climat, notre IA analyse en continu vos données pour détecter les opportunités, anticiper les risques et transformer chaque défi environnemental en avantage stratégique.",
  stats: [
    { value: "150 000+", label: "facteurs d'émission mis à jour quotidiennement" },
    { value: "3×", label: "plus rapide que les approches traditionnelles" },
    { value: "98.7%", label: "de précision dans la détection d'anomalies" },
  ],
};

type Accent = "green" | "green" | "teal";

const PRODUCTS: Array<{
  tag: string;
  title: string;
  desc: string;
  features: string[];
  accent: Accent;
}> = [
{
    "tag": "CŒUR DE PLATEFORME",
    "title": "Bilan Carbone automatisé",
    "desc": "Calculez précisément vos émissions de GES (Scopes 1, 2 et 3) grâce à une collecte automatisée via ERP, capteurs IoT et documents.",
    "features": [
      "Calcul carbone automatisé",
      "Intégration ERP & IoT",
      "IA pour détection d’anomalies"
    ],
    accent: "green",
  },
  
    {
    "tag": "PILOTAGE & OPTIMISATION",
    "title": "Recommandations & plans d’action",
    "desc": "Identifiez les leviers de réduction, simulez des scénarios et optimisez votre performance environnementale grâce à l’intelligence artificielle.",
    "features": [
      "Recommandations IA personnalisées",
      "Simulation d’impact environnemental",
      "Suivi des indicateurs ESG"
    ],
    accent: "green",
  },
  {
    "tag": "INTELLIGENCE & AUTOMATISATION",
    "title": "Chatbot ESG intelligent",
    "desc": "Interagissez avec vos données via un assistant IA pour analyser vos performances, comprendre vos indicateurs et faciliter le reporting.",
    "features": [
      "Assistant IA intégré",
      "Analyse en temps réel",
      "Support à la décision"
    ],
    accent: "green",
  },
  {
    "tag": "SÉCURITÉ",
    "title": "Protection des données & accès",
    "desc": "Assurez la sécurité de vos données ESG grâce à des mécanismes avancés de protection et de gestion des accès.",
    "features": [
      "Chiffrement des données",
      "Gestion des rôles utilisateurs",
      "Accès sécurisé"
    ],
    accent: "green",
  },
];

const PARTNER_LOGOS = [
  "14001.jpg", "CBAM_Beratung_Logo.svg", "iso-14064.jpg", "ghg-protocol-logo.png",
  "images.jpg", "iso 14067.svg", "csrd.svg",
].map((src) => ({
  title: src,
  node: <img src={`/${src}`} alt={src} className="h-10 w-auto object-contain" />,
}));

// Custom Hook
function useInView<T extends HTMLElement>(threshold = 0.15) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry && entry.isIntersecting) {
          setInView(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold, rootMargin: "0px 0px -10% 0px" }
    );

    observer.observe(element);

    return () => {
      if (element) observer.unobserve(element);
    };
  }, [threshold]);

  return [ref, inView] as const;
}

// Impact Counter Component
function ImpactCounter({ target, prefix = "", suffix = "", duration = 1800 }: {
  target: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
}) {
  const [count, setCount] = useState(0);
  const [ref, inView] = useInView<HTMLSpanElement>(0.3);

  useEffect(() => {
    if (!inView) return;
    let raf: number;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) raf = requestAnimationFrame(tick);
      else setCount(target);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, target, duration]);

  return (
    <span ref={ref}>
      {prefix}{count}{suffix}
    </span>
  );
}

function accentClasses(accent: Accent) {
  const classes = {
    green: { text: "text-green-700", pill: "border-green-200 bg-green-50 text-green-700", dot: "bg-green-600", glow: "from-green-500/15" },
    // green: { text: "text-green-700", pill: "border-green-200 bg-green-50 text-green-700", dot: "bg-green-500", glow: "from-green-500/15" },
    teal: { text: "text-teal-700", pill: "border-teal-200 bg-teal-50 text-teal-700", dot: "bg-teal-500", glow: "from-teal-500/15" },
  };
  return classes[accent];
}

export  function MarketingHome() {
  const navigate = useNavigate();

  const [heroRef, heroInView] = useInView<HTMLDivElement>(0.1);
  const [impactRef, impactInView] = useInView<HTMLDivElement>(0.15);
  const [productsRef, productsInView] = useInView<HTMLDivElement>(0.1);
  const [stepsRef, stepsInView] = useInView<HTMLDivElement>(0.1);
  const [aiRef, aiInView] = useInView<HTMLDivElement>(0.1);
  const [whyRef, whyInView] = useInView<HTMLDivElement>(0.1);
  const [securityRef, securityInView] = useInView<HTMLDivElement>(0.1);

  return (
    <div className="relative min-h-screen bg-zinc-50 text-zinc-900 overflow-hidden">
      {/* Ambient Background */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full bg-green-500/10 blur-3xl" />
        <div className="absolute -right-40 top-80 h-[500px] w-[500px] rounded-full bg-teal-500/10 blur-3xl" />
        <div className="absolute bottom-20 left-1/3 h-[400px] w-[400px] rounded-full bg-green-500/10 blur-3xl" />
      </div>

      <MarketingNavbar variant="light" />
      {/* HERO SECTION */}
      <section ref={heroRef} className="relative min-h-screen flex items-center pt-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className={cn("space-y-8 transition-all duration-1000", heroInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12")}>
              <h1 className="text-6xl lg:text-7xl font-semibold tracking-tighter leading-none text-balance">
                Réduisez votre empreinte carbone<br />
                <span className="bg-green-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                  avec intelligence
                </span>
              </h1>

              <p className="max-w-lg text-xl text-zinc-600 leading-relaxed">
                La plateforme tout-en-un pour mesurer, analyser, réduire et reporter vos émissions GES avec précision et conformité.
              </p>

              <div className="flex flex-wrap gap-4 pt-4">
                <Button
                  size="lg"
                  className="bg-green-600 hover:bg-green-700 text-white px-10 py-7 text-lg font-semibold rounded-2xl shadow-xl shadow-green-600/30 transition-all active:scale-[0.98]"
                  onClick={() => navigate("/register")}
                >
                  Commencer gratuitement
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-zinc-300 hover:bg-zinc-100 px-10 py-7 text-lg rounded-2xl"
                  onClick={() => navigate("/book-demo")}
                >
                  Voir une démo
                </Button>
              </div>

              <div>
                
                <LogoLoop logos={PARTNER_LOGOS} speed={55} direction="left" logoHeight={52} gap={40} />
              </div>
            </div>

            {/* Hero Visual */}
            <div className={cn("relative transition-all duration-1000 delay-300", heroInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12")}>
              <div className="relative rounded-3xl overflow-hidden border border-zinc-100 shadow-2xl bg-white">
                <video
                  src="/videoplayback.mp4"
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full aspect-video object-cover"
                />
              </div>
              <div className="absolute -inset-20 -z-10 bg-gradient-to-br from-green-400/20 via-teal-400/15 to-transparent blur-3xl rounded-[6rem]" />
            </div>
          </div>
        </div>
      </section>

      {/* IMPACT SECTION */}
      {/* <section ref={impactRef} className="py-24 text-white rounded-[2rem] bg-green-600">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-center text-5xl font-semibold tracking-tight mb-16">
            Plus d’impact.<br />Moins de coûts.
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {IMPACT_STATS.map((stat, i) => (
              <div
                key={i}
                className="bg-green-900/95 rounded-3xl p-10 transition-all hover:scale-[1.02]"
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <p className="text-green-300/75 text-white leading-snug min-h-[4.5rem]">{stat.label}</p>
                <p className="mt-8 text-6xl lg:text-7xl font-black tracking-tighter">
                  <ImpactCounter target={stat.target} prefix={stat.prefix} suffix={stat.suffix} />
                </p>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* PRODUCTS SECTION */}
      <section id="produits" ref={productsRef} className="py-24 bg-white">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-16">
            
            <h2 className="text-5xl font-semibold tracking-tight mt-4">Une plateforme pensée pour la transition écologique</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {PRODUCTS.map((p, i) => {
              const a = accentClasses(p.accent);
              return (
                <div
                  key={i}
                  className={cn(
                    "group rounded-3xl border bg-white p-10 transition-all duration-700 hover:shadow-2xl hover:-translate-y-1",
                    "hover:border-green-200"
                  )}
                  style={{ transitionDelay: `${i * 150}ms` }}
                >
                  {/* <div className={cn("inline-flex rounded-full border px-4 py-1 text-xs font-bold tracking-widest", a.pill)}>
                    {p.tag}
                  </div> */}
                  <h3 className={cn("mt-6 text-3xl font-semibold tracking-tight", a.text)}>{p.title}</h3>
                  <p className="mt-5 text-zinc-600 leading-relaxed">{p.desc}</p>

                  <ul className="mt-8 space-y-3">
                    {p.features.map((f, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-sm">
                        <span className={cn("h-2 w-2 rounded-full", a.dot)} />
                        <span className="font-medium">{f}</span>
                      </li>
                    ))}
                  </ul>

                  {/* <button className="mt-10 text-green-600 font-semibold flex items-center gap-2 group-hover:gap-3 transition-all">
                    En savoir plus →
                  </button> */}
                </div>
              );
            })}
          </div>
        </div>
      </section>
            {/* AI SECTION */}
{/* <section ref={aiRef} className="py-24 text-white rounded-[2rem] bg-green-600">
  <div className="mx-auto max-w-6xl px-6">

    <div
      className={cn(
        "text-center transition-all duration-700",
        aiInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      )}
    >
     

      <h2 className="mt-6 text-5xl font-semibold tracking-tight">
        L'intelligence artificielle{" "}
        <span className="text-green-100 tracking-tighter">au service du climat</span>
      </h2>

      <p className="mx-auto mt-4 max-w-2xl text-lg text-white/80">
        {AI_SECTION.description}
      </p>
    </div>

    <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-6">

      {/* CARD 1 
      <div
        className="bg-green-900/95 rounded-3xl p-10 transition-all hover:scale-[1.02]"
      >
        <h3 className="text-3xl font-bold text-white">
          Toujours à jour.<br />Toujours plus intelligente.
        </h3>

        <div className="mt-10 grid grid-cols-3 gap-6">
          {AI_SECTION.stats.map((stat, i) => (
            <div key={i}>
              <div className="text-5xl font-black text-green-100 tracking-tighter">
                {stat.value}
              </div>

              <div className="mt-2 text-sm text-green-100 tracking-tighter">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CARD 2 
      <div
        className="bg-green-900/95 rounded-3xl p-10 transition-all hover:scale-[1.02]"
      >
        <div className="text-xs font-bold tracking-widest uppercase text-green-100 tracking-tighter">
          Exemple d'action IA
        </div>

        <p className="mt-6 text-lg leading-relaxed text-white">
          Détection automatique d’une anomalie Scope 3 chez un fournisseur →
          suggestion de{" "}
          <span className="text-green-100 tracking-tighter font-bold">
            3 alternatives
          </span>{" "}
          avec{" "}
          <span className="text-green-100 tracking-tighter font-bold">
            -27% d’émissions
          </span>.
        </p>
      </div>

    </div>
  </div>
</section> */}

      {/* PROCESS / STEPS SECTION */}
      <section id="solutions" ref={stepsRef} className="py-28" style={{ background: "linear-gradient(160deg, #f8fcf9 0%, #ffffff 50%, #f0faf4 100%)" }}>
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-2xl mb-20">
            <h2 className="mt-6 text-5xl font-semibold tracking-tight leading-none">
              Toute votre stratégie climat,<br />
              <span className="text-green-600">à portée de main</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {STEPS.map((step, i) => (
              <div
                key={i}
                className="group bg-white rounded-3xl p-10 border border-green-100 hover:border-green-300 hover:shadow-xl transition-all duration-500 hover:-translate-y-2 relative overflow-hidden"
              >
                <div className="absolute top-8 right-8 text-[120px] font-black text-green-100 group-hover:text-green-100/80 transition-colors pointer-events-none">
                  {step.num}
                </div>

                <div className="relative z-10">
                  <div className="w-20 h-20 flex items-center justify-center bg-green-300 rounded-2xl mb-8 group-hover:bg-green-100 transition-colors">
                    {step.icon}
                  </div>
                  <div className="uppercase text-xs font-bold tracking-[2px] text-green-600 mb-3">{step.tag}</div>
                  <h3 className="text-2xl font-semibold mb-4 leading-tight">{step.title}</h3>
                  <p className="text-green-600 leading-relaxed">{step.desc}</p>

                  {/* <div className="mt-10 text-green-600 font-medium inline-flex items-center gap-2 group-hover:gap-3 transition-all">
                    En savoir plus <span className="text-lg">→</span>
                  </div> */}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* WHY US SECTION */}
      <section
  ref={whyRef}
  className="relative overflow-hidden w-full py-24 px-4 rounded-[2rem] text-white bg-green-600/10"
  
>
  <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-[2rem]">
    <div className="absolute -right-32 -top-32 h-[480px] w-[480px] rounded-full opacity-15"
      style={{ background: "radial-gradient(circle, #4ade80 0%, transparent 65%)" }} />
    <div className="absolute -left-24 bottom-0 h-[360px] w-[360px] rounded-full opacity-10"
      style={{ background: "radial-gradient(circle, #bbf7d0 0%, transparent 65%)" }} />
  </div>

  <div className="relative mx-auto max-w-6xl">
    <div className={cn(
      "text-center transition-all duration-700",
      whyInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
    )}>
      <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-green-900 sm:text-4xl lg:text-5xl">
        La différence{" "}
        <span style={{ color: "#00200b" }}>Verdustry</span> {/* green-200 — lisible sur green-600 */}
      </h2>
      <p className="mx-auto mt-4 max-w-xl text-base" style={{ color: "rgba(0, 73, 26, 0.65)" }}>
        Rigueur scientifique, intelligence artificielle et sécurité absolue — au service de votre transition climatique.
      </p>
    </div>

    <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2">
      {WHY_US.map((item, i) => (
        <div
          key={item.tag}
          className={cn(
            "group relative overflow-hidden rounded-3xl p-8 transition-all duration-500 hover:-translate-y-1.5 cursor-pointer",
            whyInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          )}
          style={{
            backgroundColor: "rgba(20, 51, 30, 0.95)", 
            border: "1px solid rgba(134,239,172,0.12)", 
            transitionDelay: `${i * 100}ms`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "rgba(134,239,172,0.35)";
            e.currentTarget.style.boxShadow = "0 20px 40px rgba(10, 30, 18, 0.7)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "rgba(134,239,172,0.12)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          {/* Ligne de lumière au survol */}
          <div className="absolute inset-x-0 top-0 h-px opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{ background: "linear-gradient(90deg, transparent, #86efac, transparent)" }} />

          {/* Numéro décoratif */}
          <div className="pointer-events-none absolute bottom-2 right-4 text-8xl font-black leading-none select-none"
            style={{ color: "rgba(134,239,172,0.05)" }}>
            {item.num}
          </div>

          <div className="relative">
            <div className="flex items-start justify-between">
              {/* Icône */}
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-300 group-hover:scale-110"
                style={{
                  background: "rgba(134,239,172,0.08)",
                  border: "1px solid rgba(134,239,172,0.2)"
                }}>
                {item.icon}
              </div>

              {/* Stat badge */}
              <div className="rounded-xl px-3 py-2 text-right"
                style={{
                  background: "rgba(134,239,172,0.07)",
                  border: "1px solid rgba(134,239,172,0.18)"
                }}>
                <div className="text-xl font-black" style={{ color: "#86efac" }}>{item.stat}</div>
                <div className="mt-0.5 text-[9px] font-semibold uppercase tracking-wider"
                  style={{ color: "rgba(134,239,172,0.5)" }}>{item.statLabel}</div>
              </div>
            </div>

            {/* Tag */}
            <div className="mt-6 text-[10px] font-bold tracking-widest uppercase"
              style={{ color: "rgba(134,239,172,0.55)" }}>
              {item.tag}
            </div>

            {/* Titre */}
            <h3 className="mt-2 text-xl font-extrabold tracking-tight text-white leading-snug">
              {item.title}
            </h3>

            {/* Description */}
            <p className="mt-3 text-sm leading-relaxed" style={{ color: "rgba(187,247,208,0.5)" }}>
              {item.desc}
            </p>

            {/* CTA */}
            <div className="mt-6 flex items-center gap-1.5 text-sm font-bold" style={{ color: "#86efac" }}>
              <span>En savoir plus</span>
              <span className="transition-transform duration-200 group-hover:translate-x-1.5">→</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>
      {/* SECURITY SECTION */}
<section ref={securityRef} className="py-28 bg-white text-zinc-900">
  <div className="mx-auto max-w-6xl px-6">
    <div className="text-center mb-16">
      <h2 className="text-5xl font-semibold tracking-tight">
        Vos données sont en sécurité
      </h2>
      <p className="mt-4 text-zinc-600 max-w-md mx-auto">
        Nous protégeons vos informations avec les plus hauts standards de sécurité et de conformité.
      </p>
    </div>

    <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
      {SECURITY_FEATURES.map((feature, i) => (
        <div
          key={i}
          className="bg-green-600/10 border border-green-200 hover:border-green-300 rounded-3xl p-8 transition-all hover:-translate-y-1 group"
        >
          <div className="text-5xl mb-6 text-green-600 group-hover:scale-110 transition-transform">
            {feature.icon}
          </div>
          <h3 className="text-xl font-semibold mb-3 text-green-700">
            {feature.title}
          </h3>
          <p className="text-zinc-600 leading-relaxed">{feature.desc}</p>
        </div>
      ))}
    </div>
  </div>
</section>

   {/* FINAL CTA  */}
<section className="py-28 border-t rounded-[2rem] bg-green-600" >
  <div className=" min-w-xl text-center px-6">
    <h2 className="text-5xl font-semibold tracking-tight text-white">
      Prêt à réduire votre empreinte carbone ?
    </h2>
    <p className="mt-6 text-white  rounded-[3rem] " >
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
      
      <FAQSection/>

    {/* FOOTER */}
      <Footer/>
    </div>
  );
}