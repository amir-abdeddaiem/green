import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import MarketingNavbar from "@/components/marketing/MarketingNavbar";
import LogoLoop from "@/components/LogoLoop";


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

const STEPS = [
  {
    num: "01",
    title: "Mesurez",
    desc: "Obtenez une vue claire et précise de vos émissions sur tous les scopes grâce à notre IA et nos données sectorielles.",
    icon: "📊",
  },
  {
    num: "02",
    title: "Fixez des objectifs",
    desc: "Définissez des objectifs ambitieux alignés avec les standards climatiques SBTi, CSRD et GHG Protocol.",
    icon: "🎯",
  },
  {
    num: "03",
    title: "Agissez",
    desc: "Transformez votre plan en actions concrètes : énergies renouvelables, efficacité, approvisionnement durable.",
    icon: "⚡",
  },
  {
    num: "04",
    title: "Reportez",
    desc: "Suivez vos progrès en temps réel et communiquez vos résultats via CDP, CSRD, TCFD et autres frameworks.",
    icon: "📋",
  },
] as const;

type Accent = "green" | "emerald" | "teal";

const PRODUCTS: Array<{
  tag: string;
  title: string;
  desc: string;
  features: string[];
  accent: Accent;
}> = [
  {
    tag: "CŒUR DE PLATEFORME",
    title: "Bilan Carbone®",
    desc: "Calculez précisément vos émissions scopes 1, 2 et 3. Notre IA détecte les anomalies et automatise la collecte de données.",
    features: ["GHG Protocol", "ADEME certifié", "IA intégrée"],
    accent: "green",
  },
  {
    tag: "PLANIFICATION",
    title: "Plans d'action",
    desc: "Accédez à notre bibliothèque d'actions, simulez des trajectoires et pilotez votre décarbonisation avec des experts dédiés.",
    features: ["Bibliothèque SBTi", "Simulateur de coûts", "Ateliers experts"],
    accent: "emerald",
  },
  {
    tag: "CONFORMITÉ",
    title: "ESG & Reporting",
    desc: "Répondez aux exigences CSRD, CDP, TCFD et EU Taxonomy avec des rapports audit-ready générés automatiquement.",
    features: ["CSRD ready", "EU Taxonomy", "CDP disclosure"],
    accent: "teal",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "Verdustry a transformé notre approche RSE. Une plateforme intuitive et une équipe d'experts exceptionnelle.",
    author: "Jonathan Ciccio",
    role: "Continuous Improvement Manager",
    company: "Siemon",
  },
  {
    quote:
      "Nous avons atteint notre objectif net-zéro. Je recommande Verdustry à toutes les entreprises sérieuses sur le climat.",
    author: "Directeur Développement Durable",
    role: "Climate Leader",
    company: "F2A",
  },
  {
    quote:
      "Grâce à Verdustry, nous établissons de nouveaux standards industriels en matière de durabilité.",
    author: "Michael Van Parys",
    role: "Director of Sustainability",
    company: "Energy Vault",
  },
] as const;

const PARTNER_LOGOS = [
  "14001.jpg",
  "CBAM_Beratung_Logo.svg",
  "iso-14064.jpg",
  "ghg-protocol-logo.png",
  "images.jpg",
  "iso 14067.svg",
  "csrd.svg",
].map((src) => ({
  title: src,
  node: (
    <img
      src={`/${src}`}
      alt={src}
      className="h-10 w-auto object-contain"
    />
  ),
}));

function useInView<T extends HTMLElement>(threshold = 0.15) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setInView(true);
      },
      { threshold },
    );

    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);

  return [ref, inView] as const;
}

