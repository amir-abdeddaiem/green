import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authService } from "../services/authService"
import { Eye, EyeOff, Lock, Mail, ArrowRight, ShieldCheck } from "lucide-react"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const result = await authService.login({ email, password })
      localStorage.setItem("business_name", result.business_name)
      localStorage.setItem("user_id", result.user_id.toString())
      localStorage.setItem("isLoggedIn", "true")
      navigate("/dashboard") 
    } catch (error: any) {
      alert("Login Error: " + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 px-4">
      <Card className="w-full max-w-[420px] shadow-[0_20px_60px_rgba(0,0,0,0.07)] border-none rounded-[2.5rem] bg-white overflow-hidden">
        <div className="h-2 bg-emerald-500 w-full" /> {/* Accent Bar */}
        <CardHeader className="pt-10 px-8 pb-6">
          <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6">
            <ShieldCheck className="text-emerald-600 w-8 h-8" />
          </div>
          <CardTitle className="text-3xl font-black text-slate-900 tracking-tight">Welcome Back</CardTitle>
          <CardDescription className="text-slate-500 font-medium">Enter your credentials to access GreenScale.</CardDescription>
        </CardHeader>
        
        <CardContent className="px-8 pb-10">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div className="space-y-2">
              <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Work Email</Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input 
                  type="email" 
                  placeholder="name@company.com" 
                  className="h-14 pl-12 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all font-semibold"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Security Key</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input 
                  type={showPassword ? "text" : "password"} 
                  className="h-14 pl-12 pr-12 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all font-semibold"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 group"
              disabled={isLoading}
            >
              {isLoading ? "Verifying..." : "Sign In to Portal"}
              {!isLoading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
            </Button>
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-sm font-medium text-slate-500">
              New to GreenScale? <Link to="/register" className="text-emerald-600 font-bold hover:underline">Create Account</Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}