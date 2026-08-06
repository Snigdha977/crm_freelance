const express = require("express");
const prisma = require("../lib/prisma");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

// List contacts for the logged-in user
router.get("/", async (req, res) => {
  const contacts = await prisma.contact.findMany({
    where: { userId: req.userId },
    orderBy: { createdAt: "desc" },
    include: { deals: true },
  });
  res.json({ contacts });
});

const FREE_CONTACT_LIMIT = 10;

// Create a contact
router.post("/", async (req, res) => {
  const { name, email, phone, company, notes } = req.body || {};
  if (!name) return res.status(400).json({ error: "Name is required." });

  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  if (user.plan === "free") {
    const count = await prisma.contact.count({ where: { userId: req.userId } });
    if (count >= FREE_CONTACT_LIMIT) {
      return res.status(403).json({
        error: `Free plan is limited to ${FREE_CONTACT_LIMIT} contacts. Upgrade to Pro for unlimited contacts.`,
        code: "PLAN_LIMIT",
      });
    }
  }

  const contact = await prisma.contact.create({
    data: { name, email, phone, company, notes, userId: req.userId },
  });
  res.status(201).json({ contact });
});

// Update a contact
router.put("/:id", async (req, res) => {
  const existing = await prisma.contact.findFirst({
    where: { id: req.params.id, userId: req.userId },
  });
  if (!existing) return res.status(404).json({ error: "Contact not found." });

  const { name, email, phone, company, notes } = req.body || {};
  const contact = await prisma.contact.update({
    where: { id: req.params.id },
    data: { name, email, phone, company, notes },
  });
  res.json({ contact });
});

// Delete a contact
router.delete("/:id", async (req, res) => {
  const existing = await prisma.contact.findFirst({
    where: { id: req.params.id, userId: req.userId },
  });
  if (!existing) return res.status(404).json({ error: "Contact not found." });

  await prisma.contact.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

module.exports = router;
