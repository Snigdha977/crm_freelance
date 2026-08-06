const express = require("express");
const prisma = require("../lib/prisma");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

const STAGES = ["lead", "contacted", "proposal", "won", "lost"];

// List deals for the logged-in user
router.get("/", async (req, res) => {
  const deals = await prisma.deal.findMany({
    where: { userId: req.userId },
    orderBy: { createdAt: "desc" },
    include: { contact: true },
  });
  res.json({ deals, stages: STAGES });
});

// Create a deal
router.post("/", async (req, res) => {
  const { title, value, stage, notes, contactId } = req.body || {};
  if (!title) return res.status(400).json({ error: "Title is required." });
  if (stage && !STAGES.includes(stage)) {
    return res.status(400).json({ error: `Stage must be one of: ${STAGES.join(", ")}` });
  }

  const deal = await prisma.deal.create({
    data: {
      title,
      value: value ? Number(value) : 0,
      stage: stage || "lead",
      notes,
      contactId: contactId || null,
      userId: req.userId,
    },
  });
  res.status(201).json({ deal });
});

// Update a deal (e.g. moving between pipeline stages)
router.put("/:id", async (req, res) => {
  const existing = await prisma.deal.findFirst({
    where: { id: req.params.id, userId: req.userId },
  });
  if (!existing) return res.status(404).json({ error: "Deal not found." });

  const { title, value, stage, notes, contactId } = req.body || {};
  if (stage && !STAGES.includes(stage)) {
    return res.status(400).json({ error: `Stage must be one of: ${STAGES.join(", ")}` });
  }

  const deal = await prisma.deal.update({
    where: { id: req.params.id },
    data: {
      ...(title !== undefined && { title }),
      ...(value !== undefined && { value: Number(value) }),
      ...(stage !== undefined && { stage }),
      ...(notes !== undefined && { notes }),
      ...(contactId !== undefined && { contactId: contactId || null }),
    },
  });
  res.json({ deal });
});

// Delete a deal
router.delete("/:id", async (req, res) => {
  const existing = await prisma.deal.findFirst({
    where: { id: req.params.id, userId: req.userId },
  });
  if (!existing) return res.status(404).json({ error: "Deal not found." });

  await prisma.deal.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

module.exports = router;
