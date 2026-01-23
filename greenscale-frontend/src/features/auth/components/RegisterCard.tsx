import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authService } from "../services/authService"
import { Building2, Mail, Lock, UserPlus, ArrowLeft } from "lucide-react"

export function RegistrationForm() {
  const [formData, setFormData] = useState({ business_name: "", email: "", password: "" })
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await authService.register(formData)
      alert("Success! You can now log in.")
      navigate("/login")
    } catch (error: any) {
      alert("Registration Error: " + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 px-4">
      <Card className="w-full max-w-[450px] shadow-[0_20px_60px_rgba(0,0,0,0.07)] border-none rounded-[2.5rem] bg-white overflow-hidden">
        <div className="h-2 bg-blue-600 w-full" />
        <CardHeader className="pt-10 px-10 pb-6">
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
            <UserPlus className="text-blue-600 w-7 h-7" />
          </div>
          <CardTitle className="text-3xl font-black text-slate-900 tracking-tight">Join GreenScale</CardTitle>
          <CardDescription className="text-slate-500 font-medium">Set up your sustainability dashboard today.</CardDescription>
        </CardHeader>
        
        <CardContent className="px-10 pb-12">
          <form className="space-y-5" onSubmit={handleRegister}>
            <div className="space-y-2">
              <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Business Name</Label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input 
                  placeholder="e.g. Global Tech Inc" 
                  className="h-14 pl-12 rounded-2xl border-slate-100 bg-slate-50 transition-all font-semibold"
                  onChange={(e) => setFormData({...formData, business_name: e.target.value})}
                  required 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Official Email</Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input 
                  type="email" 
                  placeholder="admin@business.com" 
                  className="h-14 pl-12 rounded-2xl border-slate-100 bg-slate-50 transition-all font-semibold"
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Password</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input 
                  type="password" 
                  className="h-14 pl-12 rounded-2xl border-slate-100 bg-slate-50 transition-all font-semibold"
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required 
                />
              </div>
            </div>

            <Button type="submit" className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xl transition-all active:scale-95" disabled={isLoading}>
              {isLoading ? "Creating Account..." : "Register Business"}
            </Button>
          </form>

          <div className="mt-8 flex items-center justify-center">
            <Link to="/login" className="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-2">
              <ArrowLeft size={16} /> Back to Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}