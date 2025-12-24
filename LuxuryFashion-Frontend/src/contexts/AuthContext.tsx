import { createContext, useContext, useEffect, useState } from "react";
import { fetchProfile, login, register, setTokens, clearTokens, refresh } from "@/lib/api";

interface AuthContextType {
  user: any;
  loading: boolean;
  loginUser: (email: string, password: string, remember?: boolean) => Promise<void>;
  registerUser: (name: string, email: string, password: string, remember?: boolean) => Promise<void>;
  logout: () => void;
  setUser: (u: any) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const profile = await fetchProfile();
        setUser(profile);
      } catch {
        // try refresh
        try {
          const res = await refresh();
          setTokens(res.accessToken, res.refreshToken);
          const profile = await fetchProfile();
          setUser(profile);
        } catch {
          clearTokens();
        }
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, []);

  const loginUser = async (email: string, password: string, remember: boolean = true) => {
    const res = await login({ email, password });
    setTokens(res.accessToken, res.refreshToken, remember);
    setUser(res.user);
  };

  const registerUser = async (name: string, email: string, password: string, remember: boolean = true) => {
    const res = await register({ name, email, password });
    setTokens(res.accessToken, res.refreshToken, remember);
    setUser(res.user);
  };

  const logout = () => {
    clearTokens();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginUser, registerUser, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}


