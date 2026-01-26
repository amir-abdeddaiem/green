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
      question: "How do I track my carbon emissions?",
      answer:
        "You can track your carbon emissions by navigating to the Emissions page and clicking on one of the emission type buttons (Electricity, Gas, Fuel, Waste). Fill in the required information and submit to log your emissions. The data will appear in your dashboard automatically.",
    },
    {
      id: 2,
      question: "How do I set sustainability goals?",
      answer:
        "Go to the Goals & Targets section from the sidebar. Click the 'Add Goal' button, set your emission reduction target, select the emission categories to track, and choose your deadline. You can monitor progress with visual indicators showing your journey toward each goal.",
    },
    {
      id: 3,
      question: "Can I export my emissions data?",
      answer:
        "Yes! On the Dashboard, click the 'Download' button to export your emissions report as a PDF. You can filter the data by date range before exporting. Reports include detailed analytics and visualizations.",
    },
    {
      id: 4,
      question: "What do the different date filters mean?",
      answer:
        "Today shows data from the current day. 7D shows the last 7 days of data. Month shows the last 30 days. 6M shows the last 6 months. Year shows the last 365 days. All shows all your historical data since account creation.",
    },
    {
      id: 5,
      question: "How is CO₂ impact calculated?",
      answer:
        "CO₂ impact is calculated using standard emission factors for each category. Electricity uses grid-average factors, Gas uses combustion factors, Fuel uses fuel-specific factors, and Waste uses disposal method factors. All calculations follow international standards.",
    },
    {
      id: 6,
      question: "Can I update my company profile?",
      answer:
        "Yes, go to Settings from the sidebar. You can update your business name, email, and profile picture. Changes are saved automatically and will update across your entire dashboard.",
    },
    {
      id: 7,
      question: "What if I log an emission by mistake?",
      answer:
        "You can delete incorrect emissions from your Emissions Log. Find the entry, click delete, and confirm. This will remove it from your statistics. Consider checking the Monthly Trends chart to verify the change.",
    },
    {
      id: 8,
      question: "Is my data secure and private?",
      answer:
        "Yes, all your data is encrypted and stored securely. You control who has access to your account through your login credentials. We follow international data protection standards and never share your information with third parties.",
    },
  ];

  const contactOptions: ContactOption[] = [
    {
      id: "email",
      icon: <Mail className="w-6 h-6" />,
      title: "Email Support",
      description: "Send us an email and we'll respond within 24 hours",
      action: "Send Email",
      contact: "support@greenscale.com",
    },
    {
      id: "chat",
      icon: <MessageCircle className="w-6 h-6" />,
      title: "Live Chat",
      description: "Chat with our support team in real-time",
      action: "Start Chat",
      contact: "Available 9am-5pm EST",
    },
    {
      id: "phone",
      icon: <Phone className="w-6 h-6" />,
      title: "Phone Support",
      description: "Call our dedicated support hotline",
      action: "Call Now",
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
          <h1 className="text-3xl md:text-4xl font-black text-slate-900">Help & Support</h1>
        </div>
        <p className="text-slate-600 text-lg">
          We're here to help. Find answers to common questions or reach out to our support team.
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
          <h2 className="text-2xl font-black text-slate-900 mb-4">Frequently Asked Questions</h2>

          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-3 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search FAQs..."
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
                <p className="text-slate-500">No FAQs found. Try a different search term.</p>
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
          <h2 className="text-2xl font-black text-slate-900">Send us a Message</h2>
        </div>

        {formSubmitted && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-green-700 font-semibold">Message sent successfully! We'll respond soon.</p>
          </div>
        )}

        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Name</label>
              <input
                type="text"
                name="name"
                value={contactForm.name}
                onChange={handleFormChange}
                required
                placeholder="Your name"
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
            <label className="block text-sm font-semibold text-slate-700 mb-2">Subject</label>
            <input
              type="text"
              name="subject"
              value={contactForm.subject}
              onChange={handleFormChange}
              required
              placeholder="What is this about?"
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
              placeholder="Please describe your issue or question..."
              rows={5}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-green-500 bg-gray-50 resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
          >
            <Send className="w-4 h-4" />
            Send Message
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
          <p className="text-slate-600 text-sm mb-4">Read our comprehensive user guide and API documentation.</p>
          <button className="text-green-600 hover:text-green-700 font-semibold text-sm">View Docs →</button>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-green-300 transition-all">
          <div className="flex items-center gap-3 mb-3">
            <AlertCircle className="w-5 h-5 text-green-600" />
            <h3 className="font-bold text-slate-900">Status Page</h3>
          </div>
          <p className="text-slate-600 text-sm mb-4">Check system status and maintenance updates in real-time.</p>
          <button className="text-green-600 hover:text-green-700 font-semibold text-sm">Check Status →</button>
        </div>
      </div>
    </div>
  );
}
