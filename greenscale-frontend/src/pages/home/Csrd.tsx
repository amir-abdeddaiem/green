import MarketingNavbar from "@/components/marketing/MarketingNavbar";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Footer from "./Footer";  
import { motion } from "framer-motion";
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
    tone: "green",
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
    
    title: "Collecte Automatisée",
    desc: "Collectez automatiquement vos données ESG depuis vos systèmes existants.",
    bullets: ["Connexion ERP & SI", "Import multi-sources", "Validation en temps réel"],
  },
  {
   
    title: "Rapport ESRS Conforme",
    desc: "Générez des rapports conformes aux normes ESRS approuvées par l'UE.",
    bullets: ["Standards ESRS E1–S4–G1", "Prêt pour l'audit", "Format XBRL inclus"],
  },
  {
    
    title: "Double Matérialité",
    desc: "Réalisez votre analyse de double matérialité avec notre assistant IA.",
    bullets: ["Matérialité financière", "Matérialité d'impact", "Cartographie des parties prenantes"],
  },
  {
    
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
  {  title: "Gain de Temps", desc: "Réduisez jusqu'à 70% le temps de préparation de votre rapport de durabilité." },
  {  title: "Conformité Garantie", desc: "Toujours aligné avec les dernières normes ESRS et mises à jour réglementaires." },
  {  title: "Audit-Ready", desc: "Documentation structurée et traçable, prête pour la vérification tierce partie." },
  {  title: "Vision Intégrée", desc: "Pilotez vos performances ESG et CBAM depuis une plateforme unifiée." },
];

const ESRS_STANDARDS = [
  { code: "ESRS E1", label: "Changement climatique", tone: "green" },
  { code: "ESRS E2", label: "Pollution", tone: "green" },
  { code: "ESRS E3", label: "Eau & ressources marines", tone: "green" },
  { code: "ESRS E4", label: "Biodiversité", tone: "green" },
  { code: "ESRS E5", label: "Économie circulaire", tone: "green" },
  { code: "ESRS S1", label: "Effectifs propres", tone: "green" },
  { code: "ESRS S2", label: "Travailleurs chaîne valeur", tone: "green" },
  { code: "ESRS S3", label: "Communautés locales", tone: "green" },
  { code: "ESRS S4", label: "Consommateurs & utilisateurs", tone: "green" },
  { code: "ESRS G1", label: "Conduite des affaires", tone: "green" },
];

export default function CsrdPage() {
  const navigate = useNavigate();
  const pillarTone: Record<string, { pill: string; icon: string; borderTop: string; dot: string }> = {
    green: {
      pill: "border-green-200 bg-green-50 text-green-700",
      icon: "bg-green-100 text-green-700",
      borderTop: "border-t-green-500",
      dot: "bg-green-600",
    },
    // green: {
    //   pill: "border-green-200 bg-green-50 text-green-700",
    //   icon: "bg-green-100 text-green-700",
    //   borderTop: "border-t-green-500",
    //   dot: "bg-green-500",
    // },
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
    // green: "border-green-200 bg-green-50 text-green-800",
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
      <MarketingNavbar variant="light" />

   {/* HERO SECTION */}
<section className="relative overflow-hidden border-b bg-gradient-to-b from-green-100/40 via-green-50/20 to-green-50/40 pt-28 pb-20 sm:pt-32 min-h-screen">
  {/* Background glow */}
  <div className="absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-green-300/20 blur-3xl animate-pulse" />

  <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center justify-center gap-10 h-full">

    {/* LEFT: TEXT */}
    <motion.div
      className="max-w-2xl text-center lg:text-left"
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8 }}
    >
      <br /><br /><br />
      <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
         Conformité CSRD 
        <span className="block text-green-600">Simplifié</span>
      </h1>

      <motion.p
        className="mt-4 text-base text-muted-foreground sm:text-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8 }}
      >
        Collectez des données ESG, analysez la matérialité et générez des rapports prêts pour l'audit.
      </motion.p>

      <motion.p
        className="mt-4 text-sm text-green-700/80 sm:text-base"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
      >
        La Directive sur le Reporting de Durabilité des Entreprises (CSRD) garantit que les entreprises rendent compte de leurs impacts environnementaux, sociaux et de gouvernance de manière normalisée. La conformité n'est pas seulement une obligation légale, elle renforce également la confiance des investisseurs et des parties prenantes. Commencez tôt pour simplifier le reporting et éviter le stress de dernière minute.
      </motion.p>

      <motion.div
        className="mt-6 flex flex-col items-center justify-center gap-4 sm:flex-row sm:justify-start"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.8 }}
      >
        <Button className="bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-200 hover:scale-105 transition-transform" onClick={() => navigate("/book-demo")}>
          Demo
        </Button>

        <Button variant="outline">En savoir plus</Button>
      </motion.div>

      {/* Quick badges / highlights */}
      <motion.div
        className="mt-8 flex flex-wrap justify-center lg:justify-start gap-4 text-sm text-green-700 font-medium"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.8 }}
      >
        <span className="px-3 py-1 bg-green-100 rounded-full">Conforme aux ESRS</span>
        <span className="px-3 py-1 bg-green-100 rounded-full">Double matérialité</span>
        <span className="px-3 py-1 bg-green-100 rounded-full">Automatisation ESG</span>
      </motion.div>
    </motion.div>

    {/* RIGHT: IMAGE */}
    <motion.div
      className="flex-shrink-0"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1, duration: 1, type: "spring", stiffness: 100 }}
    >
      <img
        src="/csrd.svg"
        alt="CSRD illustration"
        className="w-48 md:w-56 lg:w-64 object-contain animate-float"
      />
    </motion.div>

  </div>
