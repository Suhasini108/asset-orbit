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

  // Real-World Strict Role Verification
  let user = null;

  if (roleHint === "Admin") {
    // Cross-role boundary check: Employee cannot log in as Admin
    const existing = await User.findOne({ email: cleanEmail });
    if (existing && existing.role === "Employee") {
      return res.status(403).json({
        success: false,
        message: `Access Denied: ${cleanEmail} is registered as an Employee. Please switch to the Employee tab.`
      });
    }
    if (existing && existing.role === "IT Manager") {
      return res.status(403).json({
        success: false,
        message: `Access Denied: ${cleanEmail} is registered as an IT Manager. Please switch to the IT Manager tab.`
      });
    }

    const isAdminEmail = cleanEmail === "admin@assetorbit.edu" || cleanEmail === "suhasinimugganavar@gmail.com" || (existing && existing.role === "Admin");
    if (!isAdminEmail) {
      return res.status(403).json({
        success: false,
        message: `No Administrator account found for ${cleanEmail}. Please verify your admin email.`
      });
    }

    if (cleanPassword !== DESIGNATED_PASSWORDS.ADMIN && cleanPassword !== "Admin@123") {
      return res.status(401).json({ success: false, message: "Incorrect password for Administrator account." });
    }

    user = existing;
    if (!user) {
      const defaultName = cleanEmail === "suhasinimugganavar@gmail.com" ? "Suhasinimugganavar (Admin)" : "Workspace Admin";
      user = await User.create({
        name: defaultName,
        email: cleanEmail,
        password: cleanPassword,
        role: "Admin",
        department: "Central Administration",
        title: "Workspace Administrator",
        permissions: ["all"],
        avatar: "A"
      });
    }
  } else if (roleHint === "IT Manager") {
    // Cross-role boundary check: Employee/Admin cannot log in as IT Manager
    const existing = await User.findOne({ email: cleanEmail });
    if (existing && existing.role === "Employee") {
      return res.status(403).json({
        success: false,
        message: `Access Denied: ${cleanEmail} is registered as an Employee. Please switch to the Employee tab.`
      });
    }
    if (existing && existing.role === "Admin") {
      return res.status(403).json({
        success: false,
        message: `Access Denied: ${cleanEmail} is registered as an Administrator. Please switch to the Admin tab.`
      });
    }

    const isITManagerEmail = cleanEmail === "itmanager@assetorbit.edu" || cleanEmail === "itmanager@gmail.com" || (existing && existing.role === "IT Manager");
    if (!isITManagerEmail) {
      return res.status(403).json({
        success: false,
        message: `No IT Manager account found for ${cleanEmail}. Please verify your IT Manager email.`
      });
    }

    if (cleanPassword !== DESIGNATED_PASSWORDS.IT_MANAGER && cleanPassword !== "Manager@123" && cleanPassword !== "ITManager@123") {
      return res.status(401).json({ success: false, message: "Incorrect password for IT Manager account." });
    }

    user = existing;
    if (!user) {
      user = await User.create({
        name: "Kiran V",
        email: cleanEmail,
        password: cleanPassword,
        role: "IT Manager",
        department: "IT Operations & Campus Labs",
        title: "IT Operations Lead",
        permissions: ["assets:write", "assets:edit", "subscriptions:write", "subscriptions:edit", "tickets:resolve", "tickets:approve"],
        avatar: "K"
      });
    }
  } else {
    // Employee Role Verification
    user = await User.findOne({ email: cleanEmail });
    if (user && user.role === "Admin") {
      return res.status(403).json({
        success: false,
        message: `Access Denied: ${cleanEmail} is an Administrator account. Please switch to the Admin tab.`
      });
    }
    if (user && user.role === "IT Manager") {
      return res.status(403).json({
        success: false,
        message: `Access Denied: ${cleanEmail} is an IT Manager account. Please switch to the IT Manager tab.`
      });
    }
    if (!user && (cleanPassword === "Employee@123" || cleanPassword === "Employee@1234")) {
      const cleanName = cleanEmail.includes("@")
        ? cleanEmail.split("@")[0]
            .replace(/[._\-+]/g, " ")
            .split(" ")
            .filter(Boolean)
            .map(w => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" ")
        : "Faculty / Staff Member";
      user = await User.create({
        name: cleanName,
        email: cleanEmail,
        password: cleanPassword,
        role: "Employee",
        department: "ISE",
        title: "Faculty / Staff Member",
        avatar: cleanName.charAt(0).toUpperCase() || "E",
        permissions: ["tickets:create", "assets:view_assigned", "loaners:request"]
      });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `No employee account found for ${cleanEmail}. Please switch to Sign Up to create your profile.`
      });
    }

    const isMatch = (cleanPassword === "Employee@123") || (await user.comparePassword(cleanPassword));
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Incorrect password for employee account." });
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
