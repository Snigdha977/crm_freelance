import Link from "next/link";

function IndexCardStack() {
  return (
    <svg viewBox="0 0 360 260" className="w-full max-w-md" aria-hidden="true">
      <rect x="40" y="60" width="260" height="150" rx="6" fill="#EDE6D6" stroke="#1C2541" strokeOpacity="0.15" transform="rotate(-4 170 135)" />
      <rect x="30" y="45" width="260" height="150" rx="6" fill="#F6F2E9" stroke="#1C2541" strokeOpacity="0.2" transform="rotate(2 160 120)" />
      <rect x="35" y="30" width="260" height="150" rx="6" fill="#FFFDF8" stroke="#1C2541" strokeOpacity="0.3" />
      <line x1="55" y1="60" x2="290" y2="60" stroke="#A9773D" strokeWidth="2" />
      <text x="55" y="90" fontFamily="var(--font-fraunces)" fontSize="18" fill="#1C2541">Priya Shah</text>
      <text x="55" y="112" fontFamily="var(--font-mono)" fontSize="12" fill="#5C7A63">Proposal sent — $4,200</text>
      <text x="55" y="132" fontFamily="var(--font-mono)" fontSize="12" fill="#1C2541" opacity="0.6">priya@northlightstudio.co</text>
      <circle cx="270" cy="45" r="6" fill="#A9773D" />
    </svg>
  );
}

const features = [
  { title: "Contacts, not columns", body: "Every person you work with gets a real card: notes, history, deals attached — not a spreadsheet row that loses context." },
  { title: "A pipeline you can see", body: "Move deals from lead to won across five stages. No CRM theory, just where things actually stand." },
  { title: "Nothing resets on refresh", body: "Every contact, deal, and note is saved to your account the moment you make it." },
];

const plans = [
  {
    name: "Starter",
    price: "$0",
    period: "forever",
    description: "For getting your first contacts and deals organized.",
    features: ["Up to 10 contacts", "Unlimited deals & pipeline stages", "1 user"],
    cta: "Start free",
    href: "/signup",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$12",
    period: "/month",
    description: "For solopreneurs whose contact list outgrew a spreadsheet.",
    features: ["Unlimited contacts", "Unlimited deals & pipeline stages", "Priority support"],
    cta: "Start with Pro",
    href: "/signup?plan=pro",
    highlight: true,
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-paper">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <span className="font-display text-xl font-medium text-ink">Ledger</span>
        <nav className="flex items-center gap-6 text-sm text-ink/80">
          <a href="#pricing" className="hover:text-ink">Pricing</a>
          <Link href="/login" className="hover:text-ink">Log in</Link>
          <Link href="/signup" className="rounded-full bg-ink px-4 py-2 text-paper transition hover:bg-ink/90">
            Get started
          </Link>
        </nav>
      </header>

      <section className="ledger-lines mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 py-16 md:grid-cols-2 md:py-24">
        <div>
          <p className="mb-4 font-mono text-sm uppercase tracking-widest text-brass">For people who work alone</p>
          <h1 className="font-display text-4xl leading-tight text-ink md:text-5xl">
            Every client. Every deal.<br />One quiet ledger.
          </h1>
          <p className="mt-6 max-w-md text-lg text-ink/70">
            Ledger is the CRM for solopreneurs who need to remember who they're talking to and where each deal
            stands — without learning a platform built for a sales team of forty.
          </p>
          <div className="mt-8 flex items-center gap-4">
            <Link href="/signup?plan=pro" className="rounded-full bg-brass px-6 py-3 font-medium text-paper transition hover:bg-brass/90">
              Start free trial
            </Link>
            <a href="#pricing" className="font-medium text-ink/70 hover:text-ink">See pricing →</a>
          </div>
        </div>
        <div className="flex justify-center">
          <IndexCardStack />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="rounded-2xl border border-ink/10 bg-white/60 p-6">
              <h3 className="font-display text-lg text-ink">{f.title}</h3>
              <p className="mt-2 text-sm text-ink/70">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-10 text-center">
          <h2 className="font-display text-3xl text-ink">Simple pricing, no seats math</h2>
          <p className="mt-2 text-ink/60">Start free. Upgrade the day your contact list needs room to grow.</p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`card-index rounded-2xl border p-8 ${
                plan.highlight ? "border-brass bg-ink text-paper" : "border-ink/10 bg-white/70 text-ink"
              }`}
            >
              <h3 className="font-display text-2xl">{plan.name}</h3>
              <p className={`mt-1 text-sm ${plan.highlight ? "text-paper/70" : "text-ink/60"}`}>{plan.description}</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="font-display text-4xl">{plan.price}</span>
                <span className={`text-sm ${plan.highlight ? "text-paper/60" : "text-ink/50"}`}>{plan.period}</span>
              </div>
              <ul className="mt-6 space-y-2 text-sm">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <span className={plan.highlight ? "text-brass" : "text-sage"}>—</span> {f}
                  </li>
                ))}
              </ul>
              <Link
                href={plan.href}
                className={`mt-8 block rounded-full px-6 py-3 text-center font-medium transition ${
                  plan.highlight ? "bg-brass text-paper hover:bg-brass/90" : "bg-ink text-paper hover:bg-ink/90"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-ink/10 py-8 text-center text-sm text-ink/50">
        Ledger — built for one-person businesses.
      </footer>
    </main>
  );
}
