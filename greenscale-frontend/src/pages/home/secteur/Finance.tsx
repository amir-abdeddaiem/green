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

export default function FinanceSectorPage() {
  return (
    <div className="min-h-screen bg-white font-sans">
        <MarketingNavbar variant="light" />
      {/* Hero Section */}
      <section className="pt-24 pb-20 bg-gradient-to-br from-white via-white to-[#f8fafc] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#16a34a]/20 bg-white text-[#16a34a] text-sm font-medium">
                <span className="w-2 h-2 bg-[#16a34a] rounded-full animate-pulse"></span>
                Secteur Finance
              </div>

              <h1 className="text-6xl lg:text-7xl font-bold leading-tight text-[#0f172a]">
                Intégrez le <span className="text-[#16a34a]">climat</span> et l’ESG<br />
                dans vos investissements
              </h1>

              <p className="text-2xl text-[#475569] max-w-lg">
                Mesurez l’empreinte carbone de vos portefeuilles, gérez les risques climatiques et prenez des décisions d’investissement responsables.
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
                <div>✓ Conformité CSRD & SFDR</div>
                <div>✓ Analyse Portfolio Carbon Footprint</div>
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
                  <div className="mx-auto text-xs text-[#64748b]">verdustry.com/finance/portfolio</div>
                </div>
                <div className="p-10">
                  <div className="flex justify-between items-end mb-8">
                    <div>
                      <div className="text-sm text-[#64748b]">Empreinte carbone du portefeuille</div>
                      <div className="text-5xl font-bold text-[#16a34a]">248 ktCO₂e</div>
                    </div>
                    <div className="text-emerald-600 text-sm font-medium">↓ 14% cette année</div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#475569]">Énergie</span>
                      <span className="font-medium">42%</span>
                    </div>
                    <div className="h-2.5 bg-[#e2e8f0] rounded-full overflow-hidden">
                      <div className="h-full w-[42%] bg-[#16a34a]"></div>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-[#475569]">Industrie lourde</span>
                      <span className="font-medium">31%</span>
                    </div>
                    <div className="h-2.5 bg-[#e2e8f0] rounded-full overflow-hidden">
                      <div className="h-full w-[31%] bg-[#4ade80]"></div>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-[#475569]">Transport</span>
                      <span className="font-medium">18%</span>
                    </div>
                    <div className="h-2.5 bg-[#e2e8f0] rounded-full overflow-hidden">
                      <div className="h-full w-[18%] bg-[#86efac]"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating badge */}
              <div className="absolute -bottom-6 -left-6 bg-white px-6 py-4 rounded-2xl shadow-xl border border-[#16a34a]/10 flex items-center gap-3">
                <div className="text-3xl">🌍</div>
                <div>
                  <div className="font-semibold">Aligned with</div>
                  <div className="text-xs text-[#16a34a]">Paris Agreement • SFDR • CSRD</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-20 bg-[#f8fafc]">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-5xl font-bold text-[#0f172a] mb-6">
            La solution ESG & Climat pour les institutions financières
          </h2>
          <p className="text-xl text-[#475569] max-w-3xl mx-auto">
            Intégrez les critères climatiques et ESG dans vos décisions d’investissement et gérez efficacement les risques carbone de vos portefeuilles.
          </p>
        </div>
      </section>

      {/* Advanced Climate Management */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="text-[#16a34a] font-medium tracking-widest text-sm mb-3">ADVANCED CLIMATE MANAGEMENT</div>
            <h2 className="text-5xl font-bold text-[#0f172a]">Gestion avancée du risque climatique</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: "📏", title: "Mesure de l’empreinte carbone", desc: "Calcul précis du carbone Scope 1, 2 et 3 de l’ensemble de vos portefeuilles" },
              { icon: "⚠️", title: "Analyse des risques climatiques", desc: "Évaluation des risques physiques et de transition selon les scénarios NGFS" },
              { icon: "🔍", title: "Identification des entreprises à risque", desc: "Détection des sociétés à forte intensité carbone et à haut risque ESG" },
              { icon: "🎯", title: "Pilotage des stratégies durables", desc: "Suivi en temps réel de l’alignement de vos investissements avec vos objectifs climatiques" }
            ].map((item, i) => (
              <div key={i} className="bg-white border border-[#e2e8f0] rounded-3xl p-10 hover:border-[#16a34a]/40 transition-all group">
                <div className="text-5xl mb-6">{item.icon}</div>
                <h3 className="font-semibold text-2xl mb-4 text-[#0f172a]">{item.title}</h3>
                <p className="text-[#475569]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Collect ESG Data */}
      <section className="py-24 bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-5">
              <div className="text-[#16a34a] font-medium mb-3">COLLECTE DE DONNÉES</div>
              <h2 className="text-5xl font-bold leading-tight text-[#0f172a]">
                Collectez et centralisez les données ESG de vos investissements
              </h2>
            </div>

            <div className="lg:col-span-7">
              <div className="grid md:grid-cols-2 gap-8">
                {[
                  "Émissions carbone (Scope 1, 2, 3)",
                  "Données environnementales et énergétiques",
                  "Politiques et engagements ESG",
                  "Indicateurs de durabilité",
                  "Données de la chaîne d’approvisionnement",
                  "Rapports annuels et certifications"
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-4 bg-white p-8 rounded-3xl border border-[#e2e8f0]">
                    <span className="text-[#16a34a] text-2xl mt-1">•</span>
                    <p className="text-[#475569]">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      

      {/* Benefits */}
      <section className="py-24 bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="text-[#16a34a] font-medium text-sm tracking-widest mb-3">AVANTAGES</div>
            <h2 className="text-5xl font-bold text-[#0f172a]">Pourquoi les institutions financières choisissent Verdustry</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              "Améliorer la gestion des risques climatiques physiques et de transition",
              "Assurer la conformité aux réglementations SFDR, CSRD et Taxonomy",
              "Prendre des décisions d’investissement plus responsables et éclairées",
              "Renforcer la transparence envers vos investisseurs et régulateurs",
              "Soutenir la transition vers une économie bas carbone",
              "Différencier votre offre avec des produits d’investissement verts"
            ].map((benefit, i) => (
              <div key={i} className="bg-white p-8 rounded-3xl border border-[#e2e8f0] hover:border-[#16a34a]/30 transition-all">
                <div className="text-[#16a34a] mb-4 text-3xl">✓</div>
                <p className="text-[#0f172a] text-lg leading-relaxed">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ecosystem */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="text-[#16a34a] font-medium text-sm tracking-widest mb-3">ÉCOSYSTÈME</div>
            <h2 className="text-5xl font-bold text-[#0f172a]">Un écosystème de confiance</h2>
          </div>

          <div className="flex flex-wrap justify-center gap-12 text-center">
            {["Banques & Institutions financières", "Cabinets de conseil ESG", "Fournisseurs de données climatiques", "Entreprises industrielles", "Organismes de certification"].map((partner, i) => (
              <div key={i} className="px-10 py-6 bg-white border border-[#e2e8f0] rounded-2xl text-[#475569] hover:border-[#16a34a]/40 transition-all">
                {partner}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Slide Phrase */}
      <section className="py-20 bg-[#16a34a] text-white">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="text-3xl lg:text-4xl font-medium leading-tight">
            La plateforme permet aux institutions financières de <span className="text-white/90">mesurer l’impact carbone</span> de leurs investissements, 
            d’<span className="text-white/90">intégrer les critères ESG</span> dans leurs décisions et de <span className="text-white/90">piloter leurs portefeuilles</span> vers une économie durable.
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-white">
        <div className="max-w-3xl mx-auto text-center px-6">
          <h2 className="text-5xl font-bold mb-6">Prêt à aligner vos investissements avec le climat ?</h2>
          <p className="text-xl text-[#475569] mb-10">
            Rejoignez les institutions financières qui pilotent déjà la transition écologique avec Verdustry.
          </p>
          <button className="px-12 py-5 bg-[#16a34a] hover:bg-[#15803d] text-white text-xl font-semibold rounded-2xl transition-all shadow-lg">
            Demander une démonstration personnalisée
          </button>
        </div>
      </section>
      <Footer />
    </div>
  );
}