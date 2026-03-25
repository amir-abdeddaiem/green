import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import MarketingNavbar from "@/components/marketing/MarketingNavbar";
import LogoLoop from "@/components/LogoLoop";


const STATS = [
  { value: "3 500+", label: "Entreprises clientes" },
  { value: "80%", label: "Réduction du temps de reporting" },
  { value: "150k", label: "Facteurs d'émissions" },
  { value: "Scope 1·2·3", label: "Couverture complète" },
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
  "BNP Paribas",
  "Siemon",
  "Energy Vault",
  "F2A",
  "Retail",
  "Industrie",
].map((label) => ({
  title: label,
  node: (
    <span className="rounded-md border bg-card px-2.5 py-1 text-xs font-semibold text-muted-foreground">
      {label}
    </span>
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

function AnimatedCounter({ target, duration = 1800 }: { target: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const [ref, inView] = useInView<HTMLSpanElement>(0.3);

  const numeric = useMemo(() => {
    const digits = target.replace(/[^0-9]/g, "");
    const numVal = Number.parseInt(digits, 10);
    const isNum = Number.isFinite(numVal) && digits.length > 0;

    const suffix = target.replace(/[0-9\s\u202F.,]/g, "");

    return { isNum, numVal: isNum ? numVal : 0, suffix };
  }, [target]);

  useEffect(() => {
    if (!inView || !numeric.isNum) return;

    let raf = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      setCount(Math.floor(progress * numeric.numVal));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [duration, inView, numeric.isNum, numeric.numVal]);

  if (!numeric.isNum) {
    return <span ref={ref}>{target}</span>;
  }

  const formatted = count.toLocaleString("fr-FR");
  return (
    <span ref={ref}>
      {formatted}
      {numeric.suffix}
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

export function MarketingHome() {
  const navigate = useNavigate();
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const [heroRef, heroInView] = useInView<HTMLDivElement>(0.1);
  const [statsRef, statsInView] = useInView<HTMLDivElement>(0.2);
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

      {/* HERO */}
      <section
        ref={heroRef}
        className="mx-auto grid min-h-screen max-w-6xl grid-cols-1 items-center gap-12 px-4 pb-16 pt-28 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8"
      >
        <div
          className={cn(
            "max-w-xl transition-all duration-700",
            heroInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10",
          )}
        >
          

          <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Réduisez votre <br />
            <span className="bg-gradient-to-r from-green-700 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
              empreinte 
            </span>
            
          </h1>

          <p className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
            La plateforme tout-en-un pour mesurer, planifier et reporter vos émissions GES. Propulsée par
            l'IA, validée par des experts climatiques.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Button
              className="bg-green-600 px-6 py-6 text-base font-extrabold text-white hover:bg-green-700"
              onClick={() => navigate("/register")}
            >
              Commencer gratuitement
            </Button>
            <Button
              variant="outline"
              className="px-6 py-6 text-base font-semibold"
              onClick={() => navigate("/book-demo")}
            >
              Voir une démo ▶
            </Button>
          </div>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <span className="text-xs font-medium text-muted-foreground">Fait confiance par</span>
            <div className="w-full">
              <LogoLoop
                logos={PARTNER_LOGOS}
                speed={60}
                direction="left"
                logoHeight={28}
                gap={14}
                ariaLabel="Logos des partenaires"
              />
            </div>
          </div>
        </div>

        {/* Dashboard mockup */}
        <div
          className={cn(
            "transition-all duration-700 delay-150",
            heroInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10",
          )}
        >
          <div className="overflow-hidden rounded-2xl border bg-card shadow-xl">
            <div className="flex items-center gap-3 border-b bg-muted/40 px-5 py-3">
              <div className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">Tableau de bord émissions</span>
            </div>

            <div className="p-6">
              <div className="flex h-24 items-end gap-4">
                {(
                  [
                    { scope: "Scope 1", value: "124 tCO₂e", bar: "bg-green-600", h: "h-16" },
                    { scope: "Scope 2", value: "87 tCO₂e", bar: "bg-emerald-500", h: "h-12" },
                    { scope: "Scope 3", value: "1 240 tCO₂e", bar: "bg-teal-500", h: "h-20" },
                  ] as const
                ).map((m) => (
                  <div key={m.scope} className="flex flex-1 flex-col items-center gap-1">
                    <div className={cn("w-full rounded-md", m.bar, m.h)} />
                    <div className="text-[11px] font-bold text-muted-foreground">{m.value}</div>
                    <div className="text-[10px] text-muted-foreground/70">{m.scope}</div>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <div className="text-xs font-medium text-muted-foreground">Objectif Net-Zéro 2030</div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full w-[62%] rounded-full bg-gradient-to-r from-green-600 to-emerald-500" />
                </div>
                <div className="mt-2 text-right text-[11px] font-bold text-green-700">62% atteint</div>
              </div>

              <div className="mt-5 flex gap-3 rounded-xl border border-green-200 bg-green-50 p-4">
                <div className="text-sm">💡</div>
                <div className="text-xs leading-relaxed text-muted-foreground">
                  Réduire les achats fournisseurs de 15% permettrait d'économiser 186 tCO₂e
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section ref={statsRef} className="border-y bg-muted/20">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-12 sm:px-6 lg:grid-cols-4 lg:px-8">
          {STATS.map((s, i) => (
            <div
              key={s.label}
              className={cn(
                "rounded-xl px-2 py-4 text-center transition-all duration-700",
                statsInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
              )}
              style={{ transitionDelay: `${i * 90}ms` }}
            >
              <div className="text-3xl font-extrabold tracking-tight text-green-700 sm:text-4xl">
                <AnimatedCounter target={s.value} />
              </div>
              <div className="mt-2 text-sm text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PRODUCTS */}
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

      {/* PROCESS */}
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

      {/* TESTIMONIALS */}
      <section id="ressources" ref={testimonialsRef} className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="text-xs font-bold tracking-widest text-green-700">ILS NOUS FONT CONFIANCE</div>
          <h2
            className={cn(
              "mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl transition-all duration-700",
              testimonialsInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
            )}
          >
            3 500+ entreprises en
            <br />mouvement climatique
          </h2>
        </div>

        <div className="relative mx-auto mt-14 max-w-2xl">
          {TESTIMONIALS.map((t, i) => (
            <div
              key={t.author}
              className={cn(
                "rounded-3xl border bg-card p-8 text-left shadow-sm transition-all duration-500 sm:p-10",
                i === activeTestimonial
                  ? "relative opacity-100 translate-x-0 scale-100"
                  : "absolute inset-0 opacity-0 translate-x-4 scale-[0.985] pointer-events-none",
              )}
            >
              <div className="text-6xl font-extrabold leading-none text-green-700/40">“</div>
              <p className="mt-4 text-base leading-relaxed text-foreground/80 sm:text-lg">{t.quote}</p>
              <div className="mt-7 flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-green-600 to-emerald-500 text-white font-extrabold">
                  {t.author[0]}
                </div>
                <div>
                  <div className="text-sm font-bold">{t.author}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {t.role} · {t.company}
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="mt-8 flex justify-center gap-2">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Témoignage ${i + 1}`}
                className={cn(
                  "h-2 w-2 rounded-full transition-all",
                  i === activeTestimonial ? "bg-green-600 scale-125" : "bg-green-600/30",
                )}
                onClick={() => setActiveTestimonial(i)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
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
            <Button variant="outline" className="px-7 py-6 text-base font-semibold" onClick={() => navigate("/book-demo")}
            >
              Parler à un expert
            </Button>
          </div>

          <p className="mt-5 text-xs text-muted-foreground">Aucune carte de crédit requise · Résultats en 48h</p>
        </div>
      </section>

      {/* FOOTER */}
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
