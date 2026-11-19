import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "assetorbit_default_jwt_secret_dev_2026";

/**
 * Middleware: Verify Bearer JWT Token and populate req.user
 */
export function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"] || req.headers["Authorization"];
  const token = authHeader && authHeader.startsWith("Bearer ") 
    ? authHeader.slice(7).trim() 
    : (req.query && req.query.token);

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: "Authentication required. Please sign in to access this resource." 
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = {
      id: decoded.id || decoded.sub,
      name: decoded.name,
      email: decoded.email,
      role: decoded.role,
      department: decoded.department,
      permissions: decoded.permissions || []
    };
    next();
  } catch (err) {
    return res.status(401).json({ 
      success: false, 
      message: "Session expired or invalid token. Please sign in again." 
    });
  }
}

/**
 * Middleware: Enforce Role-Based Access Control
 * e.g., requireRole(['Admin']) or requireRole(['Admin', 'IT Manager'])
 */
export function requireRole(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Authentication required." });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `Forbidden: Access restricted. Role '${req.user.role}' is not authorized for this action.` 
      });
    }
    next();
  };
}

/**
 * Middleware: Optional Authentication (attaches req.user if token present, proceeds if absent)
 */
export function optionalAuth(req, _res, next) {
  const authHeader = req.headers["authorization"] || req.headers["Authorization"];
  const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;
  if (token) {
    try {
      req.user = jwt.verify(token, JWT_SECRET);
    } catch (e) {
      req.user = null;
    }
  }
  next();
}
