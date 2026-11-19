import mongoose from "mongoose";

const assetSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 180 },
  type: { 
    type: String, 
    required: true, 
    enum: ["Laptop", "Monitor", "Mobile", "Tablet", "Desktop", "Server", "Network", "Peripheral", "Printer", "Scanner", "LCD Projector", "UPS", "Other"],
    default: "Desktop"
  },
  category: {
    type: String,
    default: "Engineering"
  },
  department: { 
    type: String, 
    required: true, 
    default: "ISE"
  },
  subBranch: {
    type: String,
    default: "ISE"
  },
  tag: { type: String, required: true, trim: true, uppercase: true, unique: true, maxlength: 60 },
  serial: { type: String, trim: true, default: "", maxlength: 120 },
  serialNumber: { type: String, trim: true, default: "", maxlength: 120 },
  manufacturer: { type: String, trim: true, default: "Dell", maxlength: 100 },
  modelNumber: { type: String, trim: true, default: "", maxlength: 120 },
  location: { type: String, trim: true, default: "ISE Department Block Room 204", maxlength: 160 },
  labRoom: { type: String, trim: true, default: "", maxlength: 160 },
  benchNumber: { type: String, trim: true, default: "", maxlength: 120 },
  condition: { 
    type: String, 
    default: "Good"
  },
  assignee: { type: String, trim: true, default: "", maxlength: 120 },
  assignedUser: { type: String, trim: true, default: "", maxlength: 120 },
  employeeEmail: { type: String, trim: true, lowercase: true, default: "", maxlength: 160 },
  quantity: { type: Number, default: 1, min: 1 },
  workingUnits: { type: Number, default: 1, min: 0 },
  faultyUnits: { type: Number, default: 0, min: 0 },
  repaired: { type: String, default: "No" },
  healthStatus: { type: String, default: "Working" },
  healthNotes: { type: String, default: "" },
  healthScore: { type: Number, default: 85, min: 0, max: 100 },
  purchaseDate: { type: Date, default: Date.now },
  value: { type: Number, required: true, min: 0, default: 0 },
  cost: { type: Number, default: 0, min: 0 },
  salvageValue: { type: Number, default: 0, min: 0 },
  usefulLifeYears: { type: Number, default: 4, min: 1, max: 25 },
  status: { 
    type: String, 
    enum: ["Available", "Assigned", "In Repair", "Reserved", "Retired", "Faulty", "Unassigned", "Pending Admin Approval"], 
    default: "Available" 
  },
  warranty: { type: Date, default: null },
  warrantyExpiry: { type: Date, default: null },
  expectedReturnDate: { type: Date, default: null },
  specs: { type: mongoose.Schema.Types.Mixed, default: {} },
  timeline: { type: [mongoose.Schema.Types.Mixed], default: [] },
  notes: { type: String, default: "", maxlength: 1200 },
  lifecycleStage: { 
    type: String, 
    enum: ["Procured", "In Use", "In Storage", "Under Maintenance", "Retired"], 
    default: "In Use" 
  },
  retirementDate: { type: Date, default: null },
  maintenanceCount: { type: Number, min: 0, default: 0 },
  downtimeHours: { type: Number, min: 0, default: 0 },
  repairCost: { type: Number, min: 0, default: 0 }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Pre-save synchronization of aliases
assetSchema.pre("validate", function(next) {
  if (this.cost && !this.value) this.value = this.cost;
  if (this.value && !this.cost) this.cost = this.value;
  if (this.assignedUser && !this.assignee) this.assignee = this.assignedUser;
  if (this.assignee && !this.assignedUser) this.assignedUser = this.assignee;
  if (this.warrantyExpiry && !this.warranty) this.warranty = this.warrantyExpiry;
  if (this.warranty && !this.warrantyExpiry) this.warrantyExpiry = this.warranty;
  if (this.serialNumber && !this.serial) this.serial = this.serialNumber;
  if (this.serial && !this.serialNumber) this.serialNumber = this.serial;
  
  if (this.status === "Assigned" && !this.assignee?.trim()) {
    this.assignee = "Assigned Faculty";
  }
  next();
});

export default mongoose.models.Asset || mongoose.model("Asset", assetSchema);
