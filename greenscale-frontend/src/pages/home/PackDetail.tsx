import { useMemo } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import MarketingNavbar from "@/components/marketing/MarketingNavbar";
import Footer from "./Footer";

const V = {
  bg: "#16a34a",
  card: "rgba(20,51,30,0.95)",
  bright: "#86efac",
  mid: "#4ade80",
  muted: "rgba(187,247,208,0.55)",
  borderIdle: "rgba(134,239,172,0.12)",
  borderHover: "rgba(134,239,172,0.35)",
  shadow: "0 24px 48px rgba(10,30,18,0.7)",
};

const PACKS = [
  {
    id: 1,
    tag: "STARTER",
    title: "300 TND / mois",
    tagline: "PME < 50 salariés",
    badge: "Essentiel",
    features: [
      "Scopes 1 & 2 automatisés",
      "Dashboard carbone",
      "Rapport carbone automatisé",
      "Support basic",
    ],
  },
  {
    id: 2,
    tag: "PRO",
    title: "600 TND / mois",
    tagline: "ETI 50–200 salariés",
    badge: "Le plus populaire",
    features: [
      "Scope 3 inclus",
      "Intégration ERP + Capteurs IoT + API",
      "Rapports ESG conformes CBAM / CSRD",
      "Support Premium",
    ],
  },
  {
    id: 3,
    tag: "ENTERPRISE",
    title: "1200 TND / mois",
    tagline: "Grande industrie",
    badge: "Solution complète",
    features: [
      "Multi-sites",
      "Intégration ERP + Capteurs + API",
      "Chatbot et Recommendation IA",
      "Rapports ESG conformes CBAM / CSRD",
      "Support Premium + formation",
    ],
  },
] as const;

export function PackDetailPage() {
  const navigate = useNavigate();
  const { packId } = useParams();

  const pack = useMemo(() => {
    const id = Number(packId);
    if (!Number.isFinite(id)) return null;
    return PACKS.find((p) => p.id === id) || null;
  }, [packId]);

  if (!pack) {
    return <Navigate to="/solutions" replace />;
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground font-sans">
      <MarketingNavbar variant="light" />

      {/* HERO */}
      <section className="relative overflow-hidden pt-36 pb-20">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(34,197,94,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.04)_1px,transparent_1px)] bg-[size:72px_72px]" />
        <div
          className="absolute top-16 left-0 h-[520px] w-[520px] rounded-full opacity-[0.07]"
          style={{
            background: "radial-gradient(circle, #16a34a 0%, transparent 65%)",
          }}
        />
        <div
          className="absolute bottom-0 right-0 h-[380px] w-[380px] rounded-full opacity-[0.05]"
          style={{
            background: "radial-gradient(circle, #4ade80 0%, transparent 65%)",
          }}
        />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-start gap-12 lg:grid-cols-2">
            <div>
              <div
                className="text-[30px] font-black uppercase tracking-[0.2em]"
                style={{ color: V.mid }}
              >
                {pack.tag}
              </div>

              <button
                type="button"
                onClick={() => navigate("/solutions")}
                className="mt-4 inline-flex items-center gap-2 text-3xl font-semibold text-green-700 hover:text-green-800"
              >
                ← Découvrir les autres packs
              </button>

              <h1 className="mt-4 text-5xl font-black tracking-tight leading-[1.06] sm:text-6xl">
                <span className="text-foreground">{pack.title}</span>
              </h1>

              <p className="mt-6 text-base leading-7 text-muted-foreground max-w-xl sm:text-lg">
                {pack.tagline}
              </p>

              <div className="mt-10 flex flex-col sm:flex-row gap-3">
                <Button
                  className="font-semibold bg-green-600 text-white hover:bg-green-700"
                  onClick={() => navigate("/book-demo")}
                >
                  Demander une demo
                </Button>
                <Button
                  variant="outline"
                  className="border-green-200 text-green-700 hover:bg-green-50"
                  onClick={() => navigate("/contact")}
                >
                  Parler à un expert
                </Button>
              </div>

              <div className="mt-10 flex flex-wrap gap-2">
                {["CSRD Conforme", "ISO 14064", "CBAM Ready", "RGPD"].map((b) => (
                  <span
                    key={b}
                    className="rounded-full border border-border/50 bg-card/70 px-3.5 py-1 text-xs font-semibold text-muted-foreground"
                  >
                    ✓ {b}
                  </span>
                ))}
              </div>
            </div>

            {/* Pack Card */}
            <div>
              <div
                className="relative group flex flex-col overflow-hidden rounded-[1.75rem] transition-all duration-300 h-full"
                style={{
                  background: V.card,
                  border: `1px solid ${V.borderHover}`,
                  boxShadow: V.shadow,
                }}
              >
                <div
                  className="absolute inset-x-0 top-0 h-px opacity-100 pointer-events-none"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${V.bright}, transparent)`,
                  }}
                />

                <div
                  className="relative px-8 pt-8 pb-7 overflow-hidden"
                  style={{ borderBottom: `1px solid ${V.borderIdle}` }}
                >
                  <div
                    className="absolute right-6 bottom-2 text-[7rem] font-black leading-none select-none pointer-events-none"
                    style={{ color: "rgba(134,239,172,0.04)" }}
                  >
                    {pack.id}
                  </div>

                  <div className="flex items-start justify-between mb-6">
                    <div
                      className="text-[10px] font-black uppercase tracking-[0.2em]"
                      style={{ color: V.mid }}
                    >
                      {pack.tag}
                    </div>
                    {pack.badge && (
                      <span
                        className="rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest"
                        style={{
                          background: "rgba(134,239,172,0.10)",
                          color: V.bright,
                          border: `1px solid ${V.borderHover}`,
                        }}
                      >
                        {pack.badge}
                      </span>
                    )}
                  </div>

                  <h2 className="text-xl font-black tracking-tight text-white leading-snug">
                    Inclus dans ce pack
                  </h2>
                  <p className="mt-2 text-sm leading-6" style={{ color: V.muted }}>
                    Les fonctionnalités clés et livrables.
                  </p>
                </div>

                <div className="flex-1 px-8 py-6 space-y-0">
                  {pack.features.map((f, i) => (
                    <div
                      key={i}
                      className={`flex items-start gap-4 py-3.5 ${
                        i !== pack.features.length - 1 ? "border-b" : ""
                      }`}
                      style={{ borderColor: V.borderIdle }}
                    >
                      <span
                        className="mt-0.5 shrink-0 h-5 w-5 flex items-center justify-center rounded-full text-[10px] font-black"
                        style={{ background: "rgba(74,222,128,0.1)", color: V.mid }}
                      >
                        ✓
                      </span>
                      <span className="text-sm font-medium leading-5 text-white/80">
                        {f}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="px-8 pb-8">
                  <button
                    type="button"
                    className="flex w-full items-center justify-center rounded-xl py-3.5 text-sm font-black transition-all duration-200 hover:-translate-y-0.5"
                    style={{
                      background: V.bg,
                      color: "#fff",
                      boxShadow: `0 4px 16px rgba(22,163,74,0.25)`,
                    }}
                    onClick={() => navigate("/register")}
                  >
                    Démarrer ce pack →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default PackDetailPage;
