import { useState, type FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Vault } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getApiErrorMessage } from "@/api/client";
import { Button } from "@/components/ui/Button";
import { Field, inputClass } from "@/components/ui/Field";
import { ErrorBanner } from "@/components/ui/ErrorBanner";

export function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (user) {
    const from = (location.state as { from?: Location })?.from?.pathname ?? "/";
    return <Navigate to={from} replace />;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, "Couldn't sign you in. Check your email and password."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-950 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brass text-navy-950">
            <Vault size={22} strokeWidth={2.25} />
          </div>
          <div>
            <h1 className="font-display text-xl font-semibold text-white">EnterpriseIQ</h1>
            <p className="mt-1 text-sm text-white/45">Sign in to search and ask your org's documents.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-white/10 bg-white p-6 shadow-panel">
          {error && <ErrorBanner message={error} />}
          <Field label="Work email" htmlFor="email">
            <input
              id="email"
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              placeholder="you@company.com"
            />
          </Field>
          <Field label="Password" htmlFor="password">
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              placeholder="••••••••"
            />
          </Field>
          <Button type="submit" className="w-full" loading={loading}>
            Sign in
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-white/45">
          New here?{" "}
          <Link to="/register" className="font-medium text-brass-light hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
