import { Router } from "express";
import Vendor from "../models/Vendor.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { writeAudit } from "../utils/audit.js";
import { authenticateToken, requireRole } from "../middleware/auth.js";

const router = Router();

router.get("/", authenticateToken, asyncHandler(async (req, res) => {
  const { search = "" } = req.query;
  const filter = {};
  if (search.trim()) {
    const rx = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter.$or = [{ name: rx }, { contactPerson: rx }, { email: rx }, { category: rx }];
  }
  const vendors = await Vendor.find(filter).sort({ name: 1 }).lean();
  res.json({ success: true, count: vendors.length, data: vendors });
}));

router.post("/", authenticateToken, requireRole(["Admin", "IT Manager"]), asyncHandler(async (req, res) => {
  const newVendor = await Vendor.create(req.body);
  await writeAudit({
    action: "VENDOR_CREATED",
    entityType: "Vendor",
    entityId: String(newVendor._id),
    entityName: newVendor.name,
    actor: req.user.name,
    role: req.user.role,
    details: `Created vendor ${newVendor.name}`
  });
  res.status(201).json({ success: true, data: newVendor });
}));

router.put("/:id", authenticateToken, requireRole(["Admin", "IT Manager"]), asyncHandler(async (req, res) => {
  const updated = await Vendor.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!updated) return res.status(404).json({ success: false, message: "Vendor not found." });
  res.json({ success: true, data: updated });
}));

router.delete("/:id", authenticateToken, requireRole(["Admin"]), asyncHandler(async (req, res) => {
  const deleted = await Vendor.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ success: false, message: "Vendor not found." });
  res.json({ success: true, message: `Vendor ${deleted.name} deleted successfully.` });
}));

export default router;
