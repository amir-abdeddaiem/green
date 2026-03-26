import MarketingNavbar from "@/components/marketing/MarketingNavbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const ESG_PILLARS = [
  {
    icon: "🌍",
    tone: "green",
    title: "Émissions Carbone",
    subtitle: "Environnement — Scope 1, 2 & 3",
    desc: "Mesure et publication complète des émissions de gaz à effet de serre sur toute la chaîne de valeur.",
    bullets: [
      "Scope 1 : émissions directes",
      "Scope 2 : énergie achetée",
      "Scope 3 : chaîne de valeur amont/aval",
    ],
  },
  {
    icon: "🌱",
    tone: "emerald",
    title: "Impact Environnemental",
    subtitle: "Environnement — Biodiversité & Ressources",
    desc: "Évaluation de l'impact sur la biodiversité, l'eau, la pollution et l'utilisation des ressources naturelles.",
    bullets: [
      "Biodiversité & écosystèmes",
      "Utilisation de l'eau",
      "Pollution & déchets",
    ],
  },
  {
    icon: "🏛️",
    tone: "amber",
    title: "Gouvernance",
    subtitle: "Gouvernance — Éthique & Transparence",
    desc: "Transparence sur les pratiques de gouvernance d'entreprise, la lutte anti-corruption et la fiscalité responsable.",
    bullets: [
      "Composition du conseil d'administration",
      "Lutte contre la corruption",
      "Politique fiscale responsable",
    ],
  },
  {
    icon: "👥",
    tone: "blue",
    title: "Impact Social",
    subtitle: "Social — Personnes & Communautés",
    desc: "Reporting sur les conditions de travail, l'égalité, les droits humains et l'impact sur les communautés.",
    bullets: [
      "Conditions de travail & égalité",
      "Droits humains",
      "Impact sur les communautés",
    ],
  },
];

const TIMELINE = [
  { year: "2024", label: "Directive CSRD adoptée", sub: "Directive 2022/2464 en vigueur", active: true },
  { year: "Jan 2025", label: "Grandes entreprises cotées", sub: "+500 salariés — 1er rapport exercice 2024", active: true },
  { year: "Jan 2026", label: "Grandes entreprises non cotées", sub: "+250 salariés ou CA > 40M€", active: false },
  { year: "Jan 2027", label: "PME cotées", sub: "Normes simplifiées (VSME)", active: false },
  { year: "Jan 2029", label: "Entreprises de pays tiers", sub: "Filiales / succursales dans l'UE", active: false },
];

const SOLUTIONS = [
  {
    icon: "🤖",
    title: "Collecte Automatisée",
    desc: "Collectez automatiquement vos données ESG depuis vos systèmes existants.",
    bullets: ["Connexion ERP & SI", "Import multi-sources", "Validation en temps réel"],
  },
  {
    icon: "📑",
    title: "Rapport ESRS Conforme",
    desc: "Générez des rapports conformes aux normes ESRS approuvées par l'UE.",
    bullets: ["Standards ESRS E1–S4–G1", "Prêt pour l'audit", "Format XBRL inclus"],
  },
  {
    icon: "🎯",
    title: "Double Matérialité",
    desc: "Réalisez votre analyse de double matérialité avec notre assistant IA.",
    bullets: ["Matérialité financière", "Matérialité d'impact", "Cartographie des parties prenantes"],
  },
  {
    icon: "📊",
    title: "Tableaux de Bord ESG",
    desc: "Suivez vos indicateurs ESG en temps réel et pilotez votre performance.",
    bullets: ["KPIs personnalisables", "Alertes automatiques", "Benchmarks sectoriels"],
  },
];

const STEPS = [
  { num: "01", title: "Analyse de Matérialité", desc: "Identifier les enjeux ESG significatifs" },
  { num: "02", title: "Collecte des Données", desc: "Agréger les données ESG de toute l'organisation" },
  { num: "03", title: "Calcul & Vérification", desc: "Calculer les indicateurs et valider la qualité" },
  { num: "04", title: "Rédaction du Rapport", desc: "Générer le rapport de durabilité conforme ESRS" },
  { num: "05", title: "Audit & Publication", desc: "Faire certifier et publier le rapport annuel" },
];

