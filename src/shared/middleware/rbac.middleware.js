const ROLE_HIERARCHY = { user: 1, moderator: 2, admin: 3, super_admin: 4 };

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return next(new Error("Not authenticated"));
    const hasRole = req.user.roles.some((r) => roles.includes(r));
    if (!hasRole) return res.status(403).json({ success: false, message: "Insufficient permissions", code: "FORBIDDEN" });
    next();
  };
}

export function requireMinRole(minRole) {
  return (req, res, next) => {
    if (!req.user) return next(new Error("Not authenticated"));
    const maxLevel = Math.max(...req.user.roles.map((r) => ROLE_HIERARCHY[r] || 0));
    if (maxLevel < ROLE_HIERARCHY[minRole]) {
      return res.status(403).json({ success: false, message: "Insufficient role level", code: "FORBIDDEN" });
    }
    next();
  };
}
