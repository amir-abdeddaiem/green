import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MarketingNavbar } from "@/components/marketing/MarketingNavbar";

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
  return (
    <div className="min-h-screen bg-background text-foreground">
      <MarketingNavbar variant="dark" />

     {/* HERO */}
<section className="relative overflow-hidden border-b bg-gradient-to-b from-white to-emerald-50/40">
  <div className="absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-emerald-300/20 blur-3xl" />

  <div className="mx-auto max-w-6xl px-4 pt-28 pb-20 sm:px-6 lg:px-8">
    <div className="mx-auto max-w-3xl text-center">

      

      <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl">
        CBAM Compliance
        <span className="block text-emerald-600">
          Made Simple
        </span>
      </h1>

      <p className="mt-5 text-base text-muted-foreground sm:text-lg">
        The Carbon Border Adjustment Mechanism (CBAM) requires companies
        importing goods into the EU to report their embedded carbon emissions.
        Our platform helps you calculate, monitor, and report emissions
        automatically — ensuring full compliance.
      </p>

      <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
        <Button className="bg-green-600 text-white hover:bg-green-700">
          Start CBAM Assessment
        </Button>

        <Button variant="outline">
          Learn More
        </Button>
      </div>

      <div className="mt-10 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          🌍 EU Compliance
        </div>

        <div className="flex items-center gap-2">
          📊 Automated Reporting
        </div>

        <div className="flex items-center gap-2">
          ⚡ AI Carbon Calculations
        </div>
      </div>

    </div>
  </div>
</section>

      {/* WARNING BANNER */}
<section className="bg-gradient-to-r from-amber-50 to-orange-50 border-y border-amber-200/70">
  <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
    <div className="flex flex-col gap-6 rounded-2xl border border-amber-200 bg-white/70 p-6 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
      
      {/* LEFT CONTENT */}
      <div className="flex gap-4">
        <div className="text-3xl leading-none">🇪🇺</div>

        <div className="text-left">
          <h2 className="text-lg font-bold text-amber-900">
            ⚠️ CBAM is Now in Effect
          </h2>

          <p className="mt-1 text-sm text-amber-900/80">
            The EU Carbon Border Adjustment Mechanism (CBAM) is now in effect.
          </p>

          <p className="mt-2 text-sm text-amber-900/80">
            Companies importing goods into the EU{" "}
            <span className="font-semibold">
              must report embedded carbon emissions.
            </span>
          </p>

          <p className="mt-1 text-sm text-amber-900/80">
            Non-compliance can result in{" "}
            <span className="font-semibold">
              significant penalties and trade restrictions.
            </span>
          </p>

          <p className="mt-3 text-sm font-semibold text-amber-800">
            Is your business prepared for CBAM requirements?
          </p>
        </div>
      </div>

      {/* RIGHT IMAGE */}
      <div className="flex-shrink-0">
        <img
          src="/CBAM_Beratung_Logo.svg"
          alt="CBAM regulation illustration"
          className="w-40 md:w-48 lg:w-56 object-contain"
        />
      </div>

    </div>
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
                    <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                      {s.price}
                    </span>
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

      {/* TIMELINE */}
      <section className="py-16 bg-muted/30">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            
            <h2 className="mt-6 text-3xl font-extrabold tracking-tight sm:text-4xl">CBAM Implementation Timeline</h2>
            <p className="mt-3 text-base text-muted-foreground">Key milestones in the CBAM rollout process</p>
          </div>

          <div className="mt-10 grid gap-4">
            {TIMELINE.map((t, i) => (
              <div
                key={t.year}
                className="flex flex-col gap-3 rounded-2xl border bg-card p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-sm font-extrabold">
                    {i + 1}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-muted-foreground">{t.year}</div>
                    <div className="text-lg font-bold">{t.label}</div>
                  </div>
                </div>

                {t.next && (
                  <div className="text-sm font-semibold text-emerald-700">→ {t.next}</div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-10 flex justify-center">
            <Button asChild className="bg-green-600 text-white hover:bg-green-700">
              <a href="#">Prepare for CBAM →</a>
            </Button>
          </div>
        </div>
      </section>

      
      {/* PROCESS */}
      <section className="py-16 bg-muted/30">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            
            <h2 className="mt-6 text-3xl font-extrabold tracking-tight sm:text-4xl">CBAM Compliance Process</h2>
            <p className="mt-3 text-base text-muted-foreground">Five steps to ensure full CBAM compliance</p>
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
                      <h3 className="text-base font-bold">{s.title}</h3>
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
      <section className="py-16">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            
            <h2 className="mt-6 text-3xl font-extrabold tracking-tight sm:text-4xl">Competitive Advantage</h2>
            <p className="mt-3 text-base text-muted-foreground">Turn CBAM compliance into a business opportunity</p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {ADVANTAGES.map((a) => (
              <Card key={a.title} className="shadow-sm">
                <CardContent className="p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 text-xl">
                    {a.icon}
                  </div>
                  <h3 className="mt-3 text-base font-bold">{a.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{a.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-zinc-900 via-black to-black" />
        <div className="absolute -inset-24 -z-10 bg-gradient-to-br from-emerald-400/20 via-teal-400/15 to-transparent blur-3xl rounded-[6rem]" />

        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center text-white">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Ready for CBAM Compliance?</h2>
            <p className="mt-4 text-base text-white/80">
              Don't let CBAM requirements catch you unprepared. Start your compliance journey today with our expert guidance and AI-powered solutions.
            </p>
            <div className="mt-8 flex justify-center">
              <Button asChild className="bg-green-600 text-white hover:bg-green-700">
                <a href="#">Get CBAM Ready Now →</a>
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
              <div className="text-sm font-bold">Company</div>
              <div className="mt-3 grid gap-2 text-sm">
                <a href="#" className="text-white/70 hover:text-white">Use Cases</a>
                <a href="#" className="text-white/70 hover:text-white">About Us</a>
                <a href="#" className="text-white/70 hover:text-white">Contact</a>
              </div>
            </div>

            <div>
              <div className="text-sm font-bold">Product</div>
              <div className="mt-3 grid gap-2 text-sm">
                <a href="#" className="text-white/70 hover:text-white">Carbon Footprint</a>
                <a href="#" className="text-white/70 hover:text-white">Product Footprint</a>
                <a href="#" className="text-white/70 hover:text-white">CBAM</a>
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