const ADVANTAGES = [
  { icon: "⚡", title: "Gain de Temps", desc: "Réduisez jusqu'à 70% le temps de préparation de votre rapport de durabilité." },
  { icon: "✅", title: "Conformité Garantie", desc: "Toujours aligné avec les dernières normes ESRS et mises à jour réglementaires." },
  { icon: "🔍", title: "Audit-Ready", desc: "Documentation structurée et traçable, prête pour la vérification tierce partie." },
  { icon: "🌐", title: "Vision Intégrée", desc: "Pilotez vos performances ESG et CBAM depuis une plateforme unifiée." },
];

const ESRS_STANDARDS = [
  { code: "ESRS E1", label: "Changement climatique", tone: "green" },
  { code: "ESRS E2", label: "Pollution", tone: "emerald" },
  { code: "ESRS E3", label: "Eau & ressources marines", tone: "cyan" },
  { code: "ESRS E4", label: "Biodiversité", tone: "lime" },
  { code: "ESRS E5", label: "Économie circulaire", tone: "amber" },
  { code: "ESRS S1", label: "Effectifs propres", tone: "blue" },
  { code: "ESRS S2", label: "Travailleurs chaîne valeur", tone: "violet" },
  { code: "ESRS S3", label: "Communautés locales", tone: "pink" },
  { code: "ESRS S4", label: "Consommateurs & utilisateurs", tone: "red" },
  { code: "ESRS G1", label: "Conduite des affaires", tone: "amber" },
];

