import { Router } from "express";
import MaintenanceTicket from "../models/MaintenanceTicket.js";
import Asset from "../models/Asset.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { writeAudit } from "../utils/audit.js";
import { authenticateToken, requireRole } from "../middleware/auth.js";

const router = Router();

/**
 * GET /api/tickets
 * Scoped list: Employees see their reported tickets; Admins & IT Managers see all.
 */
router.get("/", authenticateToken, asyncHandler(async (req, res) => {
  const { status, priority } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (priority) filter.priority = priority;

  if (req.user.role === "Employee") {
    filter.$or = [
      { reportedBy: req.user.name },
      { reporterName: req.user.name }
    ];
  }

  const tickets = await MaintenanceTicket.find(filter).sort({ createdAt: -1 }).lean();
  res.json({ success: true, count: tickets.length, data: tickets });
}));

/**
 * POST /api/tickets
 * Create problem / maintenance ticket
 */
router.post("/", authenticateToken, asyncHandler(async (req, res) => {
  const payload = req.body;
  const isEmployee = req.user.role === "Employee";

  const ticketCount = await MaintenanceTicket.countDocuments();
  payload.ticketId = `TCK-${ticketCount + 1001}`;
  payload.reportedBy = req.user.name;
  payload.reporterName = req.user.name;
  payload.reporterRole = req.user.role;
  payload.status = isEmployee ? "Pending Admin Approval" : (payload.status || "Open");
  payload.needsAdminApproval = isEmployee;
  payload.reportedAt = new Date();

  const ticket = await MaintenanceTicket.create(payload);

  // If asset tag is provided, update asset status to In Repair if critical
  if (payload.assetTag && (payload.priority === "Critical" || payload.priority === "High")) {
    await Asset.findOneAndUpdate(
      { tag: payload.assetTag },
      { status: "In Repair", condition: "Needs Repair" }
    ).catch(() => {});
  }

  await writeAudit({
    action: "TICKET_CREATED",
    entityType: "Ticket",
    entityId: ticket.ticketId,
    entityName: ticket.title,
    actor: req.user.name,
    role: req.user.role,
    details: `${ticket.reporterRole} ${req.user.name} reported ticket ${ticket.ticketId} (${ticket.title}) - Status: ${ticket.status}`
  });

  res.status(201).json({ success: true, data: ticket });
}));

/**
 * POST /api/tickets/:id/approve
 * Admin Approval for Employee reported tickets
 */
router.post("/:id/approve", authenticateToken, requireRole(["Admin"]), asyncHandler(async (req, res) => {
  const ticket = await MaintenanceTicket.findOne({
    $or: [{ _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }, { ticketId: req.params.id }]
  });
  if (!ticket) return res.status(404).json({ success: false, message: "Ticket not found." });

  ticket.status = "Open";
  ticket.needsAdminApproval = false;
  ticket.notes.push({
    author: req.user.name,
    date: new Date().toISOString(),
    text: "Approved by Administrator for IT resolution."
  });
  await ticket.save();

  await writeAudit({
    action: "TICKET_APPROVED",
    entityType: "Ticket",
    entityId: ticket.ticketId,
    entityName: ticket.title,
    actor: req.user.name,
    role: "Admin",
    details: `Admin approved ticket ${ticket.ticketId} for resolution`
  });

  res.json({ success: true, data: ticket });
}));

/**
 * PATCH /api/tickets/:id/status
 * Update ticket workflow status (Admin & IT Manager)
 */
router.patch("/:id/status", authenticateToken, requireRole(["Admin", "IT Manager"]), asyncHandler(async (req, res) => {
  const { status, resolutionNotes, assignedTechnician, actualCost } = req.body;
  const ticket = await MaintenanceTicket.findOne({
    $or: [{ _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }, { ticketId: req.params.id }]
  });
  if (!ticket) return res.status(404).json({ success: false, message: "Ticket not found." });

  if (status) ticket.status = status;
  if (resolutionNotes) ticket.resolutionNotes = resolutionNotes;
  if (assignedTechnician) ticket.assignedTechnician = assignedTechnician;
  if (actualCost !== undefined) ticket.actualCost = actualCost;
  if (status === "Resolved" || status === "Closed") {
    ticket.resolvedAt = new Date();
  }

  await ticket.save();

  await writeAudit({
    action: "TICKET_STATUS_UPDATED",
    entityType: "Ticket",
    entityId: ticket.ticketId,
    entityName: ticket.title,
    actor: req.user.name,
    role: req.user.role,
    details: `Updated ticket ${ticket.ticketId} status to ${status}`
  });

  res.json({ success: true, data: ticket });
}));

/**
 * DELETE /api/tickets/:id
 * Delete ticket (Admin only)
 */
router.delete("/:id", authenticateToken, requireRole(["Admin"]), asyncHandler(async (req, res) => {
  const ticket = await MaintenanceTicket.findOneAndDelete({
    $or: [{ _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }, { ticketId: req.params.id }]
  });
  if (!ticket) return res.status(404).json({ success: false, message: "Ticket not found." });

  await writeAudit({
    action: "TICKET_DELETED",
    entityType: "Ticket",
    entityId: ticket.ticketId,
    entityName: ticket.title,
    actor: req.user.name,
    role: "Admin",
    details: `Ticket ${ticket.ticketId} deleted`
  });

  res.json({ success: true, message: `Ticket ${ticket.ticketId} deleted successfully.` });
}));

export default router;
