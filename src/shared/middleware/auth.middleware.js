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

    if (!user || user.status === 'BANNED' || user.deletedAt) {
      throw Errors.Unauthorized("Account is not available");
    }

    const roles = user.roles.map((ur) => ur.role.name);
    const permissions = [...new Set(
      user.roles.flatMap(ur => 
        ur.role.permissions.map(rp => rp.permission.slug)
      )
    )];

    req.user = {
      id: user.id,
      profileId: user.profile?.id,
      email: user.email,
      roles,
      permissions,
      status: user.status
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