export default function CsrdPage() {
  const pillarTone: Record<string, { pill: string; icon: string; borderTop: string; dot: string }> = {
    green: {
      pill: "border-green-200 bg-green-50 text-green-700",
      icon: "bg-green-100 text-green-700",
      borderTop: "border-t-green-500",
      dot: "bg-green-600",
    },
    emerald: {
      pill: "border-emerald-200 bg-emerald-50 text-emerald-700",
      icon: "bg-emerald-100 text-emerald-700",
      borderTop: "border-t-emerald-500",
      dot: "bg-emerald-500",
    },
    amber: {
      pill: "border-amber-200 bg-amber-50 text-amber-800",
      icon: "bg-amber-100 text-amber-800",
      borderTop: "border-t-amber-400",
      dot: "bg-amber-500",
    },
    blue: {
      pill: "border-blue-200 bg-blue-50 text-blue-700",
      icon: "bg-blue-100 text-blue-700",
      borderTop: "border-t-blue-500",
      dot: "bg-blue-600",
    },
  };

  const esrsTone: Record<string, string> = {
    green: "border-green-200 bg-green-50 text-green-800",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-800",
    cyan: "border-cyan-200 bg-cyan-50 text-cyan-900",
    lime: "border-lime-200 bg-lime-50 text-lime-900",
    amber: "border-amber-200 bg-amber-50 text-amber-900",
    blue: "border-blue-200 bg-blue-50 text-blue-800",
    violet: "border-violet-200 bg-violet-50 text-violet-900",
    pink: "border-pink-200 bg-pink-50 text-pink-900",
    red: "border-red-200 bg-red-50 text-red-900",
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <MarketingNavbar variant="dark" />

      {/* HERO */}
      <section className="relative overflow-hidden pt-28 sm:pt-32">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-zinc-900 via-black to-black" />
        <div className="absolute -inset-24 -z-10 bg-gradient-to-br from-emerald-400/20 via-teal-400/15 to-transparent blur-3xl rounded-[6rem]" />

        <div className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center text-white animate-in">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              🇪🇺 Directive EU 2022/2464
            </div>

            <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl">
              Reporting ESG Simplifié<br />
              <span className="bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-300 bg-clip-text text-transparent">
                avec la CSRD
              </span>
            </h1>
            <p className="mt-4 text-base text-white/80 sm:text-lg">
              La nouvelle directive européenne impose un reporting de durabilité complet. Notre plateforme IA vous guide à chaque étape — de la collecte des données à la publication du rapport.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button asChild className="bg-green-600 text-white hover:bg-green-700">
                <a href="#">Démarrer ma conformité →</a>
              </Button>
              <Button asChild variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white">
                <a href="#">En savoir plus</a>
              </Button>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-5">
                <div className="text-2xl font-extrabold text-emerald-300">50 000+</div>
                <div className="mt-1 text-xs font-semibold tracking-wide text-white/60 uppercase">
                  entreprises concernées dans l'UE
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-5">
                <div className="text-2xl font-extrabold text-emerald-300">10</div>
                <div className="mt-1 text-xs font-semibold tracking-wide text-white/60 uppercase">
                  standards ESRS obligatoires
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-5">
                <div className="text-2xl font-extrabold text-emerald-300">2025</div>
                <div className="mt-1 text-xs font-semibold tracking-wide text-white/60 uppercase">
                  1ers rapports obligatoires
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ALERT BANNER */}
      <section className="border-y bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-start gap-3 rounded-2xl border bg-white/70 p-5 backdrop-blur-sm">
            <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
              ⚡
            </div>
            <p className="text-sm text-blue-900/80">
              <span className="font-semibold">La CSRD est en vigueur depuis janvier 2024.</span> Les premières entreprises concernées doivent publier leur rapport de durabilité au titre de l'exercice 2024. Êtes-vous prêt ?
            </p>
          </div>
        </div>
      </section>

      {/* ESG PILLARS */}
      <section className="py-16">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-xs font-semibold text-green-700">
              <span className="h-2 w-2 rounded-full bg-green-600" />
              Les 4 Piliers
            </div>
            <h2 className="mt-6 text-3xl font-extrabold tracking-tight sm:text-4xl">Ce que la CSRD impose de publier</h2>
            <p className="mt-3 text-base text-muted-foreground">La directive couvre l'ensemble des enjeux ESG selon un cadre structuré de double matérialité</p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {ESG_PILLARS.map((p) => {
              const tone = pillarTone[p.tone] ?? pillarTone.green;
              return (
                <Card key={p.title} className={"shadow-sm border-t-4 " + tone.borderTop}>
                  <CardContent className="p-6">
                    <div className={"flex h-12 w-12 items-center justify-center rounded-xl text-xl " + tone.icon}>
                      {p.icon}
                    </div>
                    <div className={"mt-4 inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-bold " + tone.pill}>
                      {p.subtitle}
                    </div>
                    <h3 className="mt-3 text-base font-extrabold">{p.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{p.desc}</p>

                    <ul className="mt-4 space-y-2 text-sm">
                      {p.bullets.map((b) => (
                        <li key={b} className="flex items-start gap-2">
                          <span className={"mt-2 h-1.5 w-1.5 rounded-full " + tone.dot} />
                          <span className="text-muted-foreground">{b}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* ESRS STANDARDS */}
      <section className="py-16 bg-muted/30">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-xs font-semibold text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Normes ESRS
            </div>
            <h2 className="mt-6 text-3xl font-extrabold tracking-tight sm:text-4xl">Les 10 Standards ESRS Obligatoires</h2>
            <p className="mt-3 text-base text-muted-foreground">European Sustainability Reporting Standards — publiés par la Commission Européenne</p>
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {ESRS_STANDARDS.map((s) => (
              <div
                key={s.code}
                className={"min-w-[150px] rounded-xl border px-4 py-3 text-left " + (esrsTone[s.tone] ?? esrsTone.green)}
              >
                <div className="text-sm font-extrabold">{s.code}</div>
                <div className="mt-0.5 text-xs opacity-80">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TIMELINE */}
      <section className="py-16">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-xs font-semibold text-green-700">
              <span className="h-2 w-2 rounded-full bg-green-600" />
              Calendrier
            </div>
            <h2 className="mt-6 text-3xl font-extrabold tracking-tight sm:text-4xl">Calendrier de déploiement CSRD</h2>
            <p className="mt-3 text-base text-muted-foreground">Les étapes clés du déploiement progressif de la directive</p>
          </div>

          <div className="mt-10 grid gap-4">
            {TIMELINE.map((t) => (
              <Card key={t.year} className="shadow-sm">
                <CardContent className="p-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-4">
                      <div
                        className={
                          "flex h-12 w-12 items-center justify-center rounded-full text-xs font-extrabold text-center px-2 " +
                          (t.active ? "bg-green-600 text-white" : "bg-muted text-muted-foreground border")
                        }
                      >
                        {t.year}
                      </div>
                      <div>
                        <div
                          className={
                            "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-bold " +
                            (t.active
                              ? "border-green-200 bg-green-50 text-green-700"
                              : "border-border bg-card text-muted-foreground")
                          }
                        >
                          {t.active ? "✓ En vigueur" : "À venir"}
                        </div>
                        <div className="mt-2 text-base font-bold">{t.label}</div>
                        <div className="mt-1 text-sm text-muted-foreground">{t.sub}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* SOLUTIONS */}
      <section className="py-16 bg-muted/30">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-xs font-semibold text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Notre Solution
            </div>
            <h2 className="mt-6 text-3xl font-extrabold tracking-tight sm:text-4xl">La plateforme CSRD de ProVerdy</h2>
            <p className="mt-3 text-base text-muted-foreground">Tout ce qu'il vous faut pour produire un rapport de durabilité conforme, sans effort</p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {SOLUTIONS.map((s) => (
              <Card key={s.title} className="shadow-sm">
                <CardContent className="p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 text-xl">
                    {s.icon}
                  </div>
                  <h3 className="mt-3 text-base font-extrabold">{s.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>

                  <ul className="mt-4 space-y-2 text-sm">
                    {s.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-2">
                        <span className="mt-2 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        <span className="text-muted-foreground">{b}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="py-16">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-xs font-semibold text-green-700">
              <span className="h-2 w-2 rounded-full bg-green-600" />
              Comment ça marche
            </div>
            <h2 className="mt-6 text-3xl font-extrabold tracking-tight sm:text-4xl">Le processus CSRD en 5 étapes</h2>
            <p className="mt-3 text-base text-muted-foreground">Un parcours guidé de la collecte des données à la publication</p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {STEPS.map((s) => (
              <Card key={s.num} className="shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-600 text-white text-sm font-extrabold">
                      {s.num}
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold">{s.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ADVANTAGES */}
      <section className="py-16 bg-muted/30">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-xs font-semibold text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Nos Avantages
            </div>
            <h2 className="mt-6 text-3xl font-extrabold tracking-tight sm:text-4xl">Pourquoi choisir ProVerdy pour la CSRD ?</h2>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {ADVANTAGES.map((a) => (
              <Card key={a.title} className="shadow-sm">
                <CardContent className="p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 text-xl">
                    {a.icon}
                  </div>
                  <h3 className="mt-3 text-base font-extrabold">{a.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{a.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CBAM CROSSLINK */}
      <section className="py-10">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-green-200 bg-green-50 p-6 sm:flex-row sm:items-center">
            <p className="text-sm text-green-800">
              🔗 <span className="font-extrabold text-green-900">CSRD & CBAM vont de pair.</span> Gérez votre conformité carbone et votre reporting ESG depuis une seule plateforme intégrée.
            </p>
            <Button asChild className="bg-green-600 text-white hover:bg-green-700">
              <a href="/cbam">Découvrir notre solution CBAM →</a>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-zinc-900 via-black to-black" />
        <div className="absolute -inset-24 -z-10 bg-gradient-to-br from-emerald-400/20 via-teal-400/15 to-transparent blur-3xl rounded-[6rem]" />

        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center text-white">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Prêt pour votre rapport CSRD ?</h2>
            <p className="mt-4 text-base text-white/80">
              Ne laissez pas la directive CSRD vous prendre de court. Commencez dès aujourd'hui avec notre accompagnement expert et notre plateforme IA.
            </p>
            <div className="mt-8 flex justify-center">
              <Button asChild className="bg-green-600 text-white hover:bg-green-700">
                <a href="#">Lancer ma conformité CSRD →</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t bg-black text-white">
        <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div className="lg:col-span-2">
              <div className="text-xl font-extrabold tracking-tight">
                🌿 Pro<span className="text-emerald-300">Verdy</span>
              </div>
              <div className="mt-2 text-sm text-white/70">Lead with Purpose. Grow with Impact.</div>
              <div className="mt-5 flex items-center gap-3">
                <a href="#" className="text-sm font-semibold text-white/70 hover:text-white">LinkedIn</a>
                <a href="#" className="text-sm font-semibold text-white/70 hover:text-white">Facebook</a>
              </div>
            </div>

            <div>
              <div className="text-sm font-bold">Entreprise</div>
              <div className="mt-3 grid gap-2 text-sm">
                <a href="#" className="text-white/70 hover:text-white">Cas d'usage</a>
                <a href="#" className="text-white/70 hover:text-white">À propos</a>
                <a href="#" className="text-white/70 hover:text-white">Contact</a>
              </div>
            </div>

            <div>
              <div className="text-sm font-bold">Produit</div>
              <div className="mt-3 grid gap-2 text-sm">
                <a href="#" className="text-white/70 hover:text-white">Bilan Carbone</a>
                <a href="#" className="text-white/70 hover:text-white">Empreinte Produit</a>
                <a href="#" className="text-white/70 hover:text-white">CBAM</a>
                <a href="#" className="text-white/70 hover:text-white">CSRD</a>
              </div>
            </div>
          </div>

          <div className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-white/60">
            © 2024 ProVerdy. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}