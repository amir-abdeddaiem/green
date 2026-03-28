import MarketingNavbar from '@/components/marketing/MarketingNavbar';
import Footer from '../Footer';
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
 import { motion } from "framer-motion";
export default function IndustrieSectorPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-white">
      <MarketingNavbar variant="light" />
      {/* Hero Section */}
      <section className="pt-28 pb-20 bg-gradient-to-br from-white via-white to-slate-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
            <br/><br/>
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            <div className="space-y-8">
              

              <h1 className="text-5xl lg:text-6xl font-semibold tracking-tight leading-tight text-slate-900">
                Décarbonisez votre <span className="text-green-700">industrie</span>
                <br />
                en toute simplicité
              </h1>

              <p className="text-lg lg:text-xl text-slate-600 max-w-xl leading-relaxed">
                Mesurez, analysez et réduisez vos émissions carbone tout en assurant votre conformité ESG et réglementaire.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button className="px-7 py-4 bg-green-700 hover:bg-green-800 text-white rounded-2xl font-semibold text-base transition-colors shadow-sm">
                  Démarrer gratuitement
                </button>
                <button className="px-7 py-4 border border-slate-300 text-slate-900 hover:bg-slate-50 rounded-2xl font-semibold text-base transition-colors">
                  Voir une démo
                </button>
              </div>

              <ul className="grid sm:grid-cols-2 gap-2 text-sm text-slate-600 list-disc pl-5">
                <li>Conformité internationale</li>
                <li>Intégration ERP & IoT</li>
              </ul>
            </div>

            {/* Hero Visual */}
            <div className="relative">
              <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
                <div className="p-10">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <div className="text-sm text-slate-500">Émissions totales 2025</div>
                      <div className="text-5xl font-semibold tracking-tight text-green-700">12 450 tCO₂e</div>
                      <div className="text-sm font-medium text-emerald-700">-18% vs 2024</div>
                    </div>

                    <div className="space-y-5">
                      <div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">Scope 1</span>
                          <span className="font-medium text-slate-900">3 240 t</span>
                        </div>
                        <div className="mt-2 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full w-[65%] bg-green-700" />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">Scope 2</span>
                          <span className="font-medium text-slate-900">4 810 t</span>
                        </div>
                        <div className="mt-2 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full w-[85%] bg-green-500" />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">Scope 3</span>
                          <span className="font-medium text-slate-900">4 400 t</span>
                        </div>
                        <div className="mt-2 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full w-[55%] bg-green-300" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Objectif Section */}
      <section className="py-24 bg-green-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-semibold tracking-tight text-slate-900">Simplifier la gestion environnementale<br />des entreprises industrielles</h2>
          </div>

          <div className="max-w-3xl mx-auto text-center text-slate-600 text-lg lg:text-xl leading-relaxed">
            La plateforme Verdustry aide les industries à mesurer, analyser et réduire leurs émissions carbone tout en garantissant une parfaite conformité aux réglementations internationales et aux exigences ESG.
          </div>
        </div>
      </section>
     


      {/* Problèmes Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-semibold tracking-tight text-slate-900">Les problèmes que rencontrent les industries aujourd’hui</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Problème 1 */}
            <div className="bg-white border border-slate-200 rounded-3xl p-10 hover:border-green-200 transition-colors">
              <h3 className="text-xl font-semibold mb-3 text-slate-900">Complexité des émissions</h3>
              <p className="text-slate-600 leading-relaxed">
                Les émissions proviennent de multiples sources : énergie, production, transport, matières premières et logistique. Identifier et quantifier chaque poste est un vrai défi.
              </p>
            </div>

            {/* Problème 2 */}
            <div className="bg-white border border-slate-200 rounded-3xl p-10 hover:border-green-200 transition-colors">
              <h3 className="text-xl font-semibold mb-3 text-slate-900">Pression réglementaire</h3>
              <p className="text-slate-600 leading-relaxed">
                Exigences croissantes en matière de reporting carbone (CSRD, CBAM, EU ETS…) et ESG pour accéder aux marchés européens et internationaux.
              </p>
            </div>

            {/* Problème 3 */}
            <div className="bg-white border border-slate-200 rounded-3xl p-10 hover:border-green-200 transition-colors">
              <h3 className="text-xl font-semibold mb-3 text-slate-900">Données dispersées</h3>
              <p className="text-slate-600 leading-relaxed">
                Les données environnementales sont éparpillées entre ERP, factures, capteurs IoT, Excel et systèmes internes. La collecte et la consolidation deviennent un cauchemar.
              </p>
            </div>
          </div>
        </div>
      </section>

