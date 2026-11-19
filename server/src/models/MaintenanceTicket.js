import mongoose from "mongoose";

const maintenanceTicketSchema = new mongoose.Schema({
  ticketId: { type: String, required: true, unique: true, uppercase: true, trim: true },
  assetId: { type: String, default: null },
  assetTag: { type: String, required: true, trim: true, uppercase: true },
  assetName: { type: String, required: true, trim: true },
  title: { type: String, required: true, trim: true, maxlength: 200 },
  description: { type: String, default: "", maxlength: 1200 },
  issueType: { 
    type: String, 
    default: "Hardware Failure"
  },
  priority: { 
    type: String, 
    enum: ["Low", "Medium", "High", "Critical"], 
    default: "Medium" 
  },
  status: { 
    type: String, 
    enum: ["Pending Admin Approval", "Open", "In Progress", "Awaiting Parts", "Resolved", "Closed"], 
    default: "Open" 
  },
  reportedBy: { type: String, default: "Employee", trim: true },
  reporterRole: { type: String, enum: ["Admin", "IT Manager", "Employee"], default: "Employee" },
  reporterName: { type: String, default: "Staff Member", trim: true },
  assignedTechnician: { type: String, default: "IT Support Team", trim: true },
  needsAdminApproval: { type: Boolean, default: false },
  checklist: { type: [mongoose.Schema.Types.Mixed], default: [] },
  notes: { type: [mongoose.Schema.Types.Mixed], default: [] },
  estimatedCost: { type: Number, default: 0, min: 0 },
  actualCost: { type: Number, default: 0, min: 0 },
  downtimeHours: { type: Number, default: 0, min: 0 },
  resolutionNotes: { type: String, default: "", maxlength: 800 },
  reportedAt: { type: Date, default: Date.now },
  resolvedAt: { type: Date, default: null }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

maintenanceTicketSchema.index({ createdAt: -1 });
export default mongoose.models.MaintenanceTicket || mongoose.model("MaintenanceTicket", maintenanceTicketSchema);