function ImpactCounter({
  target,
  prefix = "",
  suffix = "",
  duration = 1800,
}: {
  target: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
}) {
  const [count, setCount] = useState(0);
  const [ref, inView] = useInView<HTMLSpanElement>(0.3);

  useEffect(() => {
    if (!inView) return;
    let raf = 0;
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
  switch (accent) {
    case "green":
      return {
        text: "text-green-700",
        pill: "border-green-200 bg-green-50 text-green-700",
        dot: "bg-green-600",
        link: "text-green-700",
        glow: "from-green-500/15",
        borderHover: "hover:border-green-300",
      };
    case "emerald":
      return {
        text: "text-emerald-700",
        pill: "border-emerald-200 bg-emerald-50 text-emerald-700",
        dot: "bg-emerald-500",
        link: "text-emerald-700",
        glow: "from-emerald-500/15",
        borderHover: "hover:border-emerald-300",
      };
    case "teal":
      return {
        text: "text-teal-700",
        pill: "border-teal-200 bg-teal-50 text-teal-700",
        dot: "bg-teal-500",
        link: "text-teal-700",
        glow: "from-teal-500/15",
        borderHover: "hover:border-teal-300",
      };
  }
}

function ArrowDown() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="inline-block ml-1 -mb-1"
    >
      <path
        d="M12 4v16m0 0l-6-6m6 6l6-6"
        stroke="#4ade80"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function MarketingHome() {
  const navigate = useNavigate();
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const [heroRef, heroInView] = useInView<HTMLDivElement>(0.1);
  const [impactRef, impactInView] = useInView<HTMLDivElement>(0.15);
  const [productsRef, productsInView] = useInView<HTMLDivElement>(0.1);
  const [stepsRef, stepsInView] = useInView<HTMLDivElement>(0.1);
  const [testimonialsRef, testimonialsInView] = useInView<HTMLDivElement>(0.2);

  useEffect(() => {
    const t = window.setInterval(
      () => setActiveTestimonial((p) => (p + 1) % TESTIMONIALS.length),
      4000,
    );
    return () => window.clearInterval(t);
  }, []);

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      {/* Ambient background */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-24 -top-24 h-[420px] w-[420px] rounded-full bg-green-500/10 blur-3xl" />
        <div className="absolute -right-24 top-40 h-[360px] w-[360px] rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-[320px] w-[320px] rounded-full bg-teal-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/20 to-transparent" />
      </div>

      <MarketingNavbar />

      {/* ── HERO (untouched) ── */}
      <section
        ref={heroRef}
        className="relative min-h-screen overflow-hidden bg-white flex items-center"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-50 via-white to-emerald-50/30" />

        <div className="mx-auto max-w-7xl px-6 pt-24 pb-20 lg:pt-32 lg:pb-24 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-start">
            <div
              className={cn(
                "space-y-8 transition-all duration-700",
                heroInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
              )}
            >
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-tighter text-zinc-900 leading-none">
                Réduisez votre<br />
                <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                  empreinte carbone
                </span>
              </h1>

              <p className="max-w-lg text-xl text-zinc-600 leading-relaxed">
                La plateforme tout-en-un pour mesurer, planifier et reporter vos émissions GES
                avec précision, simplicité et conformité aux normes internationales.
              </p>

              <div className="flex flex-wrap gap-4 pt-6">
                <Button
                  size="lg"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-7 text-lg font-semibold rounded-2xl transition-all active:scale-[0.97] shadow-xl shadow-emerald-500/25"
                  onClick={() => navigate("/register")}
                >
                  Commencer gratuitement
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  className="border-zinc-300 hover:bg-zinc-100 text-zinc-700 px-10 py-7 text-lg rounded-2xl transition-all"
                  onClick={() => navigate("/book-demo")}
                >
                  Voir une démo
                </Button>
              </div>

              <div className="pt-10">
                <p className="text-xs uppercase tracking-[2px] text-zinc-500 mb-5 font-medium">
                  CERTIFIÉ PAR LES NORMES INTERNATIONALES
                </p>
                <LogoLoop
                  logos={PARTNER_LOGOS}
                  speed={55}
                  direction="left"
                  logoHeight={58}
                  gap={36}
                  className="transition-all"
                />
              </div>
            </div>

            <div
              className={cn(
                "relative transition-all duration-700 delay-150",
                heroInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
              )}
            >
              <div className="relative mx-auto max-w-[540px]">
                <div className="relative rounded-3xl overflow-hidden border border-zinc-100 shadow-2xl shadow-zinc-200/80 bg-white">
                  <div className="h-12 bg-zinc-50 border-b border-zinc-100 flex items-center px-5 gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-400" />
                      <div className="w-3 h-3 rounded-full bg-amber-400" />
                      <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    </div>
                    <div className="mx-auto text-[10px] font-medium text-zinc-400 tracking-wider">
                      Ver Dustry • Dashboard
                    </div>
                  </div>

                  <div className="relative">
                    <video
                      src="/videoplayback.mp4"
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="w-full object-cover aspect-video"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent pointer-events-none" />
                  </div>
                </div>

                <div className="absolute -inset-16 -z-10 bg-gradient-to-br from-emerald-300/20 via-teal-200/10 to-transparent rounded-[5rem] blur-3xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── IMPACT (dark green section) ── */}
      <section
        ref={impactRef}
        style={{ backgroundColor: "#034122", borderRadius: "2rem" }}
        className="w-full py-20 px-4"
      >
        <div className="mx-auto max-w-5xl">
          <h2
            className={cn(
              "text-center text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl transition-all duration-700",
              impactInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
            )}
          >
            Plus d&apos;impact, moins de coûts.
          </h2>

          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {IMPACT_STATS.map((stat, i) => (
              <div
                key={stat.label}
                className={cn(
                  "rounded-2xl p-8 transition-all duration-700",
                  impactInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
                )}
                style={{
                  backgroundColor: "#062e1a",
                  transitionDelay: impactInView ? `${i * 60}ms` : "0ms",
                }}
              >
                <p className="text-sm leading-snug text-white/50 min-h-[3.5rem]">
                  {stat.label}
                </p>
                <p className="mt-6 text-5xl font-black tracking-tight text-white lg:text-6xl">
                  <ImpactCounter
                    target={stat.target}
                    prefix={stat.prefix}
                    suffix={stat.suffix}
                  />
                  <ArrowDown />
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRODUCTS ── */}
      <section id="produits" ref={productsRef} className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="text-xs font-bold tracking-widest text-green-700">NOTRE PLATEFORME</div>
          <h2
            className={cn(
              "mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl transition-all duration-700",
              productsInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
            )}
          >
            Une suite complète pour
            <br />votre transition climatique
          </h2>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {PRODUCTS.map((p, i) => {
            const a = accentClasses(p.accent);
            return (
              <div
                key={p.title}
                className={cn(
                  "group relative overflow-hidden rounded-2xl border bg-card p-8 shadow-sm transition-all duration-700",
                  a.borderHover,
                  productsInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
                )}
                style={{ transitionDelay: `${i * 120}ms` }}
              >
                <div className={cn("inline-flex rounded-full border px-3 py-1 text-[10px] font-bold tracking-widest", a.pill)}>
                  {p.tag}
                </div>
                <h3 className={cn("mt-5 text-2xl font-extrabold tracking-tight", a.text)}>{p.title}</h3>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{p.desc}</p>

                <ul className="mt-6 space-y-2">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-foreground/80">
                      <span className={cn("h-2 w-2 rounded-full", a.dot)} />
                      <span className="font-medium">{f}</span>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  className={cn(
                    "mt-7 inline-flex items-center text-sm font-bold transition-colors",
                    a.link,
                    "hover:opacity-90",
                  )}
                >
                  En savoir plus →
                </button>

                <div
                  aria-hidden
                  className={cn(
                    "pointer-events-none absolute -bottom-24 left-0 right-0 h-56 bg-gradient-to-t to-transparent opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100",
                    a.glow,
                  )}
                />
              </div>
            );
          })}
        </div>
      </section>

      {/* ── PROCESS ── */}
      <section
        id="solutions"
        ref={stepsRef}
        className="border-y bg-gradient-to-b from-transparent via-green-50/40 to-transparent"
      >
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-xs font-bold tracking-widest text-green-700">COMMENT ÇA MARCHE</div>
            <h2
              className={cn(
                "mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl transition-all duration-700",
                stepsInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
              )}
            >
              4 étapes vers la
              <br />neutralité carbone
            </h2>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-4 lg:grid-cols-4 lg:gap-0">
            {STEPS.map((step, i) => (
              <div
                key={step.num}
                className={cn(
                  "relative rounded-2xl border bg-card p-6 transition-all duration-700 lg:rounded-none lg:border-y-0 lg:border-l-0 lg:first:rounded-l-2xl lg:last:rounded-r-2xl",
                  stepsInView ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-6",
                )}
                style={{ transitionDelay: `${i * 120}ms` }}
              >
                <div className="text-5xl font-extrabold tracking-tight text-green-700/15">{step.num}</div>
                <div className="mt-4 text-2xl">{step.icon}</div>
                <h3 className="mt-3 text-lg font-extrabold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.desc}</p>

                {i < STEPS.length - 1 && (
                  <div className="absolute -right-3 top-1/2 hidden -translate-y-1/2 text-xl font-black text-green-700 lg:block">
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      

      {/* ── CTA FINAL ── */}
      <section id="tarifs" className="relative border-t py-24">
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-500/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <div className="text-xs font-bold tracking-widest text-green-700">REJOIGNEZ LE MOUVEMENT</div>
          <h2 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Prêt à réduire votre
            <br />empreinte carbone ?
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Rejoignez 3 500+ entreprises qui mesurent et réduisent leur impact climatique.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Button
              className="bg-green-600 px-7 py-6 text-base font-extrabold text-white hover:bg-green-700"
              onClick={() => navigate("/register")}
            >
              Commencer maintenant
            </Button>
            <Button
              variant="outline"
              className="px-7 py-6 text-base font-semibold"
              onClick={() => navigate("/book-demo")}
            >
              Parler à un expert
            </Button>
          </div>

          <p className="mt-5 text-xs text-muted-foreground">Aucune carte de crédit requise · Résultats en 48h</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer id="apropos" className="border-t bg-muted/20">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 py-14 sm:px-6 lg:grid-cols-4 lg:px-8">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3">
              <img src="/Verdustry.svg" alt="Verdustry Logo" className="h-8 w-auto object-contain" />
            </div>
            <p className="mt-4 text-sm text-muted-foreground">La plateforme carbone des entreprises ambitieuses.</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {["ADEME", "GHG Protocol", "CDP", "SOC 2"].map((b) => (
                <span
                  key={b}
                  className="rounded border border-green-200 bg-green-50 px-2 py-1 text-[10px] font-bold tracking-wide text-green-700"
                >
                  {b}
                </span>
              ))}
            </div>
          </div>

          {(
            [
              { title: "Produits", links: ["Bilan Carbone", "Plans d'action", "Reporting ESG", "LCA"] },
              { title: "Solutions", links: ["PME", "Grandes entreprises", "Finance", "Retail"] },
              { title: "Ressources", links: ["Blog", "Guides", "Webinars", "Centre d'aide"] },
            ] as const
          ).map((col) => (
            <div key={col.title} className="space-y-3">
              <div className="text-sm font-extrabold tracking-wide">{col.title}</div>
              <div className="flex flex-col gap-2">
                {col.links.map((l) => (
                  <a key={l} href="#" className="text-sm text-muted-foreground hover:text-green-700">
                    {l}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t">
          <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
            <span>© 2026 Verdustry · Tous droits réservés</span>
            <span>Politique de confidentialité · CGU · Mentions légales</span>
          </div>
        </div>
      </footer>
    </div>
  );
} 