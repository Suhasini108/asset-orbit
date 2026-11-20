import { Router } from "express";
import mongoose from "mongoose";
import Asset from "../models/Asset.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { writeAudit } from "../utils/audit.js";
import { authenticateToken, requireRole, optionalAuth } from "../middleware/auth.js";
import syncStore from "../syncStore.js";

const router = Router();

/**
 * GET /api/assets
 * Lists assets. Strictly scopes Employee role to only their assigned equipment.
 */
router.get("/", authenticateToken, asyncHandler(async (req, res) => {
  const { search = "", status = "", department = "", type = "", category = "", condition = "" } = req.query;

  // If MongoDB is not connected (e.g. serverless without external Mongo cluster), use syncStore
  if (mongoose.connection.readyState !== 1) {
    const assets = syncStore.getAssets(req.user, { search, status, department, type, category, condition });
    return res.json({ success: true, count: assets.length, data: assets });
  }

  try {
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
    return res.json({ success: true, count: assets.length, data: assets });
  } catch (err) {
    // Fallback to syncStore
    const assets = syncStore.getAssets(req.user, { search, status, department, type, category, condition });
    return res.json({ success: true, count: assets.length, data: assets });
  }
}));

/**
 * GET /api/assets/public/:tag
 * Mobile QR Code Scan Public Verification Endpoint (Camera / Scanner accessible)
 */
