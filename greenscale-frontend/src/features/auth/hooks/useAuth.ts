import { useState } from "react";
import { User } from "../types";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async () => {
    setIsLoading(true);
    // We will add the actual logic here later
    setTimeout(() => {
      setIsLoading(false);
      setUser(null);
    }, 1000); 
  };

  return { user, isLoading, login };
}