import MarketingNavbar from '@/components/marketing/MarketingNavbar';
import React from 'react';
import Footer from '../Footer';

const V = {
  primary: "#16a34a",           // green-600
  primaryLight: "#4ade80",
  primaryDark: "#15803d",
  accent: "#86efac",
  
  bg: "#ffffff",
  surface: "#f8fafc",
  card: "#ffffff",
  
  text: "#0f172a",
  textMuted: "#475569",
  textLight: "#64748b",
  
  border: "#e2e8f0",
  borderHover: "#16a34a",
  
  shadow: "0 10px 30px -15px rgba(22, 163, 74, 0.15)",
  shadowLg: "0 25px 50px -20px rgba(22, 163, 74, 0.18)",
  glow: "0 0 25px rgba(74, 222, 128, 0.25)",
};

export default function IndustrieSectorPage() {
  return (
    <div className="min-h-screen bg-white font-sans">
        <MarketingNavbar variant="light"/>
      {/* Hero Section */}
      <section className="pt-24 pb-20 bg-gradient-to-br from-white via-white to-[#f8fafc] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#16a34a]/20 bg-white text-[#16a34a] text-sm font-medium">
                <span className="w-2 h-2 bg-[#16a34a] rounded-full animate-pulse"></span>
                Secteur Industrie
              </div>

              <h1 className="text-6xl lg:text-7xl font-bold leading-tight text-[#0f172a]">
                Décarbonisez votre <span className="text-[#16a34a]">industrie</span><br />
                en toute simplicité
              </h1>

              <p className="text-2xl text-[#475569] max-w-lg">
                Mesurez, analysez et réduisez vos émissions carbone tout en assurant votre conformité ESG et réglementaire.
              </p>

              <div className="flex items-center gap-4">
                <button className="px-8 py-4 bg-[#16a34a] hover:bg-[#15803d] text-white rounded-2xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl">
                  Démarrer gratuitement
                </button>
                <button className="px-8 py-4 border-2 border-[#16a34a] text-[#16a34a] hover:bg-[#16a34a]/5 rounded-2xl font-semibold text-lg transition-all">
                  Voir une démo
                </button>
              </div>

              <div className="flex items-center gap-8 text-sm text-[#64748b]">
                <div className="flex items-center gap-2">
                  <span className="text-[#16a34a]">✓</span> Conformité internationale
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#16a34a]">✓</span> Intégration ERP & IoT
                </div>
              </div>
            </div>

            {/* Hero Visual */}
            <div className="relative">
              <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#e2e8f0]">
                <div className="h-12 bg-[#f8fafc] border-b flex items-center px-4 gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="mx-auto text-xs text-[#64748b]">verdustry.com/industrie/dashboard</div>
                </div>
                <div className="p-8 bg-white">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="text-sm text-[#64748b]">Émissions totales 2025</div>
                      <div className="text-5xl font-bold text-[#16a34a]">12 450 tCO₂e</div>
                      <div className="text-sm text-emerald-600 flex items-center gap-1">
                        ↓ 18% vs 2024
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Scope 1</span>
                          <span className="font-medium">3 240 t</span>
                        </div>
                        <div className="h-2 bg-[#e2e8f0] rounded-full overflow-hidden">
                          <div className="h-full w-[65%] bg-[#16a34a]"></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Scope 2</span>
                          <span className="font-medium">4 810 t</span>
                        </div>
                        <div className="h-2 bg-[#e2e8f0] rounded-full overflow-hidden">
                          <div className="h-full w-[85%] bg-[#4ade80]"></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Scope 3</span>
                          <span className="font-medium">4 400 t</span>
                        </div>
                        <div className="h-2 bg-[#e2e8f0] rounded-full overflow-hidden">
                          <div className="h-full w-[55%] bg-[#86efac]"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating badge */}
              <div className="absolute -top-6 -right-6 bg-white px-6 py-3 rounded-2xl shadow-xl border border-[#16a34a]/10 flex items-center gap-3">
                <div className="text-[#16a34a] text-2xl">🌱</div>
                <div>
                  <div className="font-semibold text-sm">Objectif atteint</div>
                  <div className="text-xs text-[#64748b]">Décarbonation 2026</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Objectif Section */}
      <section className="py-24 bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="text-[#16a34a] font-medium tracking-widest text-sm mb-3">NOTRE MISSION POUR L’INDUSTRIE</div>
            <h2 className="text-5xl font-bold text-[#0f172a]">Simplifier la gestion environnementale<br />des entreprises industrielles</h2>
          </div>

          <div className="max-w-3xl mx-auto text-center text-[#475569] text-xl leading-relaxed">
            La plateforme Verdustry aide les industries à mesurer, analyser et réduire leurs émissions carbone tout en garantissant une parfaite conformité aux réglementations internationales et aux exigences ESG.
          </div>
        </div>
      </section>

      {/* Problèmes Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline px-5 py-2 bg-red-50 text-red-700 rounded-full text-sm font-medium mb-4">⚠️ Défis majeurs</div>
            <h2 className="text-5xl font-bold text-[#0f172a]">Les problèmes que rencontrent les industries aujourd’hui</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Problème 1 */}
            <div className="bg-white border border-[#e2e8f0] rounded-3xl p-10 hover:border-[#16a34a]/30 transition-all group">
              <div className="text-4xl mb-6">🔄</div>
              <h3 className="text-2xl font-semibold mb-4 text-[#0f172a]">Complexité des émissions</h3>
              <p className="text-[#475569] leading-relaxed">
                Les émissions proviennent de multiples sources : énergie, production, transport, matières premières et logistique. Identifier et quantifier chaque poste est un vrai défi.
              </p>
            </div>

            {/* Problème 2 */}
            <div className="bg-white border border-[#e2e8f0] rounded-3xl p-10 hover:border-[#16a34a]/30 transition-all group">
              <div className="text-4xl mb-6">📜</div>
              <h3 className="text-2xl font-semibold mb-4 text-[#0f172a]">Pression réglementaire</h3>
              <p className="text-[#475569] leading-relaxed">
                Exigences croissantes en matière de reporting carbone (CSRD, CBAM, EU ETS…) et ESG pour accéder aux marchés européens et internationaux.
              </p>
            </div>

            {/* Problème 3 */}
            <div className="bg-white border border-[#e2e8f0] rounded-3xl p-10 hover:border-[#16a34a]/30 transition-all group">
              <div className="text-4xl mb-6">📊</div>
              <h3 className="text-2xl font-semibold mb-4 text-[#0f172a]">Données dispersées</h3>
              <p className="text-[#475569] leading-relaxed">
                Les données environnementales sont éparpillées entre ERP, factures, capteurs IoT, Excel et systèmes internes. La collecte et la consolidation deviennent un cauchemar.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section className="py-24 bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="text-[#16a34a] font-medium text-sm tracking-widest mb-3">SOLUTIONS CONCRÈTES</div>
            <h2 className="text-5xl font-bold text-[#0f172a]">Comment Verdustry vous accompagne</h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {[
              {
                icon: "🔌",
                title: "Collecte intelligente des données",
                desc: "Automatisation complète depuis vos ERP, factures, systèmes de production et capteurs IoT. Plus de saisie manuelle."
              },
              {
                icon: "🔗",
                title: "Analyse de la supply chain",
                desc: "Cartographie précise des émissions Scope 3 et identification des fournisseurs à fort impact carbone."
              },
              {
                icon: "📈",
                title: "Tableaux de bord & aide à la décision",
                desc: "Visualisations claires, KPIs en temps réel et simulations pour identifier les meilleurs leviers de réduction."
              },
              {
                icon: "🎯",
                title: "Stratégie de décarbonisation",
                desc: "Plans d’action personnalisés avec trajectoire de réduction compatible avec les objectifs Science Based Targets (SBTi)."
              },
              {
                icon: "📋",
                title: "Reporting & conformité automatique",
                desc: "Génération instantanée de rapports conformes CSRD, GHG Protocol, ISO 14064, et autres standards internationaux."
              },
              {
                icon: "♻️",
                title: "Analyse du cycle de vie (ACV)",
                desc: "Évaluation complète des impacts environnementaux de vos produits du berceau à la tombe."
              }
            ].map((solution, index) => (
              <div key={index} className="bg-white border border-[#e2e8f0] rounded-3xl p-10 hover:shadow-xl transition-all group hover:border-[#16a34a]/40">
                <div className="text-5xl mb-8 group-hover:scale-110 transition-transform">{solution.icon}</div>
                <h3 className="text-2xl font-semibold mb-4 text-[#0f172a]">{solution.title}</h3>
                <p className="text-[#475569] leading-relaxed">{solution.desc}</p>
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
                <div className="text-[#16a34a] text-sm font-medium mb-4">COLLABORATION</div>
                <h2 className="text-5xl font-bold leading-tight text-[#0f172a]">
                  Travaillez ensemble vers une industrie plus durable
                </h2>
                <p className="mt-8 text-[#475569] text-lg">
                  Partagez des données en temps réel avec vos équipes, vos experts ESG et vos consultants externes dans un environnement sécurisé et auditable.
                </p>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="bg-white border border-[#e2e8f0] rounded-3xl p-12 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                  <div className="space-y-4">
                    <div className="mx-auto w-16 h-16 bg-[#16a34a]/10 rounded-2xl flex items-center justify-center text-3xl">🏭</div>
                    <div className="font-semibold">Direction Industrielle</div>
                    <div className="text-sm text-[#64748b]">Pilotage opérationnel et optimisation des process</div>
                  </div>
                  <div className="space-y-4">
                    <div className="mx-auto w-16 h-16 bg-[#16a34a]/10 rounded-2xl flex items-center justify-center text-3xl">📊</div>
                    <div className="font-semibold">Équipe RSE / ESG</div>
                    <div className="text-sm text-[#64748b]">Reporting, stratégie et conformité</div>
                  </div>
                  <div className="space-y-4">
                    <div className="mx-auto w-16 h-16 bg-[#16a34a]/10 rounded-2xl flex items-center justify-center text-3xl">👥</div>
                    <div className="font-semibold">Experts externes</div>
                    <div className="text-sm text-[#64748b]">Consultants et auditeurs</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Phrase courte - Slide ready */}
      <section className="py-20 bg-[#16a34a] text-white">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="text-3xl lg:text-4xl font-medium leading-tight">
            La plateforme permet aux entreprises industrielles de <span className="text-white/90">collecter automatiquement</span> leurs données environnementales, <span className="text-white/90">analyser leur empreinte carbone</span> et <span className="text-white/90">générer des rapports conformes</span> aux exigences ESG et internationales.
          </p>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-24 bg-white border-t border-[#e2e8f0]">
        <div className="max-w-3xl mx-auto text-center px-6">
          <h2 className="text-5xl font-bold mb-6">Prêt à transformer votre industrie ?</h2>
          <p className="text-xl text-[#475569] mb-10">
            Rejoignez les leaders industriels qui réduisent déjà leur empreinte carbone avec Verdustry.
          </p>
          <button className="px-12 py-5 bg-[#16a34a] hover:bg-[#15803d] text-white text-xl font-semibold rounded-2xl transition-all shadow-lg">
            Commencer maintenant — Essai gratuit 30 jours
          </button>
          <p className="text-sm text-[#64748b] mt-6">Aucune carte bancaire requise</p>
        </div>
      </section>
      <Footer />
    </div>
  );
}