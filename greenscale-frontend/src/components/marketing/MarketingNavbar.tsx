import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type NavbarVariant = "light" | "dark";

type MarketingNavbarProps = {
  variant?: NavbarVariant;
};

interface SubMenuItem {
  title: string;
  desc: string;
  href?: string;
  imageUrl?: string;
}

interface MenuItem {
  label: string;
  submenu: SubMenuItem[];
}

const menuItems: MenuItem[] = [
  {
    label: "About Us",
    submenu: [
      { title: "automatisation du bilan de carbone", desc: "Découvrir", href: "/" },
      { title: "nos valeurs", desc: "NOTRE SUITE COMPLÈTE", href: "/" },
      { title: "pourquoi choisir verdustry", desc: "Découvrir nos événements", href: "/" }
      
    ],
  },
  {
    label: "Produits",
    submenu: [
      { title: "automatisation du bilan de carbone", desc: "Découvrir", href: "/redroy" },
      { title: "Recomendation ai", desc: "Découvrir nos clubs", href: "/redroy/club" },
      { title: "integration des capteurs", desc: "Découvrir nos événements", href: "/redroy/evenements" }
      
    ],
  },
  { label: "Normes", submenu: [{ title: "CSRD", desc: "eporting ESG des entreprises.", href: "/csrd" }, { title: "CBAM", desc: "Mécanisme de taxe carbone aux frontières de l’UE.", href: "/cbam" }] },
  // { label: "Contacter", submenu: [{ title: "Contactez-Nous", desc: "Nous rejoindre", href: "/contact" }, { title: "Localisation", desc: "Ou nous se trouve", href: "/contact#contact" }] },
  // { label: "Demo", submenu: [{ title: "Nos Productions", desc: "Demander nos productions ", href: "/production" }, { title: "Devis", desc: "Demander un devis", href: "/production/#devis" }] },
  
];

// Crépuscule Prod Logo Component
const Logo = ({ variant }: { variant: NavbarVariant }) => (
  <div className="flex items-center space-x-3">
    <div className="relative">
      <span
        className={cn(
          "text-xl md:text-2xl font-bold tracking-wider relative",
          variant === "light" ? "text-foreground" : "text-white"
        )}
      >
        Ver
        <span className="text-green-400"> Dustry</span>
        <span className="absolute -inset-1 blur-lg opacity-50 text-green-400">Verdustry</span>
      </span>
    </div>
  </div>
);

// // Social Media Icons
// const SocialMediaIcons = ({ variant }: { variant: NavbarVariant }) => (
//   <div className="flex items-center space-x-5">
//     <a
//       href="https://www.blogger.com"
//       aria-label="Blogger"
//       className={cn(
//         "transition-colors duration-300",
//         variant === "light" ? "text-foreground hover:text-green-700" : "text-white hover:text-green-300"
//       )}
//     >
//       <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">

//         <path d="M12 0C5.375 0 0 5.375 0 12c0 6.625 5.375 12 12 12s12-5.375 12-12C24 5.375 18.625 0 12 0zm-1.875 18.375V5.625h5.625c3.515 0 6.375 2.86 6.375 6.375s-2.86 6.375-6.375 6.375h-5.625z" />
//       </svg>
//     </a>




//     <a
//       href="https://www.facebook.com/verdustry"
//       aria-label="Facebook"
//       className={cn(
//         "transition-colors duration-300",
//         variant === "light" ? "text-foreground hover:text-green-700" : "text-white hover:text-green-300"
//       )}
//     >
//       <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
//         <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
//       </svg>
//     </a>


