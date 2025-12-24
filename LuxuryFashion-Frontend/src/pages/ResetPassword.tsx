import { useState } from "react";
import { resetPassword, forgotPassword } from "@/lib/api";
import { Link, useNavigate } from "react-router-dom";

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [resending, setResending] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await resetPassword(email, otp, password);
      
      navigate("/auth");
    } catch (err: any) {
      
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email.trim()) {
      
      return;
    }
    if (timer > 0) return;
    setResending(true);
    try {
      await forgotPassword(email);
      
      setTimer(60);
      const interval = setInterval(() => {
        setTimer((t) => {
          if (t <= 1) {
            clearInterval(interval);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    } catch (err: any) {
      
    } finally {
      setResending(false);
    }
  };

  return (
    <main className="container mx-auto px-4 py-10 max-w-xl">
      <div className="bg-card rounded-2xl border border-border p-6 md:p-8 shadow-lg">
        <h1 className="text-2xl font-display font-bold text-foreground mb-4">Reset Password</h1>
        <p className="text-muted-foreground mb-6">Enter the OTP sent to your email.</p>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <input
            type="text"
            placeholder="OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <input
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 rounded-xl disabled:opacity-50"
          >
            {loading ? "Updating..." : "Reset Password"}
          </button>
        </form>
        <button
          onClick={handleResend}
          disabled={resending}
          className="mt-3 w-full text-sm underline text-primary disabled:opacity-50"
        >
          {resending ? "Resending..." : timer > 0 ? `Resend in ${timer}s` : "Resend OTP"}
        </button>
        <p className="text-sm text-muted-foreground text-center mt-4">
          Back to <Link to="/auth" className="underline">login</Link>
        </p>
      </div>
    </main>
  );
};

export default ResetPassword;

