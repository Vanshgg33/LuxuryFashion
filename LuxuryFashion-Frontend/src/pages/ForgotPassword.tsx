import { useState } from "react";
import { forgotPassword } from "@/lib/api";
import { Link } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotPassword(email);
      
    } catch (err: any) {
      
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container mx-auto px-4 py-10 max-w-xl">
      <div className="bg-card rounded-2xl border border-border p-6 md:p-8 shadow-lg">
        <h1 className="text-2xl font-display font-bold text-foreground mb-4">Forgot Password</h1>
        <p className="text-muted-foreground mb-6">Enter your email to receive an OTP.</p>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 rounded-xl disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send OTP"}
          </button>
        </form>
        <p className="text-sm text-muted-foreground text-center mt-4">
          Remembered? <Link to="/auth" className="underline">Back to login</Link>
        </p>
      </div>
    </main>
  );
};

export default ForgotPassword;

