import { Router } from "express";
import Asset from "../models/Asset.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { writeAudit } from "../utils/audit.js";
import { authenticateToken, requireRole, optionalAuth } from "../middleware/auth.js";

const router = Router();

/**
 * GET /api/assets
 * Lists assets. Strictly scopes Employee role to only their assigned equipment.
 */
router.get("/", authenticateToken, asyncHandler(async (req, res) => {
  const { search = "", status = "", department = "", type = "", category = "", condition = "" } = req.query;
  const filter = {};

  if (status) filter.status = status;
  if (department) filter.department = department;
  if (type) filter.type = type;
  if (category) filter.category = category;
  if (condition) filter.condition = condition;

  // STRICT EMPLOYEE DATA ISOLATION (Server-Side Enforced)
  if (req.user.role === "Employee") {
    const userConditions = [
      { assignee: req.user.name },
      { assignedUser: req.user.name },
      { employeeEmail: req.user.email }
    ];
    filter.$or = userConditions;
  }

  if (search.trim()) {
    const rx = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    const searchClause = {
      $or: [
        { name: rx },
        { tag: rx },
        { serial: rx },
        { serialNumber: rx },
        { manufacturer: rx },
        { modelNumber: rx },
        { location: rx },
        { labRoom: rx },
        { benchNumber: rx }
      ]
    };
    if (filter.$or) {
      filter.$and = [{ $or: filter.$or }, searchClause];
      delete filter.$or;
    } else {
      filter.$or = searchClause.$or;
    }
  }

  const assets = await Asset.find(filter).sort({ createdAt: -1 }).lean();
  res.json({ success: true, count: assets.length, data: assets });
}));

/**
 * GET /api/assets/public/:tag
 * Mobile QR Code Scan Public Verification Endpoint (Camera / Scanner accessible)
 */
