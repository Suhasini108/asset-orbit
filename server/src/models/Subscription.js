import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 140 },
  category: { 
    type: String, 
    default: "Engineering & Technical Computing" 
  },
  plan: { type: String, trim: true, default: "Campuswide Suite R2025B", maxlength: 100 },
  vendor: { type: String, trim: true, default: "MathWorks", maxlength: 100 },
  owner: { type: String, required: true, trim: true, maxlength: 120, default: "ISE Department HOD" },
  department: { 
    type: String, 
    required: true, 
    default: "ISE" 
  },
  billing: { type: String, enum: ["Monthly", "Yearly"], default: "Yearly" },
  billingCycle: { type: String, enum: ["Monthly", "Yearly"], default: "Yearly" },
  cost: { type: Number, required: true, min: 0 },
  renewal: { type: Date, default: null },
  renewalDate: { type: Date, default: null },
  status: { type: String, enum: ["Active", "Pending", "Cancelled", "Under Review"], default: "Active" },
  paid: { type: String, default: "yes" },
  cancelled: { type: String, default: "No" },
  seats: { type: Number, min: 1, default: 100 },
  assignedSeats: { type: Number, min: 0, default: 10 },
  paymentMethod: { type: String, default: "Purchase Order / Institutional Wire" },
  autoRenew: { type: Boolean, default: true },
  previousCost: { type: Number, default: 0 },
  priceHikeHistory: { type: [mongoose.Schema.Types.Mixed], default: [] },
  notes: { type: String, default: "", maxlength: 1000 }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

subscriptionSchema.pre("validate", function(next) {
  if (this.billingCycle && !this.billing) this.billing = this.billingCycle;
  if (this.billing && !this.billingCycle) this.billingCycle = this.billing;
  if (this.renewalDate && !this.renewal) this.renewal = this.renewalDate;
  if (this.renewal && !this.renewalDate) this.renewalDate = this.renewal;
  next();
});

export default mongoose.models.Subscription || mongoose.model("Subscription", subscriptionSchema);
