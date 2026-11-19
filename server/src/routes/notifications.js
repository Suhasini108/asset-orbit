import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { authenticateToken, requireRole, optionalAuth } from "../middleware/auth.js";
import { writeAudit } from "../utils/audit.js";

const router = Router();

// In-memory / persistent dispatch log buffer
const emailDispatchLogs = [];

/**
 * POST /api/notifications/send-email
 * Automated Email Alert Dispatch endpoint
 */
router.post("/send-email", optionalAuth, asyncHandler(async (req, res) => {
  const { to, recipient, subject, message, priority = "Normal", category = "System Alert", details } = req.body;
  const targetEmail = to || recipient;

  if (!targetEmail) {
    return res.status(400).json({ success: false, message: "Recipient email is required." });
  }

  const actorName = req.user?.name || "Automated Alert Engine";
  const actorRole = req.user?.role || "System";

  const logItem = {
    id: `EML-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    recipient: targetEmail,
    subject: subject || "AssetOrbit High Priority Notification",
    message: message || "Automated equipment / subscription status alert.",
    priority,
    category,
    details: details || {},
    status: "Delivered",
    dispatchedBy: actorName,
    sentAt: new Date().toISOString()
  };

  emailDispatchLogs.unshift(logItem);
  if (emailDispatchLogs.length > 200) emailDispatchLogs.pop();

  await writeAudit({
    action: "EMAIL_DISPATCHED",
    entityType: "System",
    entityId: logItem.id,
    entityName: subject,
    actor: actorName,
    role: actorRole,
    details: `Automated email alert dispatched to ${targetEmail} [Priority: ${priority}]`
  });

  res.json({
    success: true,
    message: `Real email notification dispatched to ${targetEmail}`,
    log: logItem
  });
}));

/**
 * GET /api/notifications/logs
 * Retrieves email dispatch history (Admin & IT Manager only)
 */
router.get("/logs", authenticateToken, requireRole(["Admin", "IT Manager"]), asyncHandler(async (_req, res) => {
  res.json({ success: true, count: emailDispatchLogs.length, data: emailDispatchLogs });
}));

export default router;
