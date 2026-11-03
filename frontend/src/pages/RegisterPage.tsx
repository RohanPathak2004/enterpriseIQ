import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Vault } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getApiErrorMessage } from "@/api/client";
import { Button } from "@/components/ui/Button";
import { Field, inputClass } from "@/components/ui/Field";
import { ErrorBanner } from "@/components/ui/ErrorBanner";

export function RegisterPage() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/" replace />;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register(name, email, password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, "Couldn't create your account."));
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
            <h1 className="font-display text-xl font-semibold text-white">Create your account</h1>
            <p className="mt-1 text-sm text-white/45">
              New accounts start as Employees. An admin can promote you later.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-white/10 bg-white p-6 shadow-panel">
          {error && <ErrorBanner message={error} />}
          <Field label="Full name" htmlFor="name">
            <input
              id="name"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
              placeholder="Jordan Rivera"
            />
          </Field>
          <Field label="Work email" htmlFor="email">
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              placeholder="you@company.com"
            />
          </Field>
          <Field label="Password" htmlFor="password" hint="At least 8 characters.">
            <input
              id="password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              placeholder="••••••••"
            />
          </Field>
          <Button type="submit" className="w-full" loading={loading}>
            Create account
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-white/45">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-brass-light hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