router.get("/public/:tag", optionalAuth, asyncHandler(async (req, res) => {
  const tag = String(req.params.tag || "").trim();

  let asset = null;
  if (mongoose.connection.readyState === 1) {
    try {
      const rx = new RegExp(`^${tag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");
      asset = await Asset.findOne({ $or: [{ tag: rx }, { serialNumber: rx }, { serial: rx }] }).lean();
    } catch (e) {}
  }

  if (!asset) {
    asset = syncStore.getAssetById(tag);
  }

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
  let asset = null;
  if (mongoose.connection.readyState === 1) {
    try {
      asset = await Asset.findById(req.params.id);
    } catch (e) {}
  }

  if (!asset) {
    asset = syncStore.getAssetById(req.params.id);
  }

  if (!asset) {
    return res.status(404).json({ success: false, message: "Asset not found." });
  }

  // Employee can only view their own assigned asset
  if (req.user.role === "Employee") {
    const isOwner = asset.assignee === req.user.name || 
                    asset.assignedUser === req.user.name || 
                    asset.assignedTo === req.user.name ||
                    asset.employeeEmail === req.user.email ||
                    asset.assignedEmail === req.user.email;
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
  if (!payload.id && !payload.tag) {
    payload.id = `AST-${Date.now().toString().slice(-6)}`;
    payload.tag = payload.id;
  } else if (!payload.id) {
    payload.id = payload.tag;
  } else if (!payload.tag) {
    payload.tag = payload.id;
  }
  payload.value = payload.value || payload.cost || 0;
  payload.cost = payload.value;

  // Always register in syncStore
  syncStore.applyMutation({
    type: "ASSET_ADD",
    payload: { asset: payload },
    actor: req.user.name,
    role: req.user.role
  });

  let newAsset = payload;
  if (mongoose.connection.readyState === 1) {
    try {
      newAsset = await Asset.create(payload);
    } catch (e) {}
  }

  await writeAudit({
    action: "ASSET_CREATED",
    entityType: "Asset",
    entityId: String(newAsset.id || newAsset._id),
    entityName: newAsset.name,
    actor: req.user.name,
    role: req.user.role,
    newValues: newAsset,
    details: `Created asset ${newAsset.tag || newAsset.id} (${newAsset.name}) in ${newAsset.department || newAsset.subBranch}`
  });

  res.status(201).json({ success: true, data: newAsset });
}));

/**
 * PUT /api/assets/:id
 * Update asset (Admin & IT Manager only)
 */
router.put("/:id", authenticateToken, requireRole(["Admin", "IT Manager"]), asyncHandler(async (req, res) => {
  // Update in syncStore
  syncStore.applyMutation({
    type: "ASSET_UPDATE",
    payload: { id: req.params.id, updates: req.body },
    actor: req.user.name,
    role: req.user.role
  });

  let existing = null;
  if (mongoose.connection.readyState === 1) {
    try {
      const isObjectId = mongoose.isValidObjectId(req.params.id);
      existing = isObjectId 
        ? await Asset.findById(req.params.id) 
        : await Asset.findOne({ $or: [{ tag: req.params.id }, { id: req.params.id }] });
      if (existing) {
        Object.assign(existing, req.body);
        await existing.save();
      }
    } catch (e) {}
  }

  const updatedAsset = syncStore.getAssetById(req.params.id) || existing || { id: req.params.id, ...req.body };

  await writeAudit({
    action: "ASSET_UPDATED",
    entityType: "Asset",
    entityId: String(req.params.id),
    entityName: updatedAsset.name || req.params.id,
    actor: req.user.name,
    role: req.user.role,
    details: `Updated attributes for ${req.params.id}`
  });

  res.json({ success: true, data: updatedAsset });
}));

/**
 * DELETE /api/assets/:id
 * Delete asset (Admin full authority only)
 */
router.delete("/:id", authenticateToken, requireRole(["Admin"]), asyncHandler(async (req, res) => {
  const targetId = req.params.id;
  const existing = syncStore.getAssetById(targetId);

  // Apply deletion to syncStore
  syncStore.applyMutation({
    type: "ASSET_DELETE",
    payload: { id: targetId },
    actor: req.user.name,
    role: req.user.role
  });

  if (mongoose.connection.readyState === 1) {
    try {
      const isObjectId = mongoose.isValidObjectId(targetId);
      if (isObjectId) {
        await Asset.findByIdAndDelete(targetId);
      } else {
        await Asset.findOneAndDelete({ $or: [{ tag: targetId }, { id: targetId }] });
      }
    } catch (e) {}
  }

  await writeAudit({
    action: "ASSET_DELETED",
    entityType: "Asset",
    entityId: targetId,
    entityName: existing?.name || targetId,
    actor: req.user.name,
    role: req.user.role,
    details: `Asset permanently removed: ${targetId} (${existing?.name || "Equipment"})`
  });

  res.json({ success: true, message: `Asset ${targetId} deleted successfully.` });
}));

/**
 * POST /api/assets/:id/assign
 * Assign asset to employee (Admin & IT Manager only)
 */
router.post("/:id/assign", authenticateToken, requireRole(["Admin", "IT Manager"]), asyncHandler(async (req, res) => {
  const targetId = req.params.id;
  const assignee = req.body.assignee || req.body.employeeName || req.body.assignedTo;
  const employeeEmail = req.body.employeeEmail || req.body.assignedEmail || "";
  const location = req.body.location || req.body.deskLocation || "";

  if (!assignee?.trim()) {
    return res.status(400).json({ success: false, message: "Assignee name is required." });
  }

  // Apply assignment directly to syncStore
  syncStore.applyMutation({
    type: "ASSET_ASSIGN",
    payload: {
      id: targetId,
      assignee: assignee.trim(),
      employeeEmail: employeeEmail.trim().toLowerCase(),
      location: location.trim(),
      notes: req.body.notes || ""
    },
    actor: req.user.name,
    role: req.user.role
  });

  if (mongoose.connection.readyState === 1) {
    try {
      const isObjectId = mongoose.isValidObjectId(targetId);
      const asset = isObjectId
        ? await Asset.findById(targetId)
        : await Asset.findOne({ $or: [{ tag: targetId }, { id: targetId }] });
      if (asset) {
        asset.status = "Assigned";
        asset.assignee = assignee.trim();
        asset.assignedUser = assignee.trim();
        if (employeeEmail) asset.employeeEmail = employeeEmail.trim().toLowerCase();
        if (location) asset.location = location;
        await asset.save();
      }
    } catch (e) {}
  }

  const updatedAsset = syncStore.getAssetById(targetId);

  await writeAudit({
    action: "ASSET_ASSIGNED",
    entityType: "Asset",
    entityId: targetId,
    entityName: updatedAsset?.name || targetId,
    actor: req.user.name,
    role: req.user.role,
    details: `Asset ${targetId} assigned to ${assignee} (${employeeEmail || "email N/A"})`
  });

  res.json({ success: true, data: updatedAsset });
}));

/**
 * POST /api/assets/:id/unassign
 * Unassign asset to Available pool (Admin & IT Manager only)
 */
router.post("/:id/unassign", authenticateToken, requireRole(["Admin", "IT Manager"]), asyncHandler(async (req, res) => {
  const targetId = req.params.id;
  const existing = syncStore.getAssetById(targetId);

  // Apply unassign to syncStore
  syncStore.applyMutation({
    type: "ASSET_UNASSIGN",
    payload: { id: targetId },
    actor: req.user.name,
    role: req.user.role
  });

  if (mongoose.connection.readyState === 1) {
    try {
      const isObjectId = mongoose.isValidObjectId(targetId);
      const asset = isObjectId
        ? await Asset.findById(targetId)
        : await Asset.findOne({ $or: [{ tag: targetId }, { id: targetId }] });
      if (asset) {
        asset.status = "Available";
        asset.assignee = "";
        asset.assignedUser = "";
        asset.employeeEmail = "";
        await asset.save();
      }
    } catch (e) {}
  }

  const updatedAsset = syncStore.getAssetById(targetId);

  await writeAudit({
    action: "ASSET_UNASSIGNED",
    entityType: "Asset",
    entityId: targetId,
    entityName: existing?.name || targetId,
    actor: req.user.name,
    role: req.user.role,
    details: `Asset ${targetId} unassigned from ${existing?.assignedTo || existing?.assignee || "Staff"} to Available pool`
  });

  res.json({ success: true, data: updatedAsset });
}));

export default router;
