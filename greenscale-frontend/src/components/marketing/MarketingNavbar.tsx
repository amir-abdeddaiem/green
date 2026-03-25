import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Variant = "light" | "dark";

export const MARKETING_NAV_LINKS = [
  { label: "Produits", href: "#produits" },
  { label: "Solutions", href: "#solutions" },
  { label: "Ressources", href: "#ressources" },
  { label: "Tarifs", href: "#tarifs" },
  { label: "À propos", href: "#apropos" },
] as const;

export function MarketingNavbar({
  variant = "light",
  showLinks = true,
}: {
  variant?: Variant;
  showLinks?: boolean;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const dark = variant === "dark";

  return (
    <nav
      className={cn(
        "fixed left-0 right-0 top-0 z-50 transition-all",
        scrolled
          ? dark
            ? "border-b border-white/10 bg-neutral-950/80 backdrop-blur"
            : "border-b bg-background/90 backdrop-blur"
          : "bg-transparent",
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <button
          type="button"
          className="flex items-center gap-3"
          onClick={() => navigate("/")}
          aria-label="Verdustry"
        >
          <img src="/Verdustry.svg" alt="Verdustry Logo" className="h-9 w-auto object-contain" />
        </button>

        {showLinks && (
          <div className="hidden flex-1 items-center justify-center gap-8 lg:flex">
            {MARKETING_NAV_LINKS.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className={cn(
                  "text-sm font-medium transition-colors",
                  dark
                    ? "text-neutral-300 hover:text-lime-200"
                    : "text-muted-foreground hover:text-green-700",
                )}
              >
                {l.label}
              </a>
            ))}
          </div>
        )}

        <div className="ml-auto hidden items-center gap-2 lg:flex">
          <Button
            variant={dark ? "secondary" : "outline"}
            className={cn(dark && "bg-white/10 text-white hover:bg-white/15")}
            onClick={() => navigate("/login")}
          >
            Connexion
          </Button>
          <Button
            className={cn(
              dark
                ? "bg-lime-300 text-neutral-950 hover:bg-lime-200"
                : "bg-green-600 text-white hover:bg-green-700",
            )}
            onClick={() => navigate("/register")}
          >
            Démarrer →
          </Button>
          <Button
            variant={dark ? "outline" : "outline"}
            className={cn(
              dark
                ? "border-white/15 bg-transparent text-white hover:bg-white/5"
                : "",
            )}
            onClick={() => navigate("/book-demo")}
          >
            Démo
          </Button>
        </div>

        <button
          type="button"
          className={cn(
            "ml-auto inline-flex items-center justify-center rounded-md border px-3 py-2 text-sm font-semibold lg:hidden",
            dark ? "border-white/10 bg-neutral-950/60 text-white" : "bg-background/80",
          )}
          aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          onClick={() => setMenuOpen((v) => !v)}
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {menuOpen && (
        <div className={cn("border-t backdrop-blur lg:hidden", dark ? "border-white/10 bg-neutral-950/90" : "bg-background/95")}
        >
          <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-5 sm:px-6 lg:px-8">
            {showLinks &&
              MARKETING_NAV_LINKS.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  className={cn(
                    "text-base font-medium transition-colors",
                    dark
                      ? "text-neutral-200 hover:text-lime-200"
                      : "text-muted-foreground hover:text-green-700",
                  )}
                  onClick={() => setMenuOpen(false)}
                >
                  {l.label}
                </a>
              ))}

            <div className="flex items-center gap-2 pt-2">
              <Button
                variant={dark ? "secondary" : "outline"}
                className={cn("flex-1", dark && "bg-white/10 text-white hover:bg-white/15")}
                onClick={() => navigate("/login")}
              >
                Connexion
              </Button>
              <Button
                className={cn(
                  "flex-1",
                  dark
                    ? "bg-lime-300 text-neutral-950 hover:bg-lime-200"
                    : "bg-green-600 text-white hover:bg-green-700",
                )}
                onClick={() => navigate("/register")}
              >
                Démarrer →
              </Button>
            </div>

            <Button
              variant={dark ? "outline" : "outline"}
              className={cn(
                dark
                  ? "border-white/15 bg-transparent text-white hover:bg-white/5"
                  : "",
              )}
              onClick={() => navigate("/book-demo")}
            >
              Démo
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}
