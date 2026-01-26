import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Leaf, Menu, X, ArrowRight, BarChart3, Zap, Shield, Target, TrendingDown, Users,
  Lightbulb, CheckCircle
} from "lucide-react";

export function HomePage() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const features = [
    {
      icon: BarChart3,
      title: "Real-Time Analytics",
      description: "Monitor your carbon emissions in real-time with detailed analytics and insights"
    },
    {
      icon: Target,
      title: "Sustainability Goals",
      description: "Set and track environmental targets with our intelligent goal management system"
    },
    {
      icon: TrendingDown,
      title: "Emissions Tracking",
      description: "Accurate tracking of all emission sources across your organization"
    },
    {
      icon: Zap,
      title: "AI-Powered Insights",
      description: "Get smart recommendations to reduce your carbon footprint"
    },
    {
      icon: Shield,
      title: "Data Security",
      description: "Enterprise-grade security for your sensitive sustainability data"
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Collaborate with your team to achieve sustainability goals together"
    }
  ];

  const stats = [
    { number: "500+", label: "Organizations Tracking Emissions" },
    { number: "50M+", label: "Tons of CO2 Tracked" },
    { number: "98%", label: "User Satisfaction Rate" }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <nav className="fixed w-full bg-white border-b border-gray-200 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <p className="font-bold text-black text-lg">GreenScale</p>
                <p className="text-xs text-gray-500">Sustainability Hub</p>
              </div>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-700 hover:text-green-600 transition font-medium">
                Features
              </a>
              <a href="#why-us" className="text-gray-700 hover:text-green-600 transition font-medium">
                Why Us
              </a>
              <a href="#pricing" className="text-gray-700 hover:text-green-600 transition font-medium">
                Pricing
              </a>
              <a href="#contact" className="text-gray-700 hover:text-green-600 transition font-medium">
                Contact
              </a>
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center gap-4">
              <button
                onClick={() => navigate("/login")}
                className="px-6 py-2 text-green-600 border border-green-600 rounded-lg hover:bg-green-50 transition font-medium"
              >
                Login
              </button>
              <button
                onClick={() => navigate("/register")}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
              >
                Get Started
              </button>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden border-t border-gray-200 py-4 space-y-4">
              <a href="#features" className="block text-gray-700 hover:text-green-600 py-2 font-medium">
                Features
              </a>
              <a href="#why-us" className="block text-gray-700 hover:text-green-600 py-2 font-medium">
                Why Us
              </a>
              <a href="#pricing" className="block text-gray-700 hover:text-green-600 py-2 font-medium">
                Pricing
              </a>
              <a href="#contact" className="block text-gray-700 hover:text-green-600 py-2 font-medium">
                Contact
              </a>
              <div className="flex flex-col gap-3 pt-4">
                <button
                  onClick={() => navigate("/login")}
                  className="w-full px-6 py-2 text-green-600 border border-green-600 rounded-lg hover:bg-green-50 transition font-medium"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate("/register")}
                  className="w-full px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                >
                  Get Started
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold text-black mb-6 leading-tight">
                Track Your <span className="text-green-600">Carbon Impact</span> with Precision
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                GreenScale is a comprehensive sustainability platform that helps organizations measure, monitor, and reduce their carbon emissions effectively.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate("/register")}
                  className="px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold text-lg flex items-center justify-center gap-2"
                >
                  Start Free Trial <ArrowRight size={20} />
                </button>
                <button
                  onClick={() => navigate("/login")}
                  className="px-8 py-4 border-2 border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition font-semibold text-lg"
                >
                  Login to Dashboard
                </button>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative">
              <img 
                src="/assets/heromain.png"
                alt="Analytics Dashboard"
                className="w-full h-auto rounded-2xl shadow-xl object-cover"
              />
              {/* Optional: Add a gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-green-50 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-4xl md:text-5xl font-bold text-green-600 mb-2">{stat.number}</p>
                <p className="text-gray-700 text-lg">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">Powerful Features</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to manage your organization's sustainability journey
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div key={i} className="p-8 border border-gray-200 rounded-xl hover:shadow-lg hover:border-green-200 transition">
                  <Icon className="w-12 h-12 text-green-600 mb-4" />
                  <h3 className="text-xl font-bold text-black mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Us Section */}
      <section id="why-us" className="bg-gray-50 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">Why Choose GreenScale?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join thousands of organizations committed to sustainability
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
              {[
                "Accurate emission tracking across all sources",
                "AI-powered insights and recommendations",
                "Customizable sustainability reports",
                "Team collaboration tools",
                "Real-time data visualization",
                "Enterprise-grade security"
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <span className="text-lg text-gray-700">{item}</span>
                </div>
              ))}
            </div>

            <div className="relative">
              <div className="w-full h-96 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl flex items-center justify-center border-2 border-green-200">
                <div className="text-center">
                  <Lightbulb className="w-24 h-24 text-green-600 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium">Smart Sustainability Solutions</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Developer Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">Meet the Developer</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The passionate engineer behind GreenScale
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Developer Image */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-80 h-80 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl overflow-hidden border-4 border-green-600 shadow-2xl">
                  <img
                    src="/assets/atiq-web.png"
                    alt="Muhammad Atiq"
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Green accent */}
                <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-green-600 rounded-full opacity-10"></div>
              </div>
            </div>

            {/* Developer Info */}
            <div>
              <h3 className="text-4xl font-bold text-black mb-2">Muhammad Atiq</h3>
              <p className="text-xl text-green-600 font-semibold mb-6">Full Stack Developer & Sustainability Enthusiast</p>
              
              <p className="text-gray-700 text-lg leading-relaxed mb-8">
                Muhammad is a passionate full-stack developer dedicated to building sustainable technology solutions. 
                With expertise in React, Python, and cloud technologies, he created GreenScale to empower organizations 
                in their sustainability journey.
              </p>

              <div className="mb-8">
                <h4 className="text-lg font-bold text-black mb-4">Key Skills</h4>
                <div className="flex flex-wrap gap-3">
                  {["React", "TypeScript", "Python", "FastAPI", "PostgreSQL", "AWS", "Sustainability Tech"].map((skill, i) => (
                    <span
                      key={i}
                      className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <a
                  href="https://www.linkedin.com/in/muhammadatiq111/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
                >
                  <span>Visit LinkedIn Profile</span>
                  <ArrowRight size={18} />
                </a>
              </div>

              <p className="text-gray-500 text-sm mt-6">
                📍 Based in Pakistan | 💼 Available for Freelance & Full-time Opportunities
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-green-600 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Sustainability?
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Join the growing movement of organizations taking control of their environmental impact
          </p>
          <button
            onClick={() => navigate("/register")}
            className="px-8 py-4 bg-white text-green-600 rounded-lg hover:bg-gray-100 transition font-bold text-lg inline-flex items-center gap-2"
          >
            Get Started Today <ArrowRight size={20} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                  <Leaf className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-lg">GreenScale</span>
              </div>
              <p className="text-gray-400 text-sm">Sustainability tracking made simple</p>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#features" className="hover:text-green-400 transition">Features</a></li>
                <li><a href="#pricing" className="hover:text-green-400 transition">Pricing</a></li>
                <li><a href="#" className="hover:text-green-400 transition">Integrations</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="/" className="hover:text-green-400 transition">About</a></li>
                <li><a href="/" className="hover:text-green-400 transition">Blog</a></li>
                <li><a href="/" className="hover:text-green-400 transition">Careers</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="/" className="hover:text-green-400 transition">Privacy</a></li>
                <li><a href="/" className="hover:text-green-400 transition">Terms</a></li>
                <li><a href="/" className="hover:text-green-400 transition">Contact</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8">
            <p className="text-center text-gray-400 text-sm">
              © 2026 GreenScale. All rights reserved. Committed to a sustainable future.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