<section className="py-20 rounded-[5rem] bg-green-700 text-white relative overflow-hidden">
  {/* subtle background glow */}
  <div className="absolute -top-20 -left-20 w-[500px] h-[500px] bg-green-600/20 rounded-full blur-3xl animate-pulse" />
  <div className="absolute -bottom-20 -right-20 w-[400px] h-[400px] bg-green-500/20 rounded-full blur-3xl animate-pulse" />

  <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
    <motion.p
      className="text-3xl lg:text-4xl font-medium leading-snug sm:leading-relaxed"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 1 }}
    >
      La plateforme permet aux entreprises industrielles de{" "}
      <span className="text-white/90 font-semibold">collecter automatiquement</span>{" "},
      <span className="text-white/90 font-semibold">analyser leur empreinte carbone</span>{" "} 
      et <span className="text-white/90 font-semibold">générer des rapports conformes</span>{" "}
      aux exigences ESG et internationales.
    </motion.p>
  </div>
</section>
      {/* Solutions Section */}
      <section className="py-24 bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="text-green-700 font-semibold tracking-widest text-xs mb-3">SOLUTIONS</div>
            <h2 className="text-4xl lg:text-5xl font-semibold tracking-tight text-slate-900">Comment Verdustry vous accompagne</h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {[
              {
                title: "Collecte intelligente des données",
                desc: "Automatisation complète depuis vos ERP, factures, systèmes de production et capteurs IoT. Plus de saisie manuelle."
              },
              {
                title: "Analyse de la supply chain",
                desc: "Cartographie précise des émissions Scope 3 et identification des fournisseurs à fort impact carbone."
              },
              {
                title: "Tableaux de bord & aide à la décision",
                desc: "Visualisations claires, KPIs en temps réel et simulations pour identifier les meilleurs leviers de réduction."
              },
              {
                title: "Stratégie de décarbonisation",
                desc: "Plans d’action personnalisés avec trajectoire de réduction compatible avec les objectifs Science Based Targets (SBTi)."
              },
              {
                title: "Reporting & conformité automatique",
                desc: "Génération instantanée de rapports conformes CSRD, GHG Protocol, ISO 14064, et autres standards internationaux."
              },
              {
                title: "Analyse du cycle de vie (ACV)",
                desc: "Évaluation complète des impacts environnementaux de vos produits du berceau à la tombe."
              }
            ].map((solution, index) => (
              <div key={index} className="bg-white border border-slate-200 rounded-3xl p-10 hover:shadow-lg transition-shadow hover:border-green-200">
                <h3 className="text-xl font-semibold mb-3 text-slate-900">{solution.title}</h3>
                <p className="text-slate-600 leading-relaxed">{solution.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Collaboration Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-5">
              <div className="sticky top-28">
                <div className="text-green-700 text-xs font-semibold tracking-widest mb-4">COLLABORATION</div>
                <h2 className="text-4xl lg:text-5xl font-semibold tracking-tight leading-tight text-slate-900">
                  Travaillez ensemble vers une industrie plus durable
                </h2>
                <p className="mt-8 text-slate-600 text-lg leading-relaxed">
                  Partagez des données en temps réel avec vos équipes, vos experts ESG et vos consultants externes dans un environnement sécurisé et auditable.
                </p>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="bg-white border border-slate-200 rounded-3xl p-12 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                  <div className="space-y-4">
                    <div className="font-semibold">Direction Industrielle</div>
                    <div className="text-sm text-slate-500">Pilotage opérationnel et optimisation des process</div>
                  </div>
                  <div className="space-y-4">
                    <div className="font-semibold">Équipe RSE / ESG</div>
                    <div className="text-sm text-slate-500">Reporting, stratégie et conformité</div>
                  </div>
                  <div className="space-y-4">
                    <div className="font-semibold">Experts externes</div>
                    <div className="text-sm text-slate-500">Consultants et auditeurs</div>
                  </div>
                </div>
              </div>
            </div>
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