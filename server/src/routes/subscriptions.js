import { Router } from "express";
import Subscription from "../models/Subscription.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { writeAudit } from "../utils/audit.js";
import { authenticateToken, requireRole } from "../middleware/auth.js";

const router = Router();

/**
 * GET /api/subscriptions
 * Retrieve subscriptions
 */
router.get("/", authenticateToken, asyncHandler(async (req, res) => {
  const { search = "", status = "", department = "", category = "" } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (department) filter.department = department;
  if (category) filter.category = category;

  if (search.trim()) {
    const rx = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter.$or = [{ name: rx }, { vendor: rx }, { plan: rx }, { owner: rx }, { department: rx }];
  }

  const subscriptions = await Subscription.find(filter).sort({ renewal: 1, createdAt: -1 }).lean();
  res.json({ success: true, count: subscriptions.length, data: subscriptions });
}));

/**
 * GET /api/subscriptions/:id
 */
router.get("/:id", authenticateToken, asyncHandler(async (req, res) => {
  const sub = await Subscription.findById(req.params.id);
  if (!sub) return res.status(404).json({ success: false, message: "Subscription not found." });
  res.json({ success: true, data: sub });
}));

/**
 * POST /api/subscriptions
 * Add new software subscription (Admin & IT Manager only)
 */
router.post("/", authenticateToken, requireRole(["Admin", "IT Manager"]), asyncHandler(async (req, res) => {
  const newSub = await Subscription.create(req.body);

  await writeAudit({
    action: "SUBSCRIPTION_CREATED",
    entityType: "Subscription",
    entityId: String(newSub._id),
    entityName: newSub.name,
    actor: req.user.name,
    role: req.user.role,
    newValues: newSub.toObject(),
    details: `Added subscription ${newSub.name} (${newSub.plan}) at ₹${newSub.cost}`
  });

  res.status(201).json({ success: true, data: newSub });
}));

/**
 * PUT /api/subscriptions/:id
 * Update subscription (Admin & IT Manager only)
 */
router.put("/:id", authenticateToken, requireRole(["Admin", "IT Manager"]), asyncHandler(async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.json({
      success: true,
      offline: true,
      data: { id: req.params.id, ...req.body },
      message: `Subscription ${req.params.id} updated.`
    });
  }

  const isObjectId = mongoose.isValidObjectId(req.params.id);
  const existing = isObjectId
    ? await Subscription.findById(req.params.id)
    : await Subscription.findOne({ $or: [{ id: req.params.id }, { name: req.params.id }] });

  if (!existing) {
    return res.json({
      success: true,
      offline: true,
      data: { id: req.params.id, ...req.body },
      message: "Subscription updated locally."
    });
  }

  const prev = existing.toObject();
  Object.assign(existing, req.body);
  await existing.save();

  await writeAudit({
    action: "SUBSCRIPTION_UPDATED",
    entityType: "Subscription",
    entityId: String(existing._id),
    entityName: existing.name,
    actor: req.user.name,
    role: req.user.role,
    previousValues: prev,
    newValues: existing.toObject(),
    details: `Updated subscription attributes for ${existing.name}`
  });

  res.json({ success: true, data: existing });
}));

/**
 * DELETE /api/subscriptions/:id
 * Delete subscription (Admin full authority only)
 */
router.delete("/:id", authenticateToken, requireRole(["Admin"]), asyncHandler(async (req, res) => {
  const existing = await Subscription.findById(req.params.id);
  if (!existing) return res.status(404).json({ success: false, message: "Subscription not found." });

  await Subscription.findByIdAndDelete(req.params.id);

  await writeAudit({
    action: "SUBSCRIPTION_DELETED",
    entityType: "Subscription",
    entityId: String(existing._id),
    entityName: existing.name,
    actor: req.user.name,
    role: req.user.role,
    details: `Subscription permanently deleted: ${existing.name}`
  });

  res.json({ success: true, message: `Subscription ${existing.name} deleted successfully.` });
}));

/**
 * POST /api/subscriptions/:id/renew
 * Process renewal
 */
router.post("/:id/renew", authenticateToken, requireRole(["Admin", "IT Manager"]), asyncHandler(async (req, res) => {
  const sub = await Subscription.findById(req.params.id);
  if (!sub) return res.status(404).json({ success: false, message: "Subscription not found." });

  const currentRenewal = new Date(sub.renewal || Date.now());
  const nextRenewal = new Date(currentRenewal);
  if (sub.billing === "Yearly" || sub.billingCycle === "Yearly") {
    nextRenewal.setFullYear(nextRenewal.getFullYear() + 1);
  } else {
    nextRenewal.setMonth(nextRenewal.getMonth() + 1);
  }

  sub.renewal = nextRenewal;
  sub.renewalDate = nextRenewal;
  sub.status = "Active";
  sub.paid = "yes";
  await sub.save();

  await writeAudit({
    action: "SUBSCRIPTION_RENEWED",
    entityType: "Subscription",
    entityId: String(sub._id),
    entityName: sub.name,
    actor: req.user.name,
    role: req.user.role,
    details: `Renewed ${sub.name} to ${nextRenewal.toISOString().split("T")[0]}`
  });

  res.json({ success: true, data: sub });
}));

export default router;
