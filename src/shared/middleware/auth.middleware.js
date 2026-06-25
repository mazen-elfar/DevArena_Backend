import { verifyAccessToken } from "../utils/crypto.js";
import { getPrisma } from "../../config/database.js";
import { Errors } from "../errors/error-definitions.js";

export async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) throw Errors.Unauthorized();

    const token = header.slice(7);
    const payload = verifyAccessToken(token);

    const prisma = getPrisma();
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true
                  }
                }
              }
            }
          }
        },
        profile: true
      },
    });

    if (!user || user.deletedAt) {
      throw Errors.Unauthorized("Account is not available");
    }

    const roles = user.roles.map((ur) => ur.role.name);
    const permissions = [...new Set(
      user.roles.flatMap(ur =>
        ur.role.permissions.map(rp => rp.permissionId)
      )
    )];

    // Convert BigInt fields in profile if they exist
    const profile = user.profile ? {
      ...user.profile,
      currentXP: typeof user.profile.currentXP === 'bigint' ? Number(user.profile.currentXP) : user.profile.currentXP,
      totalXP: typeof user.profile.totalXP === 'bigint' ? Number(user.profile.totalXP) : user.profile.totalXP,
    } : null;

    req.user = {
      id: user.id,
      email: user.email,
      profile, // Include full profile for frontend guards
      roles,
      permissions,
    };
    next();
  } catch (error) {
    if (error.isOperational) return next(error);
    next(Errors.Unauthorized("Invalid or expired token"));
  }
}

export function optionalAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return next();
  return authenticate(req, res, next);
}
