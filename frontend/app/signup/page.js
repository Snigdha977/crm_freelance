"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { api } from "../../lib/api";

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupForm />
    </Suspense>
  );
}

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const wantsPro = searchParams.get("plan") === "pro";

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.signup(form);
      if (wantsPro) {
        const { url } = await api.createCheckout();
        window.location.href = url;
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-6">
      <div className="w-full max-w-sm">
        <Link href="/" className="font-display text-xl text-ink">Ledger</Link>
        <h1 className="mt-6 font-display text-2xl text-ink">Create your account</h1>
        <p className="mt-1 text-sm text-ink/60">
          {wantsPro ? "You'll be taken to checkout right after this." : "Starts on the free plan — upgrade anytime."}
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="block text-sm text-ink/70">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1 w-full rounded-lg border border-ink/20 bg-white px-4 py-2.5 text-ink outline-none focus:border-brass"
            />
          </div>
          <div>
            <label className="block text-sm text-ink/70">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="mt-1 w-full rounded-lg border border-ink/20 bg-white px-4 py-2.5 text-ink outline-none focus:border-brass"
            />
          </div>
          <div>
            <label className="block text-sm text-ink/70">Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="mt-1 w-full rounded-lg border border-ink/20 bg-white px-4 py-2.5 text-ink outline-none focus:border-brass"
            />
            <p className="mt-1 text-xs text-ink/40">At least 8 characters.</p>
          </div>

          {error && <p className="text-sm text-rose">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-ink py-3 font-medium text-paper transition hover:bg-ink/90 disabled:opacity-60"
          >
            {loading ? "Creating account…" : wantsPro ? "Create account & continue to payment" : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink/60">
          Already have an account? <Link href="/login" className="text-brass hover:underline">Log in</Link>
        </p>
      </div>
    </main>
  );
}
