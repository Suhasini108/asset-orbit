import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import mongoose from "mongoose";

import authRoutes from "./routes/auth.js";
import assetRoutes from "./routes/assets.js";
import subscriptionRoutes from "./routes/subscriptions.js";
import dashboardRoutes from "./routes/dashboard.js";
import ticketRoutes from "./routes/tickets.js";
import vendorRoutes from "./routes/vendors.js";
import featureRoutes from "./routes/features.js";
import notificationRoutes from "./routes/notifications.js";
import { authenticateToken, requireRole } from "./middleware/auth.js";
import { seedDemoData } from "./seedData.js";
import syncStore from "./syncStore.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ 
  origin: true, 
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
}));
app.use(express.json({ limit: "5mb" }));

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// Database Connection Helper with Serverless Connection Caching
let cachedDb = null;
export async function connectToDatabase() {
  if (cachedDb && mongoose.connection.readyState === 1) {
    return cachedDb;
  }
  const isVercel = Boolean(process.env.VERCEL || process.env.VERCEL_ENV);
  if (isVercel && !process.env.MONGODB_URI) {
    // In serverless environment without explicit remote Mongo URI, do not stall on 127.0.0.1
    return null;
  }
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/enterprise_assets_manager";
  try {
    cachedDb = await mongoose.connect(uri, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 2000
    });
    console.log("✓ MongoDB connected successfully");
    return cachedDb;
  } catch (err) {
    console.warn("MongoDB connection notice:", err.message);
    return null;
  }
}

// Auto-invoke connection for incoming requests
app.use(async (_req, _res, next) => {
  if (mongoose.connection.readyState !== 1) {
    await connectToDatabase().catch(() => {});
  }
  next();
});

// Health check endpoint
app.get("/api/health", (_req, res) => {
  const isConnected = mongoose.connection.readyState === 1;
  res.json({
    success: true,
    service: "AssetOrbit Enterprise API",
    database: isConnected ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development"
  });
});

// Global Multi-Client Synchronization Endpoints
app.get("/api/sync", (req, res) => {
  const since = req.query.since;
  const syncData = syncStore.getState(since);
  res.json({ success: true, ...syncData });
});

app.post("/api/sync/mutation", (req, res) => {
  const { type, payload, actor, role } = req.body || {};
  const result = syncStore.applyMutation({ type, payload, actor, role });
  res.json({ success: true, ...result });
});

app.post("/api/sync", (req, res) => {
  const body = req.body || {};
  if (body.type) {
    const result = syncStore.applyMutation(body);
    return res.json({ success: true, ...result });
  }
  if (body.assets) {
    const result = syncStore.applyMutation({ type: "BULK_SYNC", payload: body });
    return res.json({ success: true, ...result });
  }
  const syncData = syncStore.getState();
  res.json({ success: true, ...syncData });
});

// Application Routes
app.use("/api/auth", authRoutes);
app.use("/api/assets", assetRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/vendors", vendorRoutes);
app.use("/api/features", featureRoutes);
app.use("/api/notifications", notificationRoutes);

// Protected Database Seed Endpoint (Admin Only)
app.post("/api/demo/seed", authenticateToken, requireRole(["Admin"]), async (req, res, next) => {
  try {
    const result = await seedDemoData();
    res.status(200).json({ success: true, message: result });
  } catch (err) {
    next(err);
  }
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`
  });
});

// Global Error Handler
app.use((err, _req, res, _next) => {
  console.error("Server Error:", err);
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || "Tag";
    return res.status(409).json({ success: false, message: `A record with this unique ${field} already exists.` });
  }
  if (err.name === "ValidationError") {
    return res.status(400).json({ success: false, message: err.message });
  }
  if (err.name === "CastError") {
    return res.status(400).json({ success: false, message: "Invalid ID format provided." });
  }
  res.status(err.status || 500).json({ success: false, message: err.message || "Internal server error" });
});

// Start local listener only when executed directly (not inside Vercel serverless)
if (process.env.VERCEL !== "1" && !process.env.VERCEL_ENV) {
  connectToDatabase().finally(() => {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`✓ AssetOrbit API listening on http://localhost:${PORT}`);
    });
  });
}

export default app;
