import MarketingNavbar from "@/components/marketing/MarketingNavbar";
import Footer from "./Footer";
import { useState, useRef, useEffect, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";

/* ─── PALETTE ─────────────────────────────────────────────────────────── */
const V = {
  primary: "#16a34a",           // green-600
  primaryLight: "#4ade80",
  primaryDark: "#15803d",
  accent: "#86efac",
  
  bg: "#ffffff",
  surface: "#f8fafc",           // très léger gris-bleu clair
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

function useReveal() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return [ref, visible] as const;
}

function Reveal({
  children,
  className = "",
  style,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  delay?: number;
}) {
  const [ref, visible] = useReveal();
  return (
    <div
      ref={ref}
      style={{ ...style, transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      } ${className}`}
    >
      {children}
    </div>
  );
}

const SOCIALS = [
  { name: "LinkedIn", href: "https://linkedin.com", label: "in" },
  { name: "X / Twitter", href: "https://x.com", label: "𝕏" },
  { name: "Facebook", href: "https://facebook.com", label: "f" },
  { name: "Instagram", href: "https://instagram.com", label: "ig" },
];

const CONTACT_INFO = [
  {
    label: "Téléphone",
    lines: ["25 951 400", "44 725 281"],
    href1: "tel:+21625951400",
    href2: "tel:+21644725281",
    type: "phone",
  },
  {
    label: "E-mail",
    lines: ["contact@amirabdeddaiem.me"],
    href1: "mailto:contact@amirabdeddaiem.me",
    type: "email",
  },
  {
    label: "Localisation",
    lines: ["Tunisie"],
    type: "location",
  },
];

export default function ContactPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nom: "",
    email: "",
    entreprise: "",
    sujet: "",
    message: "",
  });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSent(true);
    }, 1300);
  };

  const inputBase: React.CSSProperties = {
    width: "100%",
    background: "#ffffff",
    border: `2px solid ${V.border}`,
    borderRadius: "1rem",
    padding: "1rem 1.25rem",
    color: V.text,
    fontSize: "0.975rem",
    outline: "none",
    transition: "all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)",
  };

  const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = V.borderHover;
    e.currentTarget.style.boxShadow = V.glow;
    e.currentTarget.style.transform = "translateY(-2px)";
  };

  const onBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = V.border;
    e.currentTarget.style.boxShadow = "none";
    e.currentTarget.style.transform = "translateY(0)";
  };

  const labelCls = "block text-xs font-semibold uppercase tracking-widest mb-2 text-green-600";

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      <MarketingNavbar variant="light" />

      {/* HERO - Lumineux */}
      <section className="relative pt-40 pb-24 overflow-hidden">
        {/* Soft green light background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(22,163,74,0.08)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(74,222,128,0.06)_0%,transparent_60%)]" />

        <div className="relative mx-auto max-w-6xl px-6 lg:px-8">
          <Reveal>
            <div className="flex items-center gap-4 mb-6">
              <div className="h-px w-12 bg-green-600" />
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-green-600">
                Contactez-nous
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-none">
              Parlons de votre{" "}
              <span className="text-green-600">projet ESG</span>
            </h1>

            <p className="mt-6 max-w-2xl text-xl text-slate-600 leading-relaxed">
              Notre équipe est prête à vous accompagner dans votre transition écologique et durable.
            </p>
          </Reveal>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <section className="pb-32">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="grid lg:grid-cols-[1fr_440px] gap-12 lg:gap-16 items-start">

            {/* FORM */}
            <Reveal>
              <div
                className="rounded-3xl p-10 lg:p-14"
                style={{
                  background: V.card,
                  border: `1px solid ${V.border}`,
                  boxShadow: V.shadowLg,
                }}
              >
                {sent ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div
                      className="h-24 w-24 rounded-3xl flex items-center justify-center text-6xl mb-8 shadow-xl"
                      style={{ background: "rgba(22,163,74,0.1)", color: V.primary }}
                    >
                      🌱
                    </div>
                    <h3 className="text-3xl font-bold text-slate-900">Message envoyé avec succès !</h3>
                    <p className="mt-4 text-slate-600 max-w-sm">
                      Merci pour votre message. Nous vous répondrons très rapidement.
                    </p>
                    <button
                      onClick={() => setSent(false)}
                      className="mt-10 text-green-600 font-semibold hover:text-green-700 transition-colors"
                    >
                      Envoyer un autre message →
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="mb-10">
                      <h2 className="text-3xl font-bold tracking-tight">Envoyez-nous un message</h2>
                      <p className="mt-3 text-slate-600">Nous vous répondons sous 24 heures.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <label className={labelCls}>Nom complet *</label>
                          <input
                            required
                            type="text"
                            name="nom"
                            placeholder="Amira Beddaiem"
                            value={form.nom}
                            onChange={handleChange}
                            onFocus={onFocus}
                            onBlur={onBlur}
                            style={inputBase}
                          />
                        </div>
                        <div>
                          <label className={labelCls}>E-mail *</label>
                          <input
                            required
                            type="email"
                            name="email"
                            placeholder="vous@entreprise.com"
                            value={form.email}
                            onChange={handleChange}
                            onFocus={onFocus}
                            onBlur={onBlur}
                            style={inputBase}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <label className={labelCls}>Entreprise</label>
                          <input
                            type="text"
                            name="entreprise"
                            placeholder="Verdustry SA"
                            value={form.entreprise}
                            onChange={handleChange}
                            onFocus={onFocus}
                            onBlur={onBlur}
                            style={inputBase}
                          />
                        </div>
                        <div>
                          <label className={labelCls}>Sujet *</label>
                          <select
                            required
                            name="sujet"
                            value={form.sujet}
                            onChange={handleChange}
                            onFocus={onFocus}
                            onBlur={onBlur}
                            style={{ ...inputBase, appearance: "none" }}
                            className="cursor-pointer"
                          >
                            <option value="" disabled>Choisir un sujet</option>
                            <option value="demo">Demande de démo</option>
                            <option value="pack">Renseignements sur un pack</option>
                            <option value="devis">Demande de devis</option>
                            <option value="support">Support technique</option>
                            <option value="autre">Autre</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className={labelCls}>Message *</label>
                        <textarea
                          required
                          name="message"
                          rows={7}
                          placeholder="Décrivez votre projet ESG, vos besoins ou votre question..."
                          value={form.message}
                          onChange={handleChange}
                          onFocus={onFocus}
                          onBlur={onBlur}
                          style={{ ...inputBase, minHeight: "170px", resize: "vertical" }}
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={sending}
                        className="w-full py-4 rounded-2xl font-bold text-base tracking-wider text-white transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-70"
                        style={{
                          background: V.primary,
                          boxShadow: "0 10px 25px -5px rgba(22, 163, 74, 0.35)",
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.boxShadow = "0 15px 35px -8px rgba(22, 163, 74, 0.45)";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.boxShadow = "0 10px 25px -5px rgba(22, 163, 74, 0.35)";
                        }}
                      >
                        {sending ? (
                          <span className="flex items-center justify-center gap-3">
                            <span className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Envoi en cours...
                          </span>
                        ) : (
                          "Envoyer le message →"
                        )}
                      </button>
                    </form>
                  </>
                )}
              </div>
            </Reveal>

            {/* RIGHT COLUMN */}
            <div className="flex flex-col gap-8">

              {/* Contact Info Cards */}
              {CONTACT_INFO.map((info, i) => (
                <Reveal key={info.label} delay={i * 70}>
                  <div
                    className="rounded-3xl p-9 transition-all hover:-translate-y-1"
                    style={{
                      background: V.card,
                      border: `1px solid ${V.border}`,
                      boxShadow: V.shadow,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = V.primary;
                      e.currentTarget.style.boxShadow = V.shadowLg;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = V.border;
                      e.currentTarget.style.boxShadow = V.shadow;
                    }}
                  >
                    <div className="text-xs font-bold uppercase tracking-widest text-green-600 mb-6">
                      {info.label}
                    </div>

                    {info.type === "phone" && (
                      <div className="space-y-3">
                        {info.lines.map((line, idx) => (
                          <a
                            key={idx}
                            href={idx === 0 ? info.href1 : info.href2}
                            className="block text-2xl font-semibold text-slate-900 hover:text-green-600 transition-colors"
                          >
                            {line}
                          </a>
                        ))}
                      </div>
                    )}

                    {info.type === "email" && (
                      <a
                        href={info.href1}
                        className="text-xl font-medium text-slate-700 hover:text-green-600 transition-colors break-all"
                      >
                        {info.lines[0]}
                      </a>
                    )}

                    {info.type === "location" && (
                      <div className="text-2xl font-semibold text-slate-900">{info.lines[0]}</div>
                    )}
                  </div>
                </Reveal>
              ))}

              {/* Social Media */}
              <Reveal delay={180}>
                <div
                  className="rounded-3xl p-9"
                  style={{
                    background: V.card,
                    border: `1px solid ${V.border}`,
                    boxShadow: V.shadow,
                  }}
                >
                  <div className="text-xs font-bold uppercase tracking-widest text-green-600 mb-6">
                    Réseaux sociaux
                  </div>
                  <div className="flex gap-4">
                    {SOCIALS.map((s) => (
                      <a
                        key={s.name}
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-14 w-14 rounded-2xl flex items-center justify-center text-2xl font-light transition-all hover:-translate-y-1 hover:shadow-md"
                        style={{
                          background: "#f8fafc",
                          border: `2px solid ${V.border}`,
                          color: V.primary,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = V.primary;
                          e.currentTarget.style.background = "#f0fdf4";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = V.border;
                          e.currentTarget.style.background = "#f8fafc";
                        }}
                      >
                        {s.label}
                      </a>
                    ))}
                  </div>
                </div>
              </Reveal>

              
            </div>
            {/* Book Demo CTA */}
              <Reveal delay={260}>
                <div
                  className="rounded-3xl p-10 relative overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${V.primary}, #15803d)`,
                    boxShadow: V.shadowLg,
                  }}
                >
                  <div className="absolute top-6 right-6 h-20 w-20 rounded-full bg-white/20 blur-xl" />

                  <div className="relative">
                    <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/20 text-white text-xs font-bold tracking-widest">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-white" />
                      </span>
                      DISPONIBLE
                    </div>

                    <h3 className="mt-8 text-3xl font-bold text-white leading-tight">
                      Réservez une démo<br />personnalisée
                    </h3>
                    <p className="mt-5 text-emerald-100 text-[15.5px] leading-relaxed">
                      30 minutes avec un expert pour découvrir comment nous pouvons accélérer votre transition ESG.
                    </p>

                    <button
                      onClick={() => navigate("/book-demo")}
                      className="mt-8 w-full py-4 rounded-2xl font-bold text-base bg-white text-green-700 hover:bg-emerald-50 transition-all hover:shadow-xl"
                    >
                      Réserver ma démo →
                    </button>
                  </div>
                </div>
              </Reveal>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        input::placeholder, textarea::placeholder {
          color: #94a3b8;
        }
        select {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%2316a34a' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M6 8l4 4 4-4'/%3E%3C/svg%3E");
          background-position: right 1.25rem center;
          background-repeat: no-repeat;
          background-size: 1.3em;
        }
      `}</style>

      <Footer />
    </div>
  );
}