import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MarketingNavbar } from "@/components/marketing/MarketingNavbar";
import Footer from "./Footer";
import { motion } from "framer-motion";


const SECTORS = [
  { name: "Steel", desc: "Iron and steel products", price: "€45/tonne CO₂", icon: "🏗️" },
  { name: "Cement", desc: "Cement and clinker", price: "€52/tonne CO₂", icon: "🏛️" },
  { name: "Aluminum", desc: "Aluminum products", price: "€38/tonne CO₂", icon: "⚙️" },
  { name: "Fertilizers", desc: "Nitrogen fertilizers", price: "€41/tonne CO₂", icon: "🌱" },
  { name: "Electricity", desc: "Electric power", price: "€35/tonne CO₂", icon: "⚡" },
  { name: "Hydrogen", desc: "Hydrogen production", price: "€28/tonne CO₂", icon: "🔬" },
];

const TIMELINE = [
  { year: "2023", label: "Regulation Adopted", next: "2024" },
  { year: "2024", label: "Reporting Phase Begins", next: "2025" },
  { year: "2025", label: "System Refinements", next: "2026" },
  { year: "2026", label: "Financial Obligations Start", next: "2027" },
  { year: "2027", label: "Full Implementation", next: "2028" },
  { year: "2028–2030", label: "Sector Expansion", next: "2031" },
  { year: "2031–2034", label: "Complete Integration", next: "" },
];

const SOLUTIONS = [
  {
    icon: "⚡",
    title: "Automatic Calculations",
    desc: "AI-powered carbon intensity calculations for all CBAM sectors",
    bullets: ["Real-time emission factors", "Automated data processing"],
  },
  {
    icon: "📋",
    title: "Compliant Reporting",
    desc: "Generate CBAM-compliant reports automatically",
    bullets: ["EU-approved methodologies", "Audit-ready documentation"],
  },
  {
    icon: "📊",
    title: "Strategic Insights",
    desc: "Optimize your supply chain for CBAM compliance",
    bullets: ["Cost impact analysis", "Supplier optimization", "Risk assessment"],
  },
];

const STEPS = [
  { num: "01", title: "Monitor Imports", desc: "Track all imports from CBAM sectors" },
  { num: "02", title: "Calculate Emissions", desc: "Determine embedded carbon content" },
  { num: "03", title: "Verify Data", desc: "Ensure data accuracy and compliance" },
  { num: "04", title: "Submit Reports", desc: "File quarterly CBAM reports" },
  { num: "05", title: "Purchase Certificates", desc: "Buy CBAM certificates as required" },
];

const ADVANTAGES = [
  { icon: "💰", title: "Cost Optimization", desc: "Minimize CBAM certificate costs through smart sourcing" },
  { icon: "🏆", title: "Competitive Edge", desc: "Gain advantage over non-compliant competitors" },
  { icon: "🤖", title: "Simplified Process", desc: "Automate complex CBAM calculations and reporting" },
  { icon: "💡", title: "Innovation Driver", desc: "Drive innovation in low-carbon technologies" },
];

export default function CbamPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background text-foreground">
      <MarketingNavbar variant="light" />

