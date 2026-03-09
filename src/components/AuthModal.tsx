/**
 * AuthModal — Login / signup modal with mock auth.
 * Demo credentials listed in the modal for convenience.
 */

import { useState } from "react";
import { X, Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApp } from "@/contexts/AppContext";

export default function AuthModal() {
  const { authModalOpen, dispatch, login } = useApp();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!authModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600)); // simulate network
    if (mode === "login") {
      const result = login(email, password);
      if (!result.success) setError(result.message);
    } else {
      // Mock signup — auto-login as customer
      login("alex@example.com", "any");
    }
    setLoading(false);
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm animate-fade-in"
        onClick={() => dispatch({ type: "TOGGLE_AUTH_MODAL", payload: false })}
      />
      <div className="fixed z-50 inset-0 flex items-center justify-center p-4">
        <div className="bg-surface rounded-2xl shadow-lg w-full max-w-md p-6 animate-bounce-in">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-2xl font-bold">
              {mode === "login" ? "Welcome back" : "Create account"}
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => dispatch({ type: "TOGGLE_AUTH_MODAL", payload: false })}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Demo hint */}
          <div className="bg-info/10 border border-info/20 rounded-xl p-3 mb-4 text-xs text-muted-foreground">
            <strong className="text-foreground">Demo accounts:</strong>
            <ul className="mt-1 space-y-0.5">
              <li>👤 Customer: <code>alex@example.com</code></li>
              <li>🛡️ Admin: <code>admin@foodiedash.com</code></li>
              <li>🍳 Vendor: <code>marco@bellanapoli.com</code></li>
              <li className="text-[10px] opacity-60">Any password works</li>
            </ul>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div className="space-y-1.5">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="name" placeholder="Your name" className="pl-9" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="email" type="email" placeholder="you@example.com" className="pl-9" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-9 pr-9"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPass((v) => !v)}
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>
            )}

            <Button
              type="submit"
              className="w-full gradient-brand text-primary-foreground border-0 shadow-brand h-11 text-base"
              disabled={loading}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin-slow" />
              ) : mode === "login" ? "Sign In" : "Create Account"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-4">
            {mode === "login" ? "Don't have an account?" : "Already have one?"}{" "}
            <button
              className="text-brand font-semibold hover:underline"
              onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }}
            >
              {mode === "login" ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </>
  );
}
