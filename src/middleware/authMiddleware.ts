import { NextFunction, Request, Response } from "express";
import { logger } from "../common/logger";
import { AuthService } from "../features/auth/auth.service";

const authService = new AuthService();

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

/**
 * Core token verification middleware using Supabase
 */
export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      logger.warn(
        { ip: req.ip, path: req.path },
        "Auth middleware: No token provided",
      );
      return res.status(401).json({ error: "No authorization token provided" });
    }

    const user = await authService.verifyToken(token);

    if (!user) {
      logger.error(
        { ip: req.ip, path: req.path },
        "Auth middleware: Token verification failed",
      );
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    req.user = {
      id: user.id,
      email: user.email,
    };

    logger.info(
      { userId: user.id, email: user.email, path: req.path },
      "Auth middleware: Token verified via Supabase",
    );

    next();
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : "Unknown error",
        ip: req.ip,
        path: req.path,
      },
      "Auth middleware: Unexpected error during verification",
    );

    res.status(401).json({ error: "Unauthorized" });
  }
};

/**
 * Common application middleware that conditionally applies authentication
 * - If request path starts with /api/auth, skip auth (login/verify routes)
 * - If request path starts with /api, authentication is required
 * - Otherwise, authentication is skipped
 */
export const commonAuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (req.path.startsWith("/api/auth")) {
    return next();
  }
  if (req.path.startsWith("/api")) {
    return requireAuth(req, res, next);
  }
  logger.debug({ path: req.path }, "Skipping auth for non-API route");
  next();
};