{/* HERO */}
<section className="relative overflow-hidden border-b bg-gradient-to-b from-white via-green-50/20 to-green-50/40 min-h-screen pt-28 pb-20 sm:pt-32">
  {/* Background glow */}
  <div className="absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-green-300/20 blur-3xl animate-pulse" />

  <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center justify-center gap-10 h-full">

    {/* LEFT: TEXT & CTA */}
    <motion.div
      className="max-w-2xl text-center lg:text-left"
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8 }}
    >
      <br/><br/><br/>
      <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
        Conformité CBAM 
        <span className="block text-green-600">Simplifié</span>
      </h1>

      <motion.p
        className="mt-5 text-base text-muted-foreground sm:text-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8 }}
      >
        Le Mécanisme d'Ajustement Carbone aux Frontières (CBAM) oblige les entreprises importatrices de biens dans l'UE à déclarer leurs émissions de carbone intégrées. Notre plateforme vous aide à calculer, surveiller et déclarer les émissions automatiquement — garantissant une conformité totale.
      </motion.p>

      {/* BUTTONS */}
      <motion.div
        className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row sm:justify-start"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.8 }}
      >
        <Button className="bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-200 hover:scale-105 transition-transform" onClick={() => navigate("/book-demo")}>
          Demo
        </Button>
        <Button variant="outline">En savoir plus</Button>
      </motion.div>

      {/* BADGES */}
      <motion.div
        className="mt-10 flex flex-wrap justify-center lg:justify-start gap-6 text-sm text-green-700 font-medium"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.8 }}
      >
        <div className="flex items-center gap-2">Conformité à l'UE</div>
        <div className="flex items-center gap-2">Rapports automatisés</div>
        <div className="flex items-center gap-2"> Calculs de carbone par IA</div>
      </motion.div>
    </motion.div>

    {/* RIGHT: LOGO / IMAGE */}
    <motion.div
      className="flex-shrink-0"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1, duration: 1, type: "spring", stiffness: 100 }}
    >
      <img
        src="/CBAM_Beratung_Logo.svg"
        alt="CBAM regulation illustration"
        className="w-48 md:w-56 lg:w-64 object-contain animate-float"
      />
    </motion.div>

  </div>
</section>



      {/* SECTORS */}
      <section className="py-16">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            
            <h2 className="mt-6 text-3xl font-extrabold tracking-tight sm:text-4xl">CBAM Covered Sectors</h2>
            <p className="mt-3 text-base text-muted-foreground">Current and upcoming sectors under CBAM regulation</p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {SECTORS.map((s) => (
              <Card key={s.name} className="shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-3xl">{s.icon}</div>
                      <h3 className="mt-3 text-lg font-bold">{s.name}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
                    </div>
                    
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border bg-card p-5 text-sm text-muted-foreground">
            🔔 <span className="font-semibold text-foreground">Sector Expansion Coming</span> — The EU plans to expand CBAM to additional sectors including chemicals, plastics, and more by 2030.
          </div>
        </div>
      </section>

     {/* TIMELINE - HORIZONTAL SCROLL */}
<section className="py-16 bg-green-50/20">
  <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
    <div className="mx-auto max-w-3xl text-center">
      <h2 className="mt-6 text-3xl font-extrabold tracking-tight sm:text-4xl text-green-800">
        CBAM Implementation Timeline
      </h2>
      <p className="mt-3 text-base text-green-900/70">
        Key milestones in the CBAM rollout process
      </p>
    </div>

    {/* Horizontal scroll container */}
    <div className="mt-10 flex gap-6 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-green-300 scrollbar-track-green-50">
      {TIMELINE.map((t, i) => (
        <motion.div
          key={t.year}
          className="min-w-[250px] flex-shrink-0 rounded-2xl border-t-4 border-green-600 bg-white/90 shadow-md p-6 hover:shadow-lg transition-shadow"
          whileHover={{ y: -5 }}
        >
          <div className="flex items-center gap-4 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600 text-sm font-extrabold">
              {i + 1}
            </div>
            <div>
              <div className="text-sm font-semibold text-green-900/70">{t.year}</div>
              <div className="text-lg font-bold text-green-800">{t.label}</div>
            </div>
          </div>
          {t.next && (
            <div className="text-sm font-semibold text-green-600 mt-2">→ {t.next}</div>
          )}
        </motion.div>
      ))}
    </div>

    
  </div>
</section>



      
   {/* PROCESS - Simplified & Modern */}
<section className="py-16 bg-green-50">
  <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
    <div className="mx-auto max-w-3xl text-center space-y-4">
      <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-green-900">
        CBAM Compliance Process
      </h2>
      <p className="text-green-800/70">
        Five steps to ensure full CBAM compliance
      </p>
    </div>

    <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {STEPS.map((s) => (
        <div
          key={s.num}
          className="group p-6 bg-white rounded-2xl shadow hover:shadow-lg transition-shadow duration-300 cursor-pointer"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-600 text-white font-bold">
              {s.num}
            </div>
            <div>
              <h3 className="text-base font-semibold text-green-900">{s.title}</h3>
              <p className="mt-1 text-sm text-green-800/70">{s.desc}</p>
            </div>
          </div>
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

      <Footer />
    </div>
  );
}