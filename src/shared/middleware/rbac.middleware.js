const ROLE_HIERARCHY = { 
  USER: 1, 
  PREMIUM: 2, 
  MODERATOR: 3, 
  ADMIN: 4, 
  SUPER_ADMIN: 5 
};

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ success: false, message: "Not authenticated" });
    const hasRole = req.user.roles.some((r) => roles.includes(r));
    if (!hasRole) return res.status(403).json({ success: false, message: "Insufficient permissions", code: "FORBIDDEN" });
    next();
  };
}

export function requireMinRole(minRole) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ success: false, message: "Not authenticated" });
    const maxLevel = Math.max(...req.user.roles.map((r) => ROLE_HIERARCHY[r] || 0));
    if (maxLevel < (ROLE_HIERARCHY[minRole] || 0)) {
      return res.status(403).json({ success: false, message: "Insufficient role level", code: "FORBIDDEN" });
    }
    next();
  };
}

export function requirePermission(...permissions) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ success: false, message: "Not authenticated" });
    
    const hasPermission = permissions.every(p => req.user.permissions.includes(p));
    if (!hasPermission) {
      return res.status(403).json({ 
        success: false, 
        message: "Missing required permissions", 
        code: "PERMISSION_DENIED",
        required: permissions
      });
    }
    next();
  };
}

export function requireAnyPermission(...permissions) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ success: false, message: "Not authenticated" });
    const hasAny = permissions.some(p => req.user.permissions.includes(p));
    if (!hasAny) {
      return res.status(403).json({ 
        success: false, 
        message: "Missing required permissions", 
        code: "PERMISSION_DENIED" 
      });
    }
    next();
  };
}
