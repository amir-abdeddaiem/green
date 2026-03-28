import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { HelpCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
// FAQ Data
const FAQS = [
  {
    id: "q1",
    question: "What is a carbon footprint in accounting terms?",
    answer: "A carbon footprint, from an accounting perspective, represents the total volume of greenhouse gas emissions, including carbon dioxide and methane, that are directly and indirectly produced by an entity, event, product, or individual. It's vital for businesses to meticulously track and report these emissions as part of their commitment to environmental stewardship and sustainability.",
    category: "Basics",
    tags: ["carbon footprint", "accounting", "GHG"],
  },
  {
    id: "q2",
    question: "How can businesses account for their carbon emissions?",
    answer: "Businesses can monitor their carbon emissions by adopting carbon accounting methodologies. This process involves pinpointing and quantifying the greenhouse gas emissions emanating from various aspects of their operations, such as energy usage, transportation, waste management, and manufacturing processes. These measurements are subsequently converted into carbon dioxide equivalents (CO2e) for comprehensive reporting and analysis.",
    category: "Accounting",
    tags: ["carbon accounting", "methodology", "CO2e"],
  },
  {
    id: "q3",
    question: "What are some effective strategies for carbon footprint reduction?",
    answer: "There are several strategies businesses can employ to reduce their carbon footprint. These include implementing energy-efficient practices, encouraging remote work, optimizing logistics to reduce transportation emissions, and investing in renewable energy sources.",
    category: "Reduction",
    tags: ["strategies", "reduction", "energy efficiency"],
  },
  {
    id: "q4",
    question: "What is the Carbon Border Adjustment Mechanism (CBAM)?",
    answer: "The Carbon Border Adjustment Mechanism (CBAM) is a policy initiative introduced by the European Union (EU) to tackle carbon leakage. It's designed to deter companies from shifting production to regions with less stringent climate regulations. CBAM levies tariffs on certain imported goods based on their embedded carbon emissions, ensuring that imported products bear a similar carbon cost as those produced domestically.",
    category: "Regulation",
    tags: ["CBAM", "EU", "regulation", "carbon leakage"],
  },
  {
    id: "q5",
    question: "What challenges do businesses face when adapting to CBAM?",
    answer: "Businesses face several challenges when adapting to CBAM. These include accounting for CBAM-related costs, modifying supply chains to reduce carbon emissions, and ensuring compliance with stringent reporting requirements.",
    category: "Regulation",
    tags: ["CBAM", "compliance", "challenges"],
  },
  {
    id: "q6",
    question: "How does ESG impact a company's reputation?",
    answer: "Robust ESG (Environmental, Social, and Governance) practices can significantly enhance a company's reputation. They can attract customers who prioritize social responsibility, improve trust among stakeholders, and potentially lead to better financial performance.",
    category: "ESG",
    tags: ["ESG", "reputation", "stakeholders"],
  },
  {
    id: "q7",
    question: "What are the risks of ignoring ESG considerations?",
    answer: "Ignoring ESG considerations can pose significant risks to a company. These include potential reputational damage, regulatory fines, and skepticism from investors, which could negatively impact the company's financial performance and market value.",
    category: "ESG",
    tags: ["ESG", "risks", "compliance"],
  },
];

const CATEGORIES = ["All", "Basics", "Accounting", "Reduction", "Regulation", "ESG"];

// Custom hook for intersection observer
function useInView<T extends HTMLElement>(threshold = 0.1) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setInView(true);
          observer.unobserve(element);
        }
      },
      { threshold }
    );

    observer.observe(element);
    return () => observer.unobserve(element);
  }, [threshold]);

  return [ref, inView] as const;
}

