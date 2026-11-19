import { Router } from "express";
import Asset from "../models/Asset.js";
import Subscription from "../models/Subscription.js";
import MaintenanceTicket from "../models/MaintenanceTicket.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { authenticateToken } from "../middleware/auth.js";

const router = Router();

/**
 * GET /api/dashboard/stats
 * Organization-wide for Admin/IT Manager; Scoped for Employee
 */
router.get("/stats", authenticateToken, asyncHandler(async (req, res) => {
  const isEmployee = req.user.role === "Employee";

  if (isEmployee) {
    const employeeFilter = {
      $or: [
        { assignee: req.user.name },
        { assignedUser: req.user.name },
        { employeeEmail: req.user.email }
      ]
    };
    const [assignedAssets, tickets] = await Promise.all([
      Asset.find(employeeFilter).lean(),
      MaintenanceTicket.find({
        $or: [{ reportedBy: req.user.name }, { reporterName: req.user.name }]
      }).lean()
    ]);

    const activeTickets = tickets.filter(t => t.status !== "Resolved" && t.status !== "Closed");

    return res.json({
      success: true,
      data: {
        role: "Employee",
        myAssetsCount: assignedAssets.length,
        myActiveTicketsCount: activeTickets.length,
        assignedAssets: assignedAssets.map(a => ({
          id: a._id,
          name: a.name,
          tag: a.tag,
          type: a.type,
          condition: a.condition,
          status: a.status,
          labRoom: a.labRoom || a.location
        })),
        recentTickets: tickets.slice(0, 5)
      }
    });
  }

  // Admin and IT Manager Organization-Wide Aggregations
  const [assets, subscriptions, tickets] = await Promise.all([
    Asset.find().lean(),
    Subscription.find().lean(),
    MaintenanceTicket.find().lean()
  ]);

  const totalAssets = assets.length;
  const assignedAssets = assets.filter(a => a.status === "Assigned").length;
  const availableAssets = assets.filter(a => a.status === "Available" || a.status === "Unassigned").length;
  const inRepairAssets = assets.filter(a => a.status === "In Repair" || a.status === "Faulty").length;

  const totalHardwareCost = assets.reduce((sum, a) => sum + (Number(a.cost || a.value) || 0), 0);
  const activeSubs = subscriptions.filter(s => s.status === "Active");
  const totalSubCost = activeSubs.reduce((sum, s) => sum + (Number(s.cost) || 0), 0);
  const monthlySpend = Math.round(totalSubCost / 12);

  const now = new Date();
  const next90Days = new Date(now.getTime() + 90 * 86400000);
  const renewalsDueSoon = subscriptions.filter(s => {
    const renDate = new Date(s.renewal || s.renewalDate);
    return renDate >= now && renDate <= next90Days;
  }).length;

  const openTickets = tickets.filter(t => t.status === "Open" || t.status === "Pending Admin Approval" || t.status === "In Progress").length;
  const pendingApprovals = tickets.filter(t => t.status === "Pending Admin Approval").length;

  res.json({
    success: true,
    data: {
      role: req.user.role,
      totalAssets,
      assignedAssets,
      availableAssets,
      inRepairAssets,
      totalHardwareCost,
      totalSubscriptions: subscriptions.length,
      activeSubscriptions: activeSubs.length,
      monthlySpend,
      yearlySpend: totalSubCost,
      renewalsDueSoon,
      openTickets,
      pendingApprovals
    }
  });
}));

/**
 * GET /api/dashboard/dept-distribution
 */
router.get("/dept-distribution", authenticateToken, asyncHandler(async (_req, res) => {
  const assets = await Asset.find().lean();
  const distribution = {};
  for (const asset of assets) {
    const dept = asset.department || "ISE";
    distribution[dept] = (distribution[dept] || 0) + 1;
  }
  const result = Object.entries(distribution).map(([dept, count]) => ({ department: dept, count }));
  res.json({ success: true, data: result });
}));

export default router;