//     <a
//       href="https://www.instagram.com/verdustry/"
//       aria-label="Instagram"
//       className={cn(
//         "transition-colors duration-300",
//         variant === "light" ? "text-foreground hover:text-green-700" : "text-white hover:text-green-300"
//       )}
//     >
//       <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
//         <path d="M12 2.16c3.21 0 3.58.01 4.84.07 1.17.06 1.81.25 2.23.42.56.22.97.48 1.39.9.42.42.68.83.9 1.39.17.42.36 1.06.42 2.23.06 1.26.07 1.63.07 4.84s-.01 3.58-.07 4.84c-.06 1.17-.25 1.81-.42 2.23-.22.56-.48.97-.9 1.39-.42.42-.83.68-1.39.9-.42.17-1.06.36-2.23.42-1.26.06-1.63.07-4.84.07s-3.58-.01-4.84-.07c-1.17-.06-1.81-.25-2.23-.42-.56-.22-.97-.48-1.39-.9-.42-.42-.68-.83-.9-1.39-.17-.42-.36-1.06-.42-2.23-.06-1.26-.07-1.63-.07-4.84s.01-3.58.07-4.84c.06-1.17.25-1.81.42-2.23.22-.56.48-.97.9-1.39.42-.42.83-.68 1.39-.9.42-.17 1.06-.36 2.23-.42 1.26-.06 1.63-.07 4.84-.07zm0-2.16C8.76 0 8.37.01 7.1.07 5.83.14 4.76.34 3.92.63c-.86.3-1.59.71-2.32 1.44S.59 3.4.29 4.26c-.29.84-.49 1.91-.56 3.18C.01 8.71 0 9.1 0 12.16s.01 3.45.07 4.72c.07 1.27.27 2.34.56 3.18.3.86.71 1.59 1.44 2.32s1.46 1.14 2.32 1.44c.84.29 1.91.49 3.18.56 1.27.06 1.66.07 4.72.07s3.45-.01 4.72-.07c1.27-.07 2.34-.27 3.18-.56.86-.3 1.59-.71 2.32-1.44s1.14-1.46 1.44-2.32c.29-.84.49-1.91.56-3.18.06-1.27.07-1.66.07-4.72s-.01-3.45-.07-4.72c-.07-1.27-.27-2.34-.56-3.18-.3-.86-.71-1.59-1.44-2.32s-1.46-1.14-2.32-1.44c-.84-.29-1.91-.49-3.18-.56C15.61.01 15.22 0 12.16 0zm0 5.83c-3.44 0-6.24 2.8-6.24 6.24s2.8 6.24 6.24 6.24 6.24-2.8 6.24-6.24-2.8-6.24-6.24-6.24zm0 10.3c-2.24 0-4.06-1.82-4.06-4.06s1.82-4.06 4.06-4.06 4.06 1.82 4.06 4.06-1.82 4.06-4.06 4.06zm6.54-10.76c-.8 0-1.45.65-1.45 1.45s.65 1.45 1.45 1.45 1.45-.65 1.45-1.45-.65-1.45-1.45-1.45z" />
//       </svg>
//     </a>
//     <a
//       href="https://www.linkedin.com/company/verdustry"
//       aria-label="LinkedIn"
//       className={cn(
//         "transition-colors duration-300",
//         variant === "light" ? "text-foreground hover:text-green-700" : "text-white hover:text-green-300"
//       )}
//     >
//       <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
// <path d="M16.656 1.029c1.637-0.025 3.262-0.012 4.886-0.025 0.054 2.031 0.878 3.859 2.189 5.213l-0.002-0.002c1.411 1.271 3.247 2.095 5.271 2.235l0.028 0.002v5.036c-1.912-0.048-3.71-0.489-5.331-1.247l0.082 0.034c-0.784-0.377-1.447-0.764-2.077-1.196l0.052 0.034c-0.012 3.649 0.012 7.298-0.025 10.934-0.103 1.853-0.719 3.543-1.707 4.954l0.020-0.031c-1.652 2.366-4.328 3.919-7.371 4.011l-0.014 0c-0.123 0.006-0.268 0.009-0.414 0.009-1.73 0-3.347-0.482-4.725-1.319l0.040 0.023c-2.508-1.509-4.238-4.091-4.558-7.094l-0.004-0.041c-0.025-0.625-0.037-1.25-0.012-1.862 0.49-4.779 4.494-8.476 9.361-8.476 0.547 0 1.083 0.047 1.604 0.136l-0.056-0.008c0.025 1.849-0.050 3.699-0.050 5.548-0.423-0.153-0.911-0.242-1.42-0.242-1.868 0-3.457 1.194-4.045 2.861l-0.009 0.030c-0.133 0.427-0.21 0.918-0.21 1.426 0 0.206 0.013 0.41 0.037 0.61l-0.002-0.024c0.332 2.046 2.086 3.59 4.201 3.59 0.061 0 0.121-0.001 0.181-0.004l-0.009 0c1.463-0.044 2.733-0.831 3.451-1.994l0.010-0.018c0.267-0.372 0.45-0.822 0.511-1.311l0.001-0.014c0.125-2.237 0.075-4.461 0.087-6.698 0.012-5.036-0.012-10.060 0.025-15.083z"></path>
//       </svg>
//     </a>
//   </div>
// );

