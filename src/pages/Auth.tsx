import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Mail, Lock, ArrowRight } from "lucide-react";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (forgotMode) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast.success("Check your email for a reset link");
        setForgotMode(false);
        return;
      }

      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate("/");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast.success("Check your email to confirm your account");
      }
    } catch (err: any) {
      toast.error(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-page-x">
      <div className="w-full max-w-sm">
        <h1 className="text-page-title tracking-tight text-center mb-2">Unscreenshot</h1>
        <p className="text-label text-muted-foreground text-center mb-8">
          {forgotMode ? "Enter your email to reset your password" : isLogin ? "Sign in to your account" : "Create your account"}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-10 pr-3 py-2.5 rounded-btn border border-border bg-card text-[15px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          {!forgotMode && (
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full pl-10 pr-3 py-2.5 rounded-btn border border-border bg-card text-[15px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-btn text-[15px] font-medium hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ArrowRight className="w-4 h-4" />
            )}
            {forgotMode ? "Send Reset Link" : isLogin ? "Sign In" : "Sign Up"}
          </button>
        </form>

        {isLogin && !forgotMode && (
          <p className="text-label text-muted-foreground text-center mt-4">
            <button
              onClick={() => setForgotMode(true)}
              className="text-primary hover:underline font-medium"
            >
              Forgot password?
            </button>
          </p>
        )}

        <p className="text-label text-muted-foreground text-center mt-4">
          {forgotMode ? "Remember your password?" : isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={() => { setForgotMode(false); if (forgotMode) setIsLogin(true); else setIsLogin(!isLogin); }}
            className="text-primary hover:underline font-medium"
          >
            {forgotMode ? "Sign in" : isLogin ? "Sign up" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}
