# Ledger — CRM for Solopreneurs

A full-stack SaaS CRM built for one-person businesses: track contacts and deals through a simple pipeline, with real authentication, persistent per-user data, and Stripe-powered subscriptions.

## Live

- **App:** https://crm-freelance-snigdha977s-projects.vercel.app
- **API:** https://crm-freelance.onrender.com

## Tech Stack

**Frontend** — Next.js 14 (App Router), React, Tailwind CSS — deployed on Vercel
**Backend** — Node.js, Express, Prisma ORM, SQLite, JWT auth, Stripe — deployed on Render

## Features

- Landing page with a two-tier pricing table (Starter / Pro)
- Email + password signup/login with persistent sessions
- Contacts and a 5-stage deal pipeline (lead → contacted → proposal → won/lost), saved per user
- Free plan capped at 10 contacts; Pro unlocks unlimited — enforced server-side
- Stripe Checkout (test mode) with webhook-confirmed subscription upgrades
- Billing page to view current plan and cancel

## Test the payment flow

Use Stripe's test card: `4242 4242 4242 4242`, any future expiry, any CVC.

## Local development

**Backend**
\`\`\`bash
cd backend
cp .env.example .env   # add your own Stripe test keys
npm install
npx prisma db push
npm run dev              # http://localhost:4000
\`\`\`

**Frontend**
\`\`\`bash
cd frontend
cp .env.example .env.local
npm install
npm run dev               # http://localhost:3000
\`\`\`
