import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true, 
    trim: true, 
    maxlength: 160 
  },
  password: { type: String, required: true, minlength: 6 },
  role: { 
    type: String, 
    enum: ["Admin", "IT Manager", "Employee"], 
    required: true, 
    default: "Employee" 
  },
  department: { type: String, trim: true, default: "Engineering Labs (CSE / ISE)" },
  title: { type: String, trim: true, default: "Faculty / Staff Member" },
  avatar: { type: String, default: "U" },
  permissions: { type: [String], default: [] },
  assignedAssets: { type: [String], default: [] },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Pre-save password hashing
userSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Instance method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.models.User || mongoose.model("User", userSchema);