</section>
     <section className="py-16 bg-green-50/20">
  <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
    <div className="mx-auto max-w-3xl text-center">
      

      <h2 className="mt-6 text-3xl font-extrabold tracking-tight sm:text-4xl text-green-800">
        Ce que la CSRD impose de publier
      </h2>
      <p className="mt-3 text-base text-green-900/70">
        La directive couvre l'ensemble des enjeux ESG selon un cadre structuré de double matérialité
      </p>
    </div>

    <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {ESG_PILLARS.map((p) => {
        const tone = {
          borderTop: "border-t-4 border-green-600",
          icon: "text-green-600",
          pill: "bg-green-100 text-green-800",
          dot: "bg-green-600"
        };

        return (
          <Card
            key={p.title}
            className={
              "shadow-md border border-green-100 rounded-2xl bg-white/90 hover:shadow-lg transition-shadow duration-300 " +
              tone.borderTop
            }
          >
            <CardContent className="p-6">
              <h3 className="mt-3 text-lg font-extrabold text-green-800">{p.title}</h3>
              <p className="mt-2 text-sm text-green-900/70">{p.desc}</p>

              <ul className="mt-4 space-y-2 text-sm">
                {p.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2">
                    <span className={"mt-2 h-1.5 w-1.5 rounded-full " + tone.dot} />
                    <span className="text-green-900/80">{b}</span>
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
      <section className="py-16 bg-muted/30 bg-gradient-to-b from-green-100 to-muted/50">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            
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

     <section className="py-16 bg-green-50/10">
  <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
    {/* Header */}
    <div className="mx-auto max-w-3xl text-center">
      
      <h2 className="mt-6 text-3xl font-extrabold tracking-tight sm:text-4xl text-green-800">
        Calendrier de déploiement CSRD
      </h2>
      <p className="mt-3 text-base text-green-900/70">
        Les étapes clés du déploiement progressif de la directive
      </p>
    </div>

    {/* Timeline horizontal */}
    <div className="mt-10 flex gap-6 overflow-x-auto py-6 px-2">
      {TIMELINE.map((t) => (
        <Card
          key={t.year}
          className="min-w-[220px] flex-shrink-0 shadow-md rounded-2xl bg-white/90 border border-green-100"
        >
          <CardContent className="p-6">
            <div className="flex flex-col gap-3 items-start">
              <div
                className={
                  "flex h-12 w-12 items-center justify-center rounded-full text-xs font-extrabold text-center px-2 " +
                  (t.active ? "bg-green-600 text-white" : "bg-green-100 text-green-800 border")
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
                      : "border-green-100 bg-white text-green-800/70")
                  }
                >
                  {t.active ? "✓ En vigueur" : "À venir"}
                </div>
                <div className="mt-2 text-base font-bold text-green-800">{t.label}</div>
                <div className="mt-1 text-sm text-green-900/70">{t.sub}</div>
              </div>
            </div>
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

     

      

 
   {/* FINAL CTA  */}
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