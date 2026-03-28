import MarketingNavbar from '@/components/marketing/MarketingNavbar';
import Footer from '../Footer';
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
export default function FinanceSectorPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-white">
      <MarketingNavbar variant="light" />
      {/* Hero Section */}
      <section className="pt-28 pb-20 bg-gradient-to-br from-white via-white to-slate-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700">
                Secteur Finance
              </div>

              <h1 className="text-4xl lg:text-5xl font-semibold tracking-tight leading-tight text-slate-900">
                Intégrez le <span className="text-green-700">climat</span> et l’ESG
                <br />
                dans vos investissements
              </h1>

              <p className="text-lg lg:text-xl text-slate-600 max-w-xl leading-relaxed">
                Mesurez l’empreinte carbone de vos portefeuilles, gérez les risques climatiques et prenez des décisions d’investissement responsables.
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
                <li>Conformité CSRD & SFDR</li>
                <li>Analyse Portfolio Carbon Footprint</li>
              </ul>
            </div>

            {/* Hero Visual */}
            <div className="relative">
              <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
                <div className="p-10">
                  <div className="flex items-end justify-between gap-6 mb-8">
                    <div>
                      <div className="text-sm text-slate-500">Empreinte carbone du portefeuille</div>
                      <div className="mt-2 text-5xl font-semibold tracking-tight text-green-700">248 ktCO₂e</div>
                    </div>
                    <div className="text-sm font-medium text-emerald-700">-14% cette année</div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Énergie</span>
                        <span className="font-medium text-slate-900">42%</span>
                      </div>
                      <div className="mt-2 h-2.5 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full w-[42%] bg-green-700" />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Industrie lourde</span>
                        <span className="font-medium text-slate-900">31%</span>
                      </div>
                      <div className="mt-2 h-2.5 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full w-[31%] bg-green-500" />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Transport</span>
                        <span className="font-medium text-slate-900">18%</span>
                      </div>
                      <div className="mt-2 h-2.5 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full w-[18%] bg-green-300" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-20 bg-green-50">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-4xl lg:text-5xl font-semibold tracking-tight text-slate-900 mb-6">
            La solution ESG & Climat pour les institutions financières
          </h2>
          <p className="text-lg lg:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Intégrez les critères climatiques et ESG dans vos décisions d’investissement et gérez efficacement les risques carbone de vos portefeuilles.
          </p>
        </div>
      </section>

      {/* Advanced Climate Management */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="text-green-700 font-semibold tracking-widest text-xs mb-3">GESTION DU RISQUE</div>
            <h2 className="text-4xl lg:text-5xl font-semibold tracking-tight text-slate-900">Gestion avancée du risque climatique</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: "Mesure de l’empreinte carbone", desc: "Calcul précis du carbone Scope 1, 2 et 3 de l’ensemble de vos portefeuilles" },
              { title: "Analyse des risques climatiques", desc: "Évaluation des risques physiques et de transition selon les scénarios NGFS" },
              { title: "Identification des entreprises à risque", desc: "Détection des sociétés à forte intensité carbone et à haut risque ESG" },
              { title: "Pilotage des stratégies durables", desc: "Suivi en temps réel de l’alignement de vos investissements avec vos objectifs climatiques" }
            ].map((item, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-3xl p-10 hover:border-green-200 transition-colors">
                <h3 className="font-semibold text-xl mb-3 text-slate-900">{item.title}</h3>
                <p className="text-slate-600 leading-relaxed">{item.desc}</p>
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
              <div className="text-green-700 font-semibold tracking-widest text-xs mb-3">COLLECTE</div>
              <h2 className="text-4xl lg:text-5xl font-semibold tracking-tight leading-tight text-slate-900">
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
                  <div key={index} className="bg-white p-8 rounded-3xl border border-slate-200">
                    <p className="text-slate-700 leading-relaxed">{item}</p>
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
            <div className="text-green-700 font-semibold tracking-widest text-xs mb-3">AVANTAGES</div>
            <h2 className="text-4xl lg:text-5xl font-semibold tracking-tight text-slate-900">Pourquoi les institutions financières choisissent Verdustry</h2>
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
              <div key={i} className="bg-white p-8 rounded-3xl border border-slate-200 hover:border-green-200 transition-colors">
                <p className="text-slate-900 text-lg leading-relaxed">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ecosystem */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="text-green-700 font-semibold tracking-widest text-xs mb-3">ÉCOSYSTÈME</div>
            <h2 className="text-4xl lg:text-5xl font-semibold tracking-tight text-slate-900">Un écosystème de confiance</h2>
          </div>

          <div className="flex flex-wrap justify-center gap-12 text-center">
            {["Banques & Institutions financières", "Cabinets de conseil ESG", "Fournisseurs de données climatiques", "Entreprises industrielles", "Organismes de certification"].map((partner, i) => (
              <div key={i} className="px-10 py-6 bg-white border border-slate-200 rounded-2xl text-slate-700 hover:border-green-200 transition-colors">
                {partner}
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