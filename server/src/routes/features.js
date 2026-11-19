import { Router } from "express";
import Asset from "../models/Asset.js";
import AuditLog from "../models/AuditLog.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { authenticateToken, requireRole } from "../middleware/auth.js";

const router = Router();

/**
 * GET /api/features/audit
 * Global audit trail (Admin & IT Manager only)
 */
router.get("/audit", authenticateToken, requireRole(["Admin", "IT Manager"]), asyncHandler(async (req, res) => {
  const { entityType = "", search = "" } = req.query;
  const filter = {};
  if (entityType) filter.entityType = entityType;
  if (search.trim()) {
    const rx = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter.$or = [{ action: rx }, { entityName: rx }, { actor: rx }, { details: rx }];
  }
  const logs = await AuditLog.find(filter).sort({ createdAt: -1 }).limit(Math.min(Number(req.query.limit) || 150, 400)).lean();
  res.json({ success: true, count: logs.length, data: logs });
}));

/**
 * GET /api/features/assets/:id/history
 * History for single asset
 */
router.get("/assets/:id/history", authenticateToken, asyncHandler(async (req, res) => {
  const asset = await Asset.findById(req.params.id).lean();
  if (!asset) return res.status(404).json({ success: false, message: "Asset not found." });

  if (req.user.role === "Employee") {
    const isOwner = asset.assignee === req.user.name || asset.assignedUser === req.user.name || asset.employeeEmail === req.user.email;
    if (!isOwner) {
      return res.status(403).json({ success: false, message: "Forbidden: You are not authorized to view this asset's history." });
    }
  }

  const logs = await AuditLog.find({ entityId: String(asset._id) }).sort({ createdAt: -1 }).limit(100).lean();
  res.json({ success: true, count: logs.length, data: logs });
}));

/**
 * GET /api/features/qr-directory
 * Returns quick index of active QR tags
 */
router.get("/qr-directory", authenticateToken, asyncHandler(async (req, res) => {
  const filter = {};
  if (req.user.role === "Employee") {
    filter.$or = [{ assignee: req.user.name }, { assignedUser: req.user.name }, { employeeEmail: req.user.email }];
  }
  const assets = await Asset.find(filter, "tag name type department location status").sort({ tag: 1 }).lean();
  res.json({ success: true, count: assets.length, data: assets });
}));

export default router;