export function MarketingNavbar({ variant = "dark" }: MarketingNavbarProps) {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeImage, setActiveImage] = useState<string>("");
  const [mobileExpanded, setMobileExpanded] = useState<number | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Scroll effect
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrolled(window.scrollY > 30);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setHovered(null);
        setIsSearchOpen(false);
        setSearchQuery("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update background image
  useEffect(() => {
    if (hovered !== null) {
      const itemWithImage = menuItems[hovered].submenu.find((i) => i.imageUrl);
      setActiveImage(itemWithImage?.imageUrl || "");
    } else {
      setActiveImage("");
    }
  }, [hovered]);

  // Close mobile on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileOpen(false);
        setHovered(null);
        setMobileExpanded(null);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = isMobileOpen ? "hidden" : "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isMobileOpen]);

  // Focus search
  useEffect(() => {
    isSearchOpen && searchInputRef.current?.focus();
  }, [isSearchOpen]);

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    if (isSearchOpen) setSearchQuery("");
    setHovered(null);
  };

  // Simple search
  const searchResults = searchQuery.trim()
    ? menuItems.flatMap((item) =>
      item.submenu
        .filter(
          (sub) =>
            sub.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            sub.desc.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .map((sub) => ({
          title: sub.title,
          desc: sub.desc,
          href: sub.href || "#",
        }))
    )
    : [];

  return (
    <>
      <nav
        ref={navRef}
        className={cn(
          "fixed top-0 left-0 w-full z-40 transition-all duration-500 overflow-visible",
          variant === "light"
            ? scrolled
              ? "bg-background/90 text-foreground backdrop-blur-xl border-b shadow-sm py-3 md:py-4"
              : "bg-background/70 text-foreground backdrop-blur-md py-4 md:py-6"
            : scrolled
              ? "bg-green-700/95 text-white backdrop-blur-xl shadow-2xl py-3 md:py-4"
              : "bg-green-700 text-white py-4 md:py-6 hover:bg-green-800",
          isMobileOpen && (variant === "light" ? "bg-background" : "bg-green-700")
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex justify-between items-center">
          {/* Logo */}
          <a href="/" className="z-50 relative">
            <Logo variant={variant} />
          </a>

          {/* Desktop Menu - Hidden on mobile */}
          <ul className="hidden lg:flex items-center space-x-10">
            {menuItems.map((item, index) => (
              <li
                key={index}
                className="relative"
                onMouseEnter={() => setHovered(index)}
                onMouseLeave={() => setHovered(null)}
              >
                <button
                  className={cn(
                    "flex items-center space-x-2 text-m font-medium uppercase tracking-wider transition-colors duration-300 py-2",
                    variant === "light" ? "text-foreground hover:text-green-700" : "text-white hover:text-green-300"
                  )}
                  aria-expanded={hovered === index}
                >
                  <span>{item.label}</span>
                  {item.submenu.length > 0 && (
                    <motion.svg
                      animate={{ rotate: hovered === index ? 180 : 0 }}
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M7 10l5 5 5-5z" />
                    </motion.svg>
                  )}
                </button>

                {/* Underline indicator */}
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-400"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: hovered === index ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                />
              </li>
            ))}
          </ul>

          {/* Right Icons */}
          <div className="flex items-center space-x-4 md:space-x-6 relative z-50">
            {/* Search */}
            <div className="relative">
              <button
                onClick={toggleSearch}
                className={cn(
                  "p-2 md:p-3 rounded-full transition-all duration-300 backdrop-blur-md",
                  variant === "light"
                    ? "text-foreground hover:bg-muted/60"
                    : "text-white hover:bg-white/10"
                )}
                aria-label="Search"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                </svg>
              </button>

              <AnimatePresence>
                {isSearchOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-72 md:w-80 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-white/20"
                  >
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Rechercher..."
                      className="w-full px-4 py-3 md:px-5 md:py-4 text-foreground placeholder:text-muted-foreground border-2 border-green-500 rounded-xl transition-all duration-300 ease-out hover:border-green-600 focus:border-green-600 focus:ring-2 focus:ring-green-500/40 focus:outline-none"
                    />

                    {searchQuery && (
                      <div className="max-h-64 md:max-h-96 overflow-y-auto border-t border-gray-200">
                        {searchResults.length > 0 ? (
                          searchResults.map((r, i) => (
                            <a
                              key={i}
                              href={r.href}
                              onClick={() => {
                                setIsSearchOpen(false);
                                setSearchQuery("");
                              }}
                              className="block px-4 py-3 md:px-5 md:py-4 hover:bg-gray-100 transition-colors border-b border-gray-100 last:border-0"
                            >
                              <div className="font-semibold text-foreground text-sm md:text-base">{r.title}</div>
                              {r.desc && <div className="text-xs md:text-sm text-gray-600 mt-1">{r.desc}</div>}
                            </a>
                          ))
                        ) : (
                          <div className="px-4 py-6 md:px-5 md:py-8 text-center text-gray-500 text-sm md:text-base">Aucun résultat</div>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Social Media Icons - Hidden on mobile */}
            {/* <div className="hidden md:block">
              <SocialMediaIcons variant={variant} />
            </div> */}

            {/* CTA Buttons - Hidden on small screens */}
            <div className="hidden lg:flex items-center gap-2">
              <Button
                className={cn(
                  "font-semibold",
                  variant === "light"
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-green-300 text-green-950 hover:bg-green-200"
                )}
                onClick={() => navigate("/book-demo")}
              >
                Demo
              </Button>
              <Button
                variant="outline"
                className={cn(
                  variant === "light"
                    ? "border-green-200 text-green-700 hover:bg-green-50"
                    : "border-white/30 bg-transparent text-white hover:bg-white/10"
                )}
                onClick={() => navigate("/register")}
              >
                Sign in
              </Button>
              <Button
                variant="outline"
                className={cn(
                  variant === "light"
                    ? "border-border text-foreground hover:bg-muted/40"
                    : "border-white/30 bg-transparent text-white hover:bg-white/10"
                )}
                onClick={() => navigate("/login")}
              >
                Log in
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="lg:hidden p-2 md:p-3 hover:bg-white/10 rounded-full transition-all"
              aria-label="Menu"
            >
              <motion.div className="space-y-1.5">
                <motion.span
                  animate={{
                    rotate: isMobileOpen ? 45 : 0,
                    y: isMobileOpen ? 8 : 0
                  }}
                  className={cn(
                    "block w-6 h-0.5 transition-all origin-center",
                    variant === "light" ? "bg-foreground" : "bg-white"
                  )}
                />
                <motion.span
                  animate={{
                    opacity: isMobileOpen ? 0 : 1
                  }}
                  className={cn(
                    "block w-6 h-0.5 transition-all",
                    variant === "light" ? "bg-foreground" : "bg-white"
                  )}
                />
                <motion.span
                  animate={{
                    rotate: isMobileOpen ? -45 : 0,
                    y: isMobileOpen ? -8 : 0
                  }}
                  className={cn(
                    "block w-6 h-0.5 transition-all origin-center",
                    variant === "light" ? "bg-foreground" : "bg-white"
                  )}
                />
              </motion.div>
            </button>
          </div>
        </div>

        {/* Desktop Mega Menu */}
        <AnimatePresence>
          {hovered !== null && menuItems[hovered].submenu.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className={cn(
                "hidden lg:block absolute inset-x-0 top-full backdrop-blur-2xl border-t overflow-hidden",
                variant === "light" ? "bg-background/95 border-border" : "bg-green-800/95 border-white/10"
              )}
              onMouseEnter={() => setHovered(hovered)}
              onMouseLeave={() => setHovered(null)}
            >
              {activeImage && (
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-10"
                  style={{ backgroundImage: `url(${activeImage})` }}
                />
              )}
              <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                  {menuItems[hovered].submenu.map((sub, i) => (
                    <a
                      key={i}
                      href={sub.href}
                      className={cn(
                        "group block p-4 md:p-6 rounded-xl md:rounded-2xl transition-all duration-300 border border-transparent hover:border-green-400/30",
                        variant === "light" ? "hover:bg-muted/40" : "hover:bg-white/5"
                      )}
                      onMouseEnter={() => sub.imageUrl && setActiveImage(sub.imageUrl)}
                    >
                      <h3
                        className={cn(
                          "text-lg md:text-xl font-bold transition-colors",
                          variant === "light"
                            ? "text-foreground group-hover:text-green-700"
                            : "text-white group-hover:text-green-300"
                        )}
                      >
                        {sub.title}
                      </h3>
                      {sub.desc && (
                        <p
                          className={cn(
                            "mt-2 text-xs md:text-sm",
                            variant === "light" ? "text-muted-foreground" : "text-gray-200"
                          )}
                        >
                          {sub.desc}
                        </p>
                      )}
                      <div className="mt-3 md:mt-4 w-8 md:w-12 h-0.5 md:h-1 bg-green-400/0 group-hover:bg-green-400 transition-all duration-500" />
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Mobile Menu Overlay & Panel */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] lg:hidden"
              onClick={() => setIsMobileOpen(false)}
            />

            {/* Mobile Menu Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className={cn(
                "fixed top-0 right-0 bottom-0 w-full max-w-sm h-screen z-[70] shadow-2xl overflow-y-auto lg:hidden",
                variant === "light"
                  ? "bg-background text-foreground"
                  : "bg-gradient-to-br from-green-800 via-green-800 to-green-950 text-white"
              )}
            >
              {/* Close Button */}
              <div
                className={cn(
                  "sticky top-0 backdrop-blur-md z-10 px-6 py-5 flex justify-between items-center border-b",
                  variant === "light" ? "bg-background/95 border-border" : "bg-green-800/95 border-white/10"
                )}
              >
                <Logo variant={variant} />
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-full transition-all"
                  aria-label="Close menu"
                >
                  <svg
                    className={cn("w-6 h-6", variant === "light" ? "text-foreground" : "text-white")}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Menu Items */}
              <div className="px-6 py-8 space-y-2">
                {menuItems.map((item, index) => (
                  <div key={index} className="border-b border-white/5 pb-4 last:border-0">
                    <button
                      onClick={() => setMobileExpanded(mobileExpanded === index ? null : index)}
                      className={cn(
                        "w-full flex justify-between items-center text-xl font-bold uppercase tracking-wider transition-colors py-3",
                        variant === "light" ? "text-foreground hover:text-green-700" : "text-white hover:text-green-300"
                      )}
                    >
                      <span>{item.label}</span>
                      {item.submenu.length > 0 && (
                        <motion.svg
                          animate={{ rotate: mobileExpanded === index ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M7 10l5 5 5-5z" />
                        </motion.svg>
                      )}
                    </button>

                    <AnimatePresence>
                      {mobileExpanded === index && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-3 space-y-1 pl-4">
                            {item.submenu.map((sub, i) => (
                              <a
                                key={i}
                                href={sub.href}
                                onClick={() => setIsMobileOpen(false)}
                                className="block py-3 px-4 rounded-lg hover:bg-white/10 transition-all group"
                              >
                                <div
                                  className={cn(
                                    "font-semibold text-base transition-colors",
                                    variant === "light"
                                      ? "text-foreground group-hover:text-green-700"
                                      : "text-white group-hover:text-green-300"
                                  )}
                                >
                                  {sub.title}
                                </div>
                                {sub.desc && (
                                  <div
                                    className={cn(
                                      "text-sm mt-1",
                                      variant === "light" ? "text-muted-foreground" : "text-gray-400"
                                    )}
                                  >
                                    {sub.desc}
                                  </div>
                                )}
                              </a>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>

              {/* Mobile CTAs */}
              <div className={cn("px-6 pb-6", variant === "light" ? "" : "")}
              >
                <div className="grid grid-cols-1 gap-2">
                  <Button
                    className={cn(
                      "w-full font-semibold",
                      variant === "light"
                        ? "bg-green-600 text-white hover:bg-green-700"
                        : "bg-green-300 text-green-950 hover:bg-green-200"
                    )}
                    onClick={() => {
                      setIsMobileOpen(false);
                      navigate("/book-demo");
                    }}
                  >
                    Demo
                  </Button>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full",
                      variant === "light"
                        ? "border-green-200 text-green-700 hover:bg-green-50"
                        : "border-white/30 bg-transparent text-white hover:bg-white/10"
                    )}
                    onClick={() => {
                      setIsMobileOpen(false);
                      navigate("/register");
                    }}
                  >
                    Sign in
                  </Button>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full",
                      variant === "light"
                        ? "border-border text-foreground hover:bg-muted/40"
                        : "border-white/30 bg-transparent text-white hover:bg-white/10"
                    )}
                    onClick={() => {
                      setIsMobileOpen(false);
                      navigate("/login");
                    }}
                  >
                    Log in
                  </Button>
                </div>
              </div>

              {/* Footer */}
              <div
                className={cn(
                  "px-6 py-8 border-t mt-auto",
                  variant === "light" ? "border-border" : "border-white/10"
                )}
              >
                <div className="mb-6">
                  {/* <SocialMediaIcons variant={variant} /> */}
                </div>
                <p className={cn("text-sm", variant === "light" ? "text-muted-foreground" : "text-gray-400")}>
                  © 2026 Verdustry. Tous droits réservés.
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default MarketingNavbar;