import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { setTokens, fetchProfile } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

const AuthCallback = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { setUser } = useAuth();

  useEffect(() => {
    (async () => {
      const accessToken = params.get("accessToken");
      const refreshToken = params.get("refreshToken");
      if (!accessToken) {
        
        navigate("/auth");
        return;
      }
      setTokens(accessToken, refreshToken || undefined);
      try {
        const profile = await fetchProfile();
        setUser(profile);
        
        navigate("/");
      } catch (err: any) {
        
        navigate("/auth");
      }
    })();
  }, [params, navigate, setUser]);

  return (
    <main className="container mx-auto px-4 py-16 text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
      <p className="mt-4 text-muted-foreground">Finalizing sign-in...</p>
    </main>
  );
};

export default AuthCallback;

