import { useState } from "react"
import { RegistrationForm } from "./RegisterCard"
import { LoginForm } from "./LoginForm" // Import the new card
import { AuthMode } from "../types"
import { Button } from "@/components/ui/button"

export function AuthScreen() {
  const [mode, setMode] = useState<AuthMode>('login')

  return (
    <div className="flex flex-col items-center justify-center space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight text-green-800">GreenScale</h1>
        <p className="text-slate-500">Global Sustainability Analytics for Small Business</p>
      </div>

      {/* Logic to toggle between Login and Register */}
      {mode === 'register' ? <RegistrationForm /> : <LoginForm />}

      <Button 
        variant="link" 
        onClick={() => setMode(mode === 'register' ? 'login' : 'register')}
        className="text-green-700 font-semibold"
      >
        {mode === 'register' ? "Already have an account? Login" : "Need an account? Register"}
      </Button>
    </div>
  )
}