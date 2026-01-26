import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { authService } from "../services/authService"
import { Eye, EyeOff, Lock, Mail, Leaf, CheckCircle2 } from "lucide-react"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const result = await authService.login({ email, password })
      localStorage.setItem("business_name", result.business_name || "Business")
      localStorage.setItem("user_id", (result.user_id || "").toString())
      localStorage.setItem("isLoggedIn", "true")
      if (rememberMe) {
        localStorage.setItem("rememberEmail", email)
      }
      navigate("/dashboard") 
    } catch (error: any) {
      alert("Login Error: " + error.message)
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
              <Leaf className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-black text-white mb-1">Welcome Back</h1>
            <p className="text-green-100 font-medium text-sm">Sign in to GreenScale</p>
          </div>
        </div>

        {/* Form Section */}
        <div className="bg-white rounded-b-3xl shadow-2xl p-6">
          <form className="space-y-3" onSubmit={handleLogin}>
            {/* Email Field */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-600 block mb-2">EMAIL ADDRESS</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                  type="email" 
                  placeholder="name@company.com" 
                  className="w-full h-12 pl-12 pr-4 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-green-500 transition-all font-medium"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-600 block mb-2">PASSWORD</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••••••"
                  className="w-full h-12 pl-12 pr-12 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-green-500 transition-all font-medium"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
                />
                <span className="text-sm font-medium text-gray-700">Remember me</span>
              </label>
              <a href="#" className="text-sm font-semibold text-green-600 hover:text-green-700 transition-colors">Forgot Password?</a>
            </div>

            {/* Sign In Button */}
            <button 
              type="submit" 
              className="w-full h-10 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-all duration-300 shadow-md hover:shadow-lg active:scale-95 mt-4 flex items-center justify-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
              {!isLoading && <CheckCircle2 size={18} />}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-500 font-medium">NEW USER?</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Sign Up Link */}
          <p className="text-center text-gray-600 font-medium text-sm">
            Don't have an account? <Link to="/register" className="text-green-600 font-bold hover:text-green-700 transition-colors">Create one</Link>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-xs mt-4">© 2026 GreenScale. All rights reserved.</p>
      </div>
    </div>
  )
}