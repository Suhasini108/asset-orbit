import { Router } from "express";
import mongoose from "mongoose";
import Subscription from "../models/Subscription.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { writeAudit } from "../utils/audit.js";
import { authenticateToken, requireRole } from "../middleware/auth.js";
import syncStore from "../syncStore.js";

const router = Router();

/**
 * GET /api/subscriptions
 * Retrieve subscriptions
 */
router.get("/", authenticateToken, asyncHandler(async (req, res) => {
  const { search = "", status = "", department = "", category = "" } = req.query;

  if (mongoose.connection.readyState !== 1) {
    const list = syncStore.getSubscriptions({ search, status, department, category });
    return res.json({ success: true, count: list.length, data: list });
  }

  try {
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
  } catch (err) {
    const list = syncStore.getSubscriptions({ search, status, department, category });
    res.json({ success: true, count: list.length, data: list });
  }
}));

/**
 * GET /api/subscriptions/:id
 */
router.get("/:id", authenticateToken, asyncHandler(async (req, res) => {
  const targetId = req.params.id;
  let sub = null;
  if (mongoose.connection.readyState === 1) {
    try {
      sub = await Subscription.findById(targetId);
    } catch (e) {}
  }
  if (!sub) {
    sub = syncStore.state.subscriptions.find(s => s.id === targetId || s._id === targetId);
  }
  if (!sub) return res.status(404).json({ success: false, message: "Subscription not found." });
  res.json({ success: true, data: sub });
}));

/**
 * POST /api/subscriptions
 * Add new software subscription (Admin & IT Manager only)
 */
router.post("/", authenticateToken, requireRole(["Admin", "IT Manager"]), asyncHandler(async (req, res) => {
  const payload = req.body;
  if (!payload.id) {
    payload.id = `SUB-${Date.now().toString().slice(-6)}`;
  }

  syncStore.applyMutation({
    type: "SUBSCRIPTION_ADD",
    payload: { subscription: payload },
    actor: req.user.name,
    role: req.user.role
  });

  let newSub = payload;
  if (mongoose.connection.readyState === 1) {
    try {
      newSub = await Subscription.create(payload);
    } catch (e) {}
  }

  await writeAudit({
    action: "SUBSCRIPTION_CREATED",
    entityType: "Subscription",
    entityId: String(newSub.id || newSub._id),
    entityName: newSub.name,
    actor: req.user.name,
    role: req.user.role,
    newValues: newSub,
    details: `Added subscription ${newSub.name} (${newSub.plan}) at ₹${newSub.cost}`
  });

  res.status(201).json({ success: true, data: newSub });
}));

/**
 * PUT /api/subscriptions/:id
 * Update subscription (Admin & IT Manager only)
 */
router.put("/:id", authenticateToken, requireRole(["Admin", "IT Manager"]), asyncHandler(async (req, res) => {
  const targetId = req.params.id;

  syncStore.applyMutation({
    type: "SUBSCRIPTION_UPDATE",
    payload: { id: targetId, updates: req.body },
    actor: req.user.name,
    role: req.user.role
  });

  let existing = null;
  if (mongoose.connection.readyState === 1) {
    try {
      const isObjectId = mongoose.isValidObjectId(targetId);
      existing = isObjectId
        ? await Subscription.findById(targetId)
        : await Subscription.findOne({ $or: [{ id: targetId }, { name: targetId }] });
      if (existing) {
        Object.assign(existing, req.body);
        await existing.save();
      }
    } catch (e) {}
  }

  const updatedSub = syncStore.state.subscriptions.find(s => s.id === targetId) || existing || { id: targetId, ...req.body };

  await writeAudit({
    action: "SUBSCRIPTION_UPDATED",
    entityType: "Subscription",
    entityId: String(targetId),
    entityName: updatedSub.name || targetId,
    actor: req.user.name,
    role: req.user.role,
    details: `Updated subscription attributes for ${updatedSub.name}`
  });

  res.json({ success: true, data: updatedSub });
}));

/**
 * DELETE /api/subscriptions/:id
 * Delete subscription (Admin full authority only)
 */
router.delete("/:id", authenticateToken, requireRole(["Admin"]), asyncHandler(async (req, res) => {
  const targetId = req.params.id;
  const existing = syncStore.state.subscriptions.find(s => s.id === targetId || s._id === targetId);

  syncStore.applyMutation({
    type: "SUBSCRIPTION_DELETE",
    payload: { id: targetId },
    actor: req.user.name,
    role: req.user.role
  });

  if (mongoose.connection.readyState === 1) {
    try {
      const isObjectId = mongoose.isValidObjectId(targetId);
      if (isObjectId) {
        await Subscription.findByIdAndDelete(targetId);
      } else {
        await Subscription.findOneAndDelete({ $or: [{ id: targetId }, { name: targetId }] });
      }
    } catch (e) {}
  }

  await writeAudit({
    action: "SUBSCRIPTION_DELETED",
    entityType: "Subscription",
    entityId: targetId,
    entityName: existing?.name || targetId,
    actor: req.user.name,
    role: req.user.role,
    details: `Subscription permanently deleted: ${existing?.name || targetId}`
  });

  res.json({ success: true, message: `Subscription ${existing?.name || targetId} deleted successfully.` });
}));

/**
 * POST /api/subscriptions/:id/renew
 * Process renewal
 */
router.post("/:id/renew", authenticateToken, requireRole(["Admin", "IT Manager"]), asyncHandler(async (req, res) => {
  const targetId = req.params.id;
  let sub = syncStore.state.subscriptions.find(s => s.id === targetId);

  const currentRenewal = new Date(sub?.renewal || sub?.renewalDate || Date.now());
  const nextRenewal = new Date(currentRenewal);
  if (sub?.billing === "Yearly" || sub?.billingCycle === "Yearly") {
    nextRenewal.setFullYear(nextRenewal.getFullYear() + 1);
  } else {
    nextRenewal.setMonth(nextRenewal.getMonth() + 1);
  }

  syncStore.applyMutation({
    type: "SUBSCRIPTION_UPDATE",
    payload: {
      id: targetId,
      updates: {
        renewal: nextRenewal,
        renewalDate: nextRenewal.toISOString().slice(0, 10),
        status: "Active",
        paid: "yes"
      }
    },
    actor: req.user.name,
    role: req.user.role
  });

  if (mongoose.connection.readyState === 1) {
    try {
      const mongoSub = await Subscription.findById(targetId);
      if (mongoSub) {
        mongoSub.renewal = nextRenewal;
        mongoSub.renewalDate = nextRenewal;
        mongoSub.status = "Active";
        mongoSub.paid = "yes";
        await mongoSub.save();
      }
    } catch (e) {}
  }

  const updatedSub = syncStore.state.subscriptions.find(s => s.id === targetId);

  await writeAudit({
    action: "SUBSCRIPTION_RENEWED",
    entityType: "Subscription",
    entityId: targetId,
    entityName: updatedSub?.name || targetId,
    actor: req.user.name,
    role: req.user.role,
    details: `Renewed ${updatedSub?.name} to ${nextRenewal.toISOString().split("T")[0]}`
  });

  res.json({ success: true, data: updatedSub });
}));

export default router;
