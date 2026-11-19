import AuditLog from "../models/AuditLog.js";

export async function writeAudit({ 
  action, 
  entityType = "Asset", 
  entityId = "", 
  entityName = "", 
  actor = "Workspace Admin", 
  role = "Admin", 
  previousValues = null, 
  newValues = null, 
  details = "" 
}) {
  try {
    await AuditLog.create({ 
      action, 
      entityType, 
      entityId: String(entityId || ""), 
      entityName, 
      actor, 
      role, 
      previousValues, 
      newValues, 
      details 
    });
  } catch (error) {
    console.error("Audit log write failed:", error.message);
  }
}
