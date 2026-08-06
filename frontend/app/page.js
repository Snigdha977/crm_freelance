"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "../../lib/api";

const STAGES = ["lead", "contacted", "proposal", "won", "lost"];
const STAGE_LABELS = {
  lead: "Lead",
  contacted: "Contacted",
  proposal: "Proposal",
  won: "Won",
  lost: "Lost",
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [contactForm, setContactForm] = useState({ name: "", email: "", company: "" });
  const [dealForm, setDealForm] = useState({ title: "", value: "", contactId: "" });

  async function loadAll() {
    try {
      const [me, contactsRes, dealsRes] = await Promise.all([api.me(), api.listContacts(), api.listDeals()]);
      setUser(me.user);
      setContacts(contactsRes.contacts);
      setDeals(dealsRes.deals);
    } catch (err) {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function handleAddContact(e) {
    e.preventDefault();
    setError("");
    try {
      const { contact } = await api.createContact(contactForm);
      setContacts([contact, ...contacts]);
      setContactForm({ name: "", email: "", company: "" });
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleAddDeal(e) {
    e.preventDefault();
    setError("");
    try {
      const { deal } = await api.createDeal({
        ...dealForm,
        value: dealForm.value ? Number(dealForm.value) : 0,
        contactId: dealForm.contactId || null,
      });
      setDeals([deal, ...deals]);
      setDealForm({ title: "", value: "", contactId: "" });
    } catch (err) {
      setError(err.message);
    }
  }

  async function moveDeal(id, stage) {
    const { deal } = await api.updateDeal(id, { stage });
    setDeals(deals.map((d) => (d.id === id ? deal : d)));
  }

  async function removeContact(id) {
    await api.deleteContact(id);
    setContacts(contacts.filter((c) => c.id !== id));
  }

  async function removeDeal(id) {
    await api.deleteDeal(id);
    setDeals(deals.filter((d) => d.id !== id));
  }

  async function handleLogout() {
    await api.logout();
    router.push("/");
  }

  if (loading) {
    return <main className="flex min-h-screen items-center justify-center bg-paper text-ink/60">Loading your ledger…</main>;
  }

  return (
    <main className="min-h-screen bg-paper">
      <header className="flex items-center justify-between border-b border-ink/10 px-6 py-4">
        <Link href="/" className="font-display text-xl text-ink">Ledger</Link>
        <div className="flex items-center gap-4 text-sm text-ink/70">
          <span className="rounded-full bg-ink/5 px-3 py-1 font-mono uppercase tracking-wide">
            {user?.plan === "pro" ? "Pro plan" : "Free plan"}
          </span>
          <Link href="/dashboard/billing" className="hover:text-ink">Billing</Link>
          <button onClick={handleLogout} className="hover:text-ink">Log out</button>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-10">
        {error && <p className="mb-6 rounded-lg bg-rose/10 px-4 py-3 text-sm text-rose">{error}</p>}

        <section className="mb-12">
          <h2 className="font-display text-2xl text-ink">Contacts</h2>
          <form onSubmit={handleAddContact} className="mt-4 flex flex-wrap gap-3">
            <input
              placeholder="Name"
              required
              value={contactForm.name}
              onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
              className="rounded-lg border border-ink/20 bg-white px-3 py-2 text-sm outline-none focus:border-brass"
            />
            <input
              placeholder="Email"
              value={contactForm.email}
              onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
              className="rounded-lg border border-ink/20 bg-white px-3 py-2 text-sm outline-none focus:border-brass"
            />
            <input
              placeholder="Company"
              value={contactForm.company}
              onChange={(e) => setContactForm({ ...contactForm, company: e.target.value })}
              className="rounded-lg border border-ink/20 bg-white px-3 py-2 text-sm outline-none focus:border-brass"
            />
            <button type="submit" className="rounded-lg bg-ink px-4 py-2 text-sm font-medium text-paper hover:bg-ink/90">
              Add contact
            </button>
          </form>

          <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">
            {contacts.map((c) => (
              <div key={c.id} className="card-index rounded-xl bg-white p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-display text-lg text-ink">{c.name}</p>
                    {c.company && <p className="text-xs text-ink/50">{c.company}</p>}
                    {c.email && <p className="mt-1 font-mono text-xs text-ink/60">{c.email}</p>}
                  </div>
                  <button onClick={() => removeContact(c.id)} className="text-xs text-ink/40 hover:text-rose">
                    Remove
                  </button>
                </div>
              </div>
            ))}
            {contacts.length === 0 && <p className="text-sm text-ink/50">No contacts yet — add your first one above.</p>}
          </div>
        </section>

        <section>
          <h2 className="font-display text-2xl text-ink">Pipeline</h2>
          <form onSubmit={handleAddDeal} className="mt-4 flex flex-wrap gap-3">
            <input
              placeholder="Deal title"
              required
              value={dealForm.title}
              onChange={(e) => setDealForm({ ...dealForm, title: e.target.value })}
              className="rounded-lg border border-ink/20 bg-white px-3 py-2 text-sm outline-none focus:border-brass"
            />
            <input
              placeholder="Value ($)"
              type="number"
              value={dealForm.value}
              onChange={(e) => setDealForm({ ...dealForm, value: e.target.value })}
              className="w-28 rounded-lg border border-ink/20 bg-white px-3 py-2 text-sm outline-none focus:border-brass"
            />
            <select
              value={dealForm.contactId}
              onChange={(e) => setDealForm({ ...dealForm, contactId: e.target.value })}
              className="rounded-lg border border-ink/20 bg-white px-3 py-2 text-sm outline-none focus:border-brass"
            >
              <option value="">No contact</option>
              {contacts.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <button type="submit" className="rounded-lg bg-ink px-4 py-2 text-sm font-medium text-paper hover:bg-ink/90">
              Add deal
            </button>
          </form>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-5">
            {STAGES.map((stage) => (
              <div key={stage} className="rounded-xl bg-ink/5 p-3">
                <p className="mb-3 font-mono text-xs uppercase tracking-wide text-ink/50">{STAGE_LABELS[stage]}</p>
                <div className="space-y-2">
                  {deals.filter((d) => d.stage === stage).map((d) => (
                    <div key={d.id} className="card-index rounded-lg bg-white p-3">
                      <p className="text-sm font-medium text-ink">{d.title}</p>
                      {d.value > 0 && <p className="font-mono text-xs text-sage">${d.value.toLocaleString()}</p>}
                      {d.contact && <p className="text-xs text-ink/50">{d.contact.name}</p>}
                      <div className="mt-2 flex items-center justify-between">
                        <select
                          value={d.stage}
                          onChange={(e) => moveDeal(d.id, e.target.value)}
                          className="rounded border border-ink/10 bg-paper px-1.5 py-1 text-xs"
                        >
                          {STAGES.map((s) => (
                            <option key={s} value={s}>{STAGE_LABELS[s]}</option>
                          ))}
                        </select>
                        <button onClick={() => removeDeal(d.id)} className="text-xs text-ink/40 hover:text-rose">
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
