"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { api } from "../../../lib/api";

export default function BillingPage() {
  return (
    <Suspense fallback={null}>
      <BillingContent />
    </Suspense>
  );
}

function BillingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const checkoutResult = searchParams.get("checkout");

  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function load() {
    try {
      const data = await api.billingStatus();
      setStatus(data);
    } catch (err) {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleUpgrade() {
    setActionLoading(true);
    try {
      const { url } = await api.createCheckout();
      window.location.href = url;
    } catch (err) {
      setMessage(err.message);
      setActionLoading(false);
    }
  }

  async function handleCancel() {
    setActionLoading(true);
    try {
      const res = await api.cancelSubscription();
      setMessage(res.message);
      load();
    } catch (err) {
      setMessage(err.message);
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return <main className="flex min-h-screen items-center justify-center bg-paper text-ink/60">Loading billing…</main>;
  }

  return (
    <main className="min-h-screen bg-paper">
      <header className="flex items-center justify-between border-b border-ink/10 px-6 py-4">
        <Link href="/dashboard" className="font-display text-xl text-ink">Ledger</Link>
        <Link href="/dashboard" className="text-sm text-ink/70 hover:text-ink">← Back to dashboard</Link>
      </header>

      <div className="mx-auto max-w-lg px-6 py-12">
        <h1 className="font-display text-2xl text-ink">Billing & plan</h1>

        {checkoutResult === "success" && (
          <p className="mt-4 rounded-lg bg-sage/10 px-4 py-3 text-sm text-sage">
            Payment received — your account will reflect Pro once the webhook confirms it (usually within a few seconds).
          </p>
        )}
        {checkoutResult === "cancelled" && (
          <p className="mt-4 rounded-lg bg-ink/5 px-4 py-3 text-sm text-ink/60">Checkout was cancelled — no charge was made.</p>
        )}

        <div className="card-index mt-6 rounded-xl bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-ink/40">Current plan</p>
              <p className="font-display text-2xl text-ink">{status?.plan === "pro" ? "Pro" : "Starter (Free)"}</p>
            </div>
            <span className="rounded-full bg-ink/5 px-3 py-1 font-mono text-xs text-ink/60">
              {status?.subscriptionStatus || "no subscription"}
            </span>
          </div>

          {status?.currentPeriodEnd && (
            <p className="mt-3 text-sm text-ink/60">
              Renews on {new Date(status.currentPeriodEnd).toLocaleDateString()}
            </p>
          )}

          {message && <p className="mt-4 text-sm text-brass">{message}</p>}

          <div className="mt-6">
            {status?.plan === "pro" ? (
              <button
                onClick={handleCancel}
                disabled={actionLoading}
                className="rounded-full border border-ink/20 px-5 py-2.5 text-sm font-medium text-ink hover:bg-ink/5 disabled:opacity-60"
              >
                {actionLoading ? "Processing…" : "Cancel subscription"}
              </button>
            ) : (
              <button
                onClick={handleUpgrade}
                disabled={actionLoading}
                className="rounded-full bg-brass px-5 py-2.5 text-sm font-medium text-paper hover:bg-brass/90 disabled:opacity-60"
              >
                {actionLoading ? "Redirecting…" : "Upgrade to Pro — $12/month"}
              </button>
            )}
          </div>
        </div>

        <p className="mt-4 text-xs text-ink/40">
          Test mode — use card 4242 4242 4242 4242, any future expiry, any CVC.
        </p>
      </div>
    </main>
  );
}
