import { Router } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { authenticateToken } from "../middleware/auth.js";
import { writeAudit } from "../utils/audit.js";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "assetorbit_default_jwt_secret_dev_2026";

// Designated passwords matching requirements
const DESIGNATED_PASSWORDS = {
  ADMIN: "Admin@123",
  IT_MANAGER: "Manager@123"
};

/**
 * POST /api/auth/register
 * Employee Self-Service Signup
 */
router.post("/register", asyncHandler(async (req, res) => {
  const { name, email, password, department } = req.body;
  const cleanEmail = (email || "").trim().toLowerCase();
  const cleanName = (name || "").trim();

  if (!cleanEmail || !password || !cleanName) {
    return res.status(400).json({ success: false, message: "Name, email, and password are required." });
  }

  const existing = await User.findOne({ email: cleanEmail });
  if (existing) {
    return res.status(409).json({ success: false, message: "An account with this email already exists." });
  }

  const newUser = await User.create({
    name: cleanName,
    email: cleanEmail,
    password, // Hashed automatically by pre-save hook
    role: "Employee", // Public signup is restricted to Employee role only
    department: department || "Engineering Labs (CSE / ISE)",
    title: "Faculty / Staff Member",
    avatar: cleanName.charAt(0).toUpperCase() || "E",
    permissions: ["tickets:create", "assets:view_assigned", "loaners:request"]
  });

  const token = jwt.sign(
    {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      department: newUser.department,
      permissions: newUser.permissions
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  await writeAudit({
    action: "EMPLOYEE_REGISTERED",
    entityType: "User",
    entityId: String(newUser._id),
    entityName: newUser.name,
    actor: newUser.name,
    role: "Employee",
    details: `New employee account created for ${cleanEmail}`
  });

  res.status(201).json({
    success: true,
    message: "Registration successful.",
    token,
    user: {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      department: newUser.department,
      permissions: newUser.permissions,
      avatar: newUser.avatar
    }
  });
}));

/**
 * POST /api/auth/login
 * Unified Login supporting Admin, IT Manager, and Employees
 */
router.post("/login", asyncHandler(async (req, res) => {
  const { email, password, roleHint } = req.body;
  const cleanEmail = (email || "").trim().toLowerCase();
  const cleanPassword = (password || "").trim();

  if (!cleanPassword) {
    return res.status(400).json({ success: false, message: "Password is required." });
  }

  let user = null;
  let targetRole = null;

  // A. Check for Designated Workspace Passwords
  if (cleanPassword === DESIGNATED_PASSWORDS.ADMIN || (cleanPassword === "Admin@123" && roleHint === "Admin")) {
    targetRole = "Admin";
  } else if (cleanPassword === DESIGNATED_PASSWORDS.IT_MANAGER || (cleanPassword === "Manager@123" && roleHint === "IT Manager")) {
    targetRole = "IT Manager";
  }

  if (targetRole) {
    // Look up or initialize workspace role account
    const lookupEmail = cleanEmail || (targetRole === "Admin" ? "admin@assetorbit.edu" : "itmanager@assetorbit.edu");
    user = await User.findOne({ email: lookupEmail });
    if (!user) {
      // Upsert designated user if not existing in this database instance
      const defaultName = targetRole === "Admin" ? "Workspace Admin" : "Kiran V (IT Lead)";
      const defaultDept = targetRole === "Admin" ? "Central Administration" : "IT Operations & Campus Labs";
      const defaultPerms = targetRole === "Admin" ? ["all"] : ["assets:write", "assets:edit", "subscriptions:write", "subscriptions:edit", "tickets:resolve", "tickets:approve"];
      
      user = await User.create({
        name: defaultName,
        email: lookupEmail,
        password: cleanPassword,
        role: targetRole,
        department: defaultDept,
        title: targetRole === "Admin" ? "System Administrator" : "IT Operations Lead",
        permissions: defaultPerms,
        avatar: targetRole === "Admin" ? "A" : "K"
      });
    }
  } else {
    // B. Employee / Regular Account Verification
    user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }
    const isMatch = await user.comparePassword(cleanPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }
  }

  // Issue Cryptographically Signed JWT Token
  const token = jwt.sign(
    {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      permissions: user.permissions
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  await writeAudit({
    action: "USER_LOGIN",
    entityType: "User",
    entityId: String(user._id),
    entityName: user.name,
    actor: user.name,
    role: user.role,
    details: `Signed in as ${user.role} (${user.email})`
  });

  res.json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      permissions: user.permissions,
      avatar: user.avatar || user.name.charAt(0).toUpperCase()
    }
  });
}));

/**
 * GET /api/auth/me
 * Returns current authenticated user session
 */
router.get("/me", authenticateToken, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  if (!user) {
    return res.status(404).json({ success: false, message: "User account no longer found." });
  }
  res.json({ success: true, user });
}));

export default router;
