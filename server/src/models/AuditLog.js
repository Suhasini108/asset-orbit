import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema({
  action: { type: String, required: true, trim: true },
  entityType: { 
    type: String, 
    enum: ["Asset", "Subscription", "Ticket", "Vendor", "User", "System"], 
    default: "Asset" 
  },
  entityId: { type: String, default: "" },
  entityName: { type: String, default: "" },
  actor: { type: String, default: "Workspace Admin" },
  role: { type: String, enum: ["Admin", "IT Manager", "Employee", "System"], default: "Admin" },
  previousValues: { type: mongoose.Schema.Types.Mixed, default: null },
  newValues: { type: mongoose.Schema.Types.Mixed, default: null },
  details: { type: String, default: "" }
}, { timestamps: true });

auditLogSchema.index({ createdAt: -1 });
export default mongoose.models.AuditLog || mongoose.model("AuditLog", auditLogSchema);
