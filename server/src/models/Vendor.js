import mongoose from "mongoose";

const vendorSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, unique: true, maxlength: 100 },
  contactPerson: { type: String, trim: true, default: "", maxlength: 100 },
  email: { type: String, trim: true, lowercase: true, default: "", maxlength: 120 },
  phone: { type: String, trim: true, default: "", maxlength: 40 },
  rating: { type: Number, min: 1, max: 5, default: 4.5 },
  category: { type: String, trim: true, default: "Hardware & IT Equipment" },
  address: { type: String, trim: true, default: "" },
  notes: { type: String, default: "" }
}, { timestamps: true });

export default mongoose.models.Vendor || mongoose.model("Vendor", vendorSchema);