router.get("/public/:tag", optionalAuth, asyncHandler(async (req, res) => {
  const tag = String(req.params.tag || "").trim();
  const rx = new RegExp(`^${tag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");
  const asset = await Asset.findOne({ $or: [{ tag: rx }, { serialNumber: rx }, { serial: rx }] }).lean();

  if (!asset) {
    return res.status(404).json({ success: false, message: "Asset not found in enterprise registry." });
  }

  const now = new Date();
  const purchaseDate = new Date(asset.purchaseDate || now);
  const ageYears = Math.max(0, (now - purchaseDate) / (365.25 * 86400000));
  const usefulLife = Number(asset.usefulLifeYears) || 4;
  const salvage = Number(asset.salvageValue) || 0;
  const cost = Number(asset.cost || asset.value) || 0;
  const annualDep = Math.max(0, (cost - salvage) / usefulLife);
  const currentVal = Math.max(salvage, cost - (annualDep * ageYears));

  res.json({
    success: true,
    data: asset,
    metrics: {
      ageYears: Number(ageYears.toFixed(1)),
      depreciatedValue: Math.round(currentVal),
      isWarrantyActive: asset.warrantyExpiry ? new Date(asset.warrantyExpiry) > now : false
    }
  });
}));

/**
 * GET /api/assets/:id
 * Retrieve single asset details
 */
router.get("/:id", authenticateToken, asyncHandler(async (req, res) => {
  const asset = await Asset.findById(req.params.id);
  if (!asset) {
    return res.status(404).json({ success: false, message: "Asset not found." });
  }

  // Employee can only view their own assigned asset
  if (req.user.role === "Employee") {
    const isOwner = asset.assignee === req.user.name || 
                    asset.assignedUser === req.user.name || 
                    asset.employeeEmail === req.user.email;
    if (!isOwner) {
      return res.status(403).json({ success: false, message: "Forbidden: You are not authorized to view this asset." });
    }
  }

  res.json({ success: true, data: asset });
}));

/**
 * POST /api/assets
 * Create new asset (Admin & IT Manager only)
 */
router.post("/", authenticateToken, requireRole(["Admin", "IT Manager"]), asyncHandler(async (req, res) => {
  const payload = req.body;
  if (!payload.tag) {
    payload.tag = `AST-${Date.now().toString().slice(-6)}`;
  }
  payload.value = payload.value || payload.cost || 0;
  payload.cost = payload.value;

  const newAsset = await Asset.create(payload);

  await writeAudit({
    action: "ASSET_CREATED",
    entityType: "Asset",
    entityId: String(newAsset._id),
    entityName: newAsset.name,
    actor: req.user.name,
    role: req.user.role,
    newValues: newAsset.toObject(),
    details: `Created asset ${newAsset.tag} (${newAsset.name}) in ${newAsset.department}`
  });

  res.status(201).json({ success: true, data: newAsset });
}));

/**
 * PUT /api/assets/:id
 * Update asset (Admin & IT Manager only)
 */
router.put("/:id", authenticateToken, requireRole(["Admin", "IT Manager"]), asyncHandler(async (req, res) => {
  const existing = await Asset.findById(req.params.id);
  if (!existing) {
    return res.status(404).json({ success: false, message: "Asset not found." });
  }

  const prev = existing.toObject();
  Object.assign(existing, req.body);
  await existing.save();

  await writeAudit({
    action: "ASSET_UPDATED",
    entityType: "Asset",
    entityId: String(existing._id),
    entityName: existing.name,
    actor: req.user.name,
    role: req.user.role,
    previousValues: prev,
    newValues: existing.toObject(),
    details: `Updated attributes for ${existing.tag}`
  });

  res.json({ success: true, data: existing });
}));

/**
 * DELETE /api/assets/:id
 * Delete asset (Admin full authority only)
 */
router.delete("/:id", authenticateToken, requireRole(["Admin"]), asyncHandler(async (req, res) => {
  const existing = await Asset.findById(req.params.id);
  if (!existing) {
    return res.status(404).json({ success: false, message: "Asset not found." });
  }

  await Asset.findByIdAndDelete(req.params.id);

  await writeAudit({
    action: "ASSET_DELETED",
    entityType: "Asset",
    entityId: String(existing._id),
    entityName: existing.name,
    actor: req.user.name,
    role: req.user.role,
    details: `Asset permanently removed: ${existing.tag} (${existing.name})`
  });

  res.json({ success: true, message: `Asset ${existing.tag} deleted successfully.` });
}));

/**
 * POST /api/assets/:id/assign
 * Assign asset to employee (Admin & IT Manager only)
 */
router.post("/:id/assign", authenticateToken, requireRole(["Admin", "IT Manager"]), asyncHandler(async (req, res) => {
  const { assignee, employeeEmail, location } = req.body;
  if (!assignee?.trim()) {
    return res.status(400).json({ success: false, message: "Assignee name is required." });
  }

  const asset = await Asset.findById(req.params.id);
  if (!asset) return res.status(404).json({ success: false, message: "Asset not found." });

  asset.status = "Assigned";
  asset.assignee = assignee.trim();
  asset.assignedUser = assignee.trim();
  if (employeeEmail) asset.employeeEmail = employeeEmail.trim().toLowerCase();
  if (location) asset.location = location;
  await asset.save();

  await writeAudit({
    action: "ASSET_ASSIGNED",
    entityType: "Asset",
    entityId: String(asset._id),
    entityName: asset.name,
    actor: req.user.name,
    role: req.user.role,
    details: `Asset ${asset.tag} assigned to ${assignee}`
  });

  res.json({ success: true, data: asset });
}));

/**
 * POST /api/assets/:id/unassign
 * Unassign asset to Available pool (Admin & IT Manager only)
 */
router.post("/:id/unassign", authenticateToken, requireRole(["Admin", "IT Manager"]), asyncHandler(async (req, res) => {
  const asset = await Asset.findById(req.params.id);
  if (!asset) return res.status(404).json({ success: false, message: "Asset not found." });

  const prevAssignee = asset.assignee;
  asset.status = "Available";
  asset.assignee = "";
  asset.assignedUser = "";
  asset.employeeEmail = "";
  await asset.save();

  await writeAudit({
    action: "ASSET_UNASSIGNED",
    entityType: "Asset",
    entityId: String(asset._id),
    entityName: asset.name,
    actor: req.user.name,
    role: req.user.role,
    details: `Asset ${asset.tag} unassigned from ${prevAssignee} to Available inventory pool`
  });

  res.json({ success: true, data: asset });
}));

export default router;
