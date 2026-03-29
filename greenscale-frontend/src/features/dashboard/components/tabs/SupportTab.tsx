import { useState } from "react";
import { HelpCircle, MessageCircle, Mail, Phone, FileText, AlertCircle, ChevronDown, Send, Search } from "lucide-react";

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}interface ContactOption {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  action: string;
  contact: string;
}

export function SupportTab() {
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [formSubmitted, setFormSubmitted] = useState(false);

  const faqItems: FAQItem[] = [
    {
      id: 1,
      question: "Comment suivre mes émissions de carbone ?",
      answer:
        "Vous pouvez suivre vos émissions de carbone en allant sur la page Émissions et en cliquant sur l’un des boutons de type d’émission (Électricité, Gaz, Carburant, Déchets). Renseignez les informations requises puis validez pour enregistrer vos émissions. Les données apparaîtront automatiquement dans votre tableau de bord.",
    },
    {
      id: 2,
      question: "Comment définir des objectifs de durabilité ?",
      answer:
        "Allez dans la section Objectifs depuis la barre latérale. Cliquez sur le bouton « Ajouter un objectif », définissez votre cible de réduction des émissions, sélectionnez les catégories à suivre et choisissez une échéance. Vous pouvez suivre la progression grâce aux indicateurs visuels pour chaque objectif.",
    },
    {
      id: 3,
      question: "Puis-je exporter mes données d’émissions ?",
      answer:
        "Oui ! Sur le tableau de bord, cliquez sur le bouton « Télécharger » pour exporter votre rapport d’émissions au format PDF. Vous pouvez filtrer les données par période avant l’export. Les rapports incluent des analyses détaillées et des visualisations.",
    },
    {
      id: 4,
      question: "Que signifient les différents filtres de dates ?",
      answer:
        "Aujourd’hui affiche les données du jour. 7j affiche les 7 derniers jours. Mois affiche les 30 derniers jours. 6m affiche les 6 derniers mois. Année affiche les 365 derniers jours. Tout affiche l’historique complet depuis la création du compte.",
    },
    {
      id: 5,
      question: "Comment l’impact CO₂ est-il calculé ?",
      answer:
        "L’impact CO₂ est calculé à partir de facteurs d’émission standards pour chaque catégorie. L’électricité utilise des facteurs moyens du réseau, le gaz des facteurs de combustion, le carburant des facteurs spécifiques au type de carburant, et les déchets des facteurs liés à la méthode de traitement. Les calculs suivent des standards internationaux.",
    },
    {
      id: 6,
      question: "Puis-je mettre à jour le profil de mon entreprise ?",
      answer:
        "Oui, allez dans Paramètres via la barre latérale. Vous pouvez mettre à jour le nom de l’entreprise, l’e-mail et la photo de profil. Les modifications sont enregistrées automatiquement et s’appliquent à tout le tableau de bord.",
    },
    {
      id: 7,
      question: "Que faire si j’enregistre une émission par erreur ?",
      answer:
        "Vous pouvez supprimer les émissions incorrectes depuis votre journal des émissions. Trouvez l’entrée, cliquez sur supprimer et confirmez. Elle sera retirée des statistiques. Vous pouvez vérifier le changement dans le graphique des tendances mensuelles.",
    },
    {
      id: 8,
      question: "Mes données sont-elles sécurisées et privées ?",
      answer:
        "Oui, toutes vos données sont chiffrées et stockées de manière sécurisée. Vous contrôlez l’accès à votre compte via vos identifiants. Nous suivons des standards internationaux de protection des données et ne partageons jamais vos informations avec des tiers.",
    },
  ];

  const contactOptions: ContactOption[] = [
    {
      id: "email",
      icon: <Mail className="w-6 h-6" />,
      title: "Support e-mail",
      description: "Envoyez-nous un e-mail et nous répondrons sous 24 heures",
      action: "Envoyer un e-mail",
      contact: "support@Verdustry.com",
    },
    {
      id: "chat",
      icon: <MessageCircle className="w-6 h-6" />,
      title: "Chat en direct",
      description: "Discutez avec notre équipe support en temps réel",
      action: "Démarrer le chat",
      contact: "Disponible 9h–17h (EST)",
    },
    {
      id: "phone",
      icon: <Phone className="w-6 h-6" />,
      title: "Support téléphonique",
      description: "Appelez notre ligne support dédiée",
      action: "Appeler maintenant",
      contact: "+1 (555) 123-4567",
    },
  ];

  const filteredFAQ = faqItems.filter(
    (item) =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContactForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", contactForm);
    setFormSubmitted(true);
    setContactForm({ name: "", email: "", subject: "", message: "" });
    setTimeout(() => setFormSubmitted(false), 3000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-white via-green-50 to-white rounded-3xl p-8 md:p-12 border border-green-200/50">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
            <HelpCircle className="w-6 h-6 text-green-700" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900">Aide & support</h1>
        </div>
        <p className="text-slate-600 text-lg">
          Nous sommes là pour vous aider. Trouvez des réponses aux questions fréquentes ou contactez notre équipe support.
        </p>
      </div>

      {/* Contact Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {contactOptions.map((option) => (
          <div
            key={option.id}
            className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-green-300 hover:shadow-lg transition-all"
          >
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600 mb-4">
              {option.icon}
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">{option.title}</h3>
            <p className="text-slate-500 text-sm mb-4">{option.description}</p>
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-700">{option.contact}</p>
              <button className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all">
                {option.action}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* FAQ Section */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900 mb-4">Questions fréquentes</h2>

          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-3 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher dans la FAQ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 bg-white"
            />
          </div>

          {/* FAQ Items */}
          <div className="space-y-3">
            {filteredFAQ.length > 0 ? (
              filteredFAQ.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl border border-gray-200 hover:border-green-300 transition-all"
                >
                  <button
                    onClick={() => setExpandedFAQ(expandedFAQ === item.id ? null : item.id)}
                    className="w-full px-6 py-4 flex items-start justify-between hover:bg-green-50 transition-colors"
                  >
                    <h3 className="text-left font-semibold text-slate-900">{item.question}</h3>
                    <ChevronDown
                      className={`w-5 h-5 text-green-600 flex-shrink-0 transition-transform ${
                        expandedFAQ === item.id ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {expandedFAQ === item.id && (
                    <div className="px-6 py-4 border-t border-gray-100 bg-green-50/30">
                      <p className="text-slate-600 leading-relaxed">{item.answer}</p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">Aucune question trouvée. Essayez un autre terme de recherche.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contact Form Section */}
      <div className="bg-white rounded-2xl border border-gray-200 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <Mail className="w-5 h-5 text-green-700" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">Envoyez-nous un message</h2>
        </div>

        {formSubmitted && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-green-700 font-semibold">Message envoyé avec succès ! Nous vous répondrons rapidement.</p>
          </div>
        )}

        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Nom</label>
              <input
                type="text"
                name="name"
                value={contactForm.name}
                onChange={handleFormChange}
                required
                placeholder="Votre nom"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-green-500 bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={contactForm.email}
                onChange={handleFormChange}
                required
                placeholder="your@email.com"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-green-500 bg-gray-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Objet</label>
            <input
              type="text"
              name="subject"
              value={contactForm.subject}
              onChange={handleFormChange}
              required
              placeholder="Quel est le sujet ?"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-green-500 bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Message</label>
            <textarea
              name="message"
              value={contactForm.message}
              onChange={handleFormChange}
              required
              placeholder="Décrivez votre problème ou votre question..."
              rows={5}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-green-500 bg-gray-50 resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
          >
            <Send className="w-4 h-4" />
            Envoyer
          </button>
        </form>
      </div>

      {/* Additional Resources */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-green-300 transition-all">
          <div className="flex items-center gap-3 mb-3">
            <FileText className="w-5 h-5 text-green-600" />
            <h3 className="font-bold text-slate-900">Documentation</h3>
          </div>
          <p className="text-slate-600 text-sm mb-4">Consultez notre guide utilisateur complet et la documentation API.</p>
          <button className="text-green-600 hover:text-green-700 font-semibold text-sm">Voir la doc →</button>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-green-300 transition-all">
          <div className="flex items-center gap-3 mb-3">
            <AlertCircle className="w-5 h-5 text-green-600" />
            <h3 className="font-bold text-slate-900">Page de statut</h3>
          </div>
          <p className="text-slate-600 text-sm mb-4">Vérifiez l’état du système et les mises à jour de maintenance en temps réel.</p>
          <button className="text-green-600 hover:text-green-700 font-semibold text-sm">Voir le statut →</button>
        </div>
      </div>
    </div>
  );
}
