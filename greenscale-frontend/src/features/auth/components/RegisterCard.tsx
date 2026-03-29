import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { authService } from "../services/authService"
import { Building2, Mail, Lock, Leaf, ArrowLeft, UserCheck } from "lucide-react"

export function RegistrationForm() {
  const [formData, setFormData] = useState({ business_name: "", email: "", password: "" })
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await authService.register(formData)
      alert("Succès ! Vous pouvez maintenant vous connecter.")
      navigate("/login")
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error)
      alert("Erreur d’inscription : " + message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4 py-8">
      <div className="w-full max-w-sm">
        {/* Header Section */}
        <div className="bg-gradient-to-br from-green-700 via-green-600 to-green-700 rounded-t-3xl p-10 text-center relative overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-green-500/20 rounded-full -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-green-500/20 rounded-full -ml-16 -mb-16" />
          
          <div className="relative z-10">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <img
    src="/verdusty.png"
    alt="Verdustry Logo"
    className="h-13 w-auto object-contain"
  />
            </div>
            <h1 className="text-2xl font-black text-white mb-1">Rejoindre Verdustry</h1>
            <p className="text-green-100 font-medium text-sm">Créez votre compte et commencez à suivre votre durabilité</p>
          </div>
        </div>

        {/* Form Section */}
        <div className="bg-white rounded-b-3xl shadow-2xl p-5">
          <form className="space-y-2" onSubmit={handleRegister}>
            {/* Business Name Field */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-600 block mb-1.5">NOM DE L’ENTREPRISE</label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                  placeholder="ex. Global Tech Inc" 
                  className="w-full h-10 pl-12 pr-4 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-green-500 transition-all font-medium"
                  onChange={(e) => setFormData({...formData, business_name: e.target.value})}
                  required 
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-600 block mb-1.5">ADRESSE E-MAIL</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                  type="email" 
                  placeholder="admin@business.com" 
                  className="w-full h-10 pl-12 pr-4 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-green-500 transition-all font-medium"
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required 
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-600 block mb-1.5">MOT DE PASSE</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                  type="password" 
                  placeholder="••••••••••••"
                  className="w-full h-10 pl-12 pr-4 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-green-500 transition-all font-medium"
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required 
                />
              </div>
            </div>

            {/* Register Button */}
            <button 
              type="submit" 
              className="w-full h-9 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-all duration-300 shadow-md hover:shadow-lg active:scale-95 mt-3 flex items-center justify-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? "Création du compte..." : "Créer un compte"}
              {!isLoading && <UserCheck size={18} />}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-500 font-medium">DÉJÀ MEMBRE ?</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Login Link */}
          <p className="text-center text-xs">
            <Link to="/login" className="inline-flex items-center gap-2 text-green-600 font-bold hover:text-green-700 transition-colors">
              <ArrowLeft size={14} /> Retour à la connexion
            </Link>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-xs mt-3">© 2026 Verdustry. Tous droits réservés.</p>
      </div>
    </div>
  )
}