const express = require("express");
const Stripe = require("stripe");
const prisma = require("../lib/prisma");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create a Checkout Session for the Pro plan
router.post("/checkout", requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  if (!user) return res.status(404).json({ error: "Account not found." });

  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { userId: user.id },
    });
    customerId = customer.id;
    await prisma.user.update({
      where: { id: user.id },
      data: { stripeCustomerId: customerId },
    });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: process.env.STRIPE_PRO_PRICE_ID, quantity: 1 }],
    success_url: `${process.env.FRONTEND_URL}/dashboard/billing?checkout=success`,
    cancel_url: `${process.env.FRONTEND_URL}/dashboard/billing?checkout=cancelled`,
    metadata: { userId: user.id },
  });

  res.json({ url: session.url });
});

// Cancel the current subscription (at period end)
router.post("/cancel", requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  if (!user?.stripeSubscriptionId) {
    return res.status(400).json({ error: "No active subscription to cancel." });
  }

  await stripe.subscriptions.update(user.stripeSubscriptionId, {
    cancel_at_period_end: true,
  });

  res.json({ ok: true, message: "Your plan will cancel at the end of the billing period." });
});

// Current plan / billing status for the account page
router.get("/status", requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  res.json({
    plan: user.plan,
    subscriptionStatus: user.subscriptionStatus,
    currentPeriodEnd: user.currentPeriodEnd,
  });
});

// Stripe webhook — the part that actually reflects payment in our own DB.
// NOTE: mounted with express.raw() body parsing in index.js, not express.json().
async function webhookHandler(req, res) {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId = session.metadata?.userId;
        if (userId) {
          await prisma.user.update({
            where: { id: userId },
            data: {
              plan: "pro",
              stripeSubscriptionId: session.subscription,
              subscriptionStatus: "active",
            },
          });
        }
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object;
        const customerId = invoice.customer;
        const user = await prisma.user.findFirst({ where: { stripeCustomerId: customerId } });
        if (user) {
          const periodEnd = invoice.lines?.data?.[0]?.period?.end;
          await prisma.user.update({
            where: { id: user.id },
            data: {
              plan: "pro",
              subscriptionStatus: "active",
              currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : undefined,
            },
          });
        }
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object;
        const user = await prisma.user.findFirst({
          where: { stripeSubscriptionId: sub.id },
        });
        if (user) {
          const isActive = sub.status === "active" || sub.status === "trialing";
          await prisma.user.update({
            where: { id: user.id },
            data: {
              plan: isActive ? "pro" : "free",
              subscriptionStatus: sub.status,
              currentPeriodEnd: sub.current_period_end
                ? new Date(sub.current_period_end * 1000)
                : undefined,
            },
          });
        }
        break;
      }

      default:
        break; // ignore other event types
    }
  } catch (err) {
    console.error("Error handling webhook event:", err);
    return res.status(500).json({ error: "Webhook handler failed." });
  }

  res.json({ received: true });
}

module.exports = { router, webhookHandler };
