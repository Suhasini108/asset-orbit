import { Router } from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { authenticateToken } from "../middleware/auth.js";
import { writeAudit } from "../utils/audit.js";
import syncStore from "../syncStore.js";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "assetorbit_default_jwt_secret_dev_2026";

// Designated passwords matching requirements
const DESIGNATED_PASSWORDS = {
  ADMIN: "Admin@123",
  IT_MANAGER: "Manager@123",
  EMPLOYEE: "Employee@123"
};

/**
 * GET /api/auth/employees
 * Returns registered employees from canonical syncStore
 */
router.get("/employees", asyncHandler(async (_req, res) => {
  const employees = syncStore.getEmployees();
  res.json({ success: true, count: employees.length, data: employees });
}));

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

  // Check if exists in syncStore
  const existingInStore = syncStore.findEmployee(cleanEmail);
  if (existingInStore) {
    return res.status(409).json({ success: false, message: "An account with this email already exists." });
  }

  const newEmp = {
    id: `USR-EMP-${Date.now().toString().slice(-4)}`,
    name: cleanName,
    email: cleanEmail,
    password,
    role: "Employee",
    department: department || "Engineering Labs (CSE / ISE)",
    category: "Engineering",
    subBranch: department || "CSE",
    title: "Faculty / Staff Member",
    avatar: cleanName.charAt(0).toUpperCase() || "E",
    permissions: ["tickets:create", "assets:view_assigned", "loaners:request"]
  };

  syncStore.applyMutation({
    type: "EMPLOYEE_REGISTER",
    payload: { employee: newEmp },
    actor: cleanName,
    role: "Employee"
  });

  if (mongoose.connection.readyState === 1) {
    try {
      await User.create(newEmp);
    } catch (e) {}
  }

  const token = jwt.sign(
    {
      id: newEmp.id,
      name: newEmp.name,
      email: newEmp.email,
      role: newEmp.role,
      department: newEmp.department,
      permissions: newEmp.permissions
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  await writeAudit({
    action: "EMPLOYEE_REGISTERED",
    entityType: "User",
    entityId: newEmp.id,
    entityName: newEmp.name,
    actor: newEmp.name,
    role: "Employee",
    details: `New employee account created for ${cleanEmail}`
  });

  res.status(201).json({
    success: true,
    message: "Registration successful.",
    token,
    user: {
      id: newEmp.id,
      name: newEmp.name,
      email: newEmp.email,
      role: newEmp.role,
      department: newEmp.department,
      permissions: newEmp.permissions,
      avatar: newEmp.avatar
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

  if (roleHint === "Admin") {
    // Cross-role boundary check: Employee cannot log in as Admin
    const empMatch = syncStore.findEmployee(cleanEmail);
    if (empMatch) {
      return res.status(403).json({
        success: false,
        message: `Access Denied: ${cleanEmail} is registered as an Employee. Please switch to the Employee tab.`
      });
    }

    const isITManagerEmail = cleanEmail === "itmanager@assetorbit.edu" || cleanEmail === "itmanager@gmail.com";
    if (isITManagerEmail) {
      return res.status(403).json({
        success: false,
        message: `Access Denied: ${cleanEmail} is registered as an IT Manager. Please switch to the IT Manager tab.`
      });
    }

    const isAdminEmail = cleanEmail === "admin@assetorbit.edu" || cleanEmail === "suhasinimugganavar@gmail.com";
    if (!isAdminEmail) {
      return res.status(403).json({
        success: false,
        message: `No Administrator account found for ${cleanEmail}. Please verify your admin email.`
      });
    }

    if (cleanPassword !== DESIGNATED_PASSWORDS.ADMIN && cleanPassword !== "Admin@123") {
      return res.status(401).json({ success: false, message: "Incorrect password for Administrator account." });
    }

    const defaultName = cleanEmail === "suhasinimugganavar@gmail.com" ? "Suhasinimugganavar (Admin)" : "Workspace Admin";
    user = {
      id: "USR-001",
      name: defaultName,
      email: cleanEmail,
      role: "Admin",
      department: "Central Administration",
      title: "Workspace Administrator",
      permissions: ["all"],
      avatar: "A"
    };
  } else if (roleHint === "IT Manager") {
    // Cross-role boundary check: Employee/Admin cannot log in as IT Manager
    const empMatch = syncStore.findEmployee(cleanEmail);
    if (empMatch) {
      return res.status(403).json({
        success: false,
        message: `Access Denied: ${cleanEmail} is registered as an Employee. Please switch to the Employee tab.`
      });
    }

    const isAdminEmail = cleanEmail === "admin@assetorbit.edu" || cleanEmail === "suhasinimugganavar@gmail.com";
    if (isAdminEmail) {
      return res.status(403).json({
        success: false,
        message: `Access Denied: ${cleanEmail} is registered as an Administrator. Please switch to the Admin tab.`
      });
    }

    const isITManagerEmail = cleanEmail === "itmanager@assetorbit.edu" || cleanEmail === "itmanager@gmail.com";
    if (!isITManagerEmail) {
      return res.status(403).json({
        success: false,
        message: `No IT Manager account found for ${cleanEmail}. Please verify your IT Manager email.`
      });
    }

    if (cleanPassword !== DESIGNATED_PASSWORDS.IT_MANAGER && cleanPassword !== "Manager@123" && cleanPassword !== "ITManager@123") {
      return res.status(401).json({ success: false, message: "Incorrect password for IT Manager account." });
    }

    user = {
      id: "USR-002",
      name: "Kiran V",
      email: cleanEmail,
      role: "IT Manager",
      department: "IT Operations & Campus Labs",
      title: "IT Operations Lead",
      permissions: ["assets:write", "assets:edit", "subscriptions:write", "subscriptions:edit", "tickets:resolve", "tickets:approve"],
      avatar: "K"
    };
  } else {
    // Employee Role Verification
    const isAdminEmail = cleanEmail === "admin@assetorbit.edu" || cleanEmail === "suhasinimugganavar@gmail.com";
    if (isAdminEmail) {
      return res.status(403).json({
        success: false,
        message: `Access Denied: ${cleanEmail} is an Administrator account. Please switch to the Admin tab.`
      });
    }

    const isITManagerEmail = cleanEmail === "itmanager@assetorbit.edu" || cleanEmail === "itmanager@gmail.com";
    if (isITManagerEmail) {
      return res.status(403).json({
        success: false,
        message: `Access Denied: ${cleanEmail} is an IT Manager account. Please switch to the IT Manager tab.`
      });
    }

    // Check syncStore for employee
    let emp = syncStore.findEmployee(cleanEmail);

    if (!emp && (cleanPassword === "Employee@123" || cleanPassword === "Employee@1234")) {
      const cleanName = cleanEmail.includes("@")
        ? cleanEmail.split("@")[0]
            .replace(/[._\-+]/g, " ")
            .split(" ")
            .filter(Boolean)
            .map(w => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" ")
        : "Faculty / Staff Member";

      emp = {
        id: `USR-EMP-${Date.now().toString().slice(-4)}`,
        name: cleanName,
        email: cleanEmail,
        password: cleanPassword,
        role: "Employee",
        department: "Engineering",
        title: "Faculty / Staff Member",
        avatar: cleanName.charAt(0).toUpperCase() || "E",
        permissions: ["tickets:create", "assets:view_assigned", "loaners:request"]
      };

      syncStore.applyMutation({
        type: "EMPLOYEE_REGISTER",
        payload: { employee: emp },
        actor: cleanName,
        role: "Employee"
      });
    }

    if (!emp) {
      return res.status(404).json({
        success: false,
        message: `No employee account found for ${cleanEmail}. Please switch to Sign Up to create your profile.`
      });
    }

    const isMatch = (cleanPassword === "Employee@123" || cleanPassword === emp.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Incorrect password for employee account." });
    }

    user = emp;
  }

  // Issue Cryptographically Signed JWT Token
  const token = jwt.sign(
    {
      id: user.id || user._id,
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
    entityId: String(user.id || user._id),
    entityName: user.name,
    actor: user.name,
    role: user.role,
    details: `Signed in as ${user.role} (${user.email})`
  });

  res.json({
    success: true,
    token,
    user: {
      id: user.id || user._id,
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
  if (req.user) {
    return res.json({ success: true, user: req.user });
  }
  res.status(404).json({ success: false, message: "User account no longer found." });
}));

export default router;