// Individual FAQ Item Component
function FAQItem({
  faq,
  isOpen,
  onToggle,
  index,
  inView,
}: {
  faq: typeof FAQS[0];
  isOpen: boolean;
  onToggle: () => void;
  index: number;
  inView: boolean;
}) {

  return (
    <div
      className={cn(
        "group border-b border-green-100/50 transition-all duration-500",
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      )}
      style={{ transitionDelay: `${Math.min(index * 80, 400)}ms` }}
    >
      <button
        onClick={onToggle}
        className="w-full py-6 text-left flex items-start justify-between gap-4 hover:bg-green-50/30 transition-colors rounded-xl px-4 -mx-4"
      >
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs font-bold">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
              {faq.category}
            </span>
          </div>
          <h3 className={cn(
            "text-lg md:text-xl font-semibold text-gray-900 transition-colors",
            isOpen ? "text-green-700" : "group-hover:text-green-600"
          )}>
            {faq.question}
          </h3>
        </div>
        <div className={cn(
          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300",
          isOpen 
            ? "bg-green-500 text-white rotate-180" 
            : "bg-gray-100 text-gray-500 group-hover:bg-green-100 group-hover:text-green-600"
        )}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      <div
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          isOpen ? "max-h-96 opacity-100 mb-6" : "max-h-0 opacity-0"
        )}
      >
        <div className="px-4 pb-4 text-gray-600 leading-relaxed border-l-2 border-green-200 ml-8">
          <p>{faq.answer}</p>
          <div className="flex flex-wrap gap-2 mt-4">
            {faq.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-1 bg-gray-100 text-gray-500 rounded-full hover:bg-green-100 hover:text-green-700 transition-colors cursor-pointer"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Search Bar Component
function SearchBar({ onSearch }: { onSearch: (query: string) => void }) {
  const [query, setQuery] = useState("");

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input
        type="text"
        placeholder="Rechercher une question..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          onSearch(e.target.value);
        }}
        className="w-full pl-11 pr-4 py-4 border border-green-200 rounded-2xl bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-700 placeholder:text-gray-400"
      />
      {query && (
        <button
          onClick={() => {
            setQuery("");
            onSearch("");
          }}
          className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}

// Category Filter Component
function CategoryFilter({
  categories,
  activeCategory,
  onSelect,
}: {
  categories: string[];
  activeCategory: string;
  onSelect: (category: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onSelect(cat)}
          className={cn(
            "px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200",
            activeCategory === cat
              ? "bg-green-600 text-white shadow-md shadow-green-200 scale-105"
              : "bg-white text-gray-600 hover:bg-green-50 hover:text-green-700 border border-gray-200 hover:border-green-200"
          )}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}

// Still Have Questions Component
function StillHaveQuestions() {
  const navigate = useNavigate();
  return (
    <div className="mt-16 bg-green-100 rounded-3xl p-8 md:p-12 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-6">
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </div>
      <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
        Vous avez d'autres questions ?
      </h3>
      <p className="text-gray-600 max-w-md mx-auto mb-8">
        Notre équipe d'experts est là pour vous accompagner dans votre transition carbone.
      </p>
      <div className="flex flex-wrap gap-4 justify-center">
        <button
        type="button"
  className="group inline-flex items-center gap-2 px-6 py-3 
  bg-green-600 
  text-white rounded-xl font-semibold 
  hover:from-green-700 hover:to-emerald-600 
  transition-all duration-300 hover:scale-105 
  shadow-lg shadow-green-500/30"
  onClick={() => navigate("/contact")}
  
>
  <HelpCircle className="w-5 h-5 group-hover:rotate-12 transition-transform" />
  autre question ?
</button>
        
      </div>
    </div>
  );
}

// Main FAQ Section Component
export function FAQSection() {
  const [sectionRef, sectionInView] = useInView<HTMLDivElement>(0.1);
  const [openId, setOpenId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  

  const toggleFAQ = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  const filteredFAQs = FAQS.filter((faq) => {
    const matchesCategory = activeCategory === "All" || faq.category === activeCategory;
    const matchesSearch = searchQuery === "" || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <section
      ref={sectionRef}
      className="relative w-full py-24 md:py-32 bg-gradient-to-b from-white to-green-50/30 overflow-hidden"
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-300/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-green-300/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-green-100/10 to-green-100/10 rounded-full blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-4xl px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900">
            Questions fréquentes
          </h2>
          <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
            Tout ce que vous devez savoir sur la comptabilité carbone, CBAM, ESG et nos solutions.
          </p>
        </div>

        <div className="mb-8">
          <SearchBar onSearch={setSearchQuery} />
        </div>

        <div className="mb-12">
          <CategoryFilter
            categories={CATEGORIES}
            activeCategory={activeCategory}
            onSelect={setActiveCategory}
          />
        </div>

        <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl border border-green-100/50 p-4 md:p-6">
          {filteredFAQs.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Aucun résultat trouvé</h3>
              <p className="text-gray-500">
                Essayez une autre recherche ou parcourez les catégories ci-dessus.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory("All");
                }}
                className="mt-4 text-green-600 font-medium hover:text-green-700"
              >
                Réinitialiser les filtres
              </button>
            </div>
          ) : (
            <div className="divide-y divide-green-100/50">
              {filteredFAQs.map((faq, idx) => (
                <FAQItem
                  key={faq.id}
                  faq={faq}
                  isOpen={openId === faq.id}
                  onToggle={() => toggleFAQ(faq.id)}
                  index={idx}
                  inView={sectionInView}
                />
              ))}
            </div>
          )}
        </div>

        <StillHaveQuestions />
      </div>
    </section>
  );
}