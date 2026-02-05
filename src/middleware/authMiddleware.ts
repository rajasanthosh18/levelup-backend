import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { logger } from "../common/logger";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    iat?: number;
    exp?: number;
  };
}

/**
 * Core JWT verification middleware
 * Use this directly when you need to enforce authentication on specific routes
 */
export const requireAuth = (
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

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    req.user = {
      id: decoded.id,
      email: decoded.email,
      iat: decoded.iat,
      exp: decoded.exp,
    };

    logger.info(
      { userId: decoded.id, email: decoded.email, path: req.path },
      "Auth middleware: Token verified",
    );

    next();
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : "Unknown error",
        ip: req.ip,
        path: req.path,
      },
      "Auth middleware: Token verification failed",
    );

    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: "Token expired" });
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: "Invalid token" });
    }

    res.status(401).json({ error: "Unauthorized" });
  }
};

/**
 * Common application middleware that conditionally applies authentication
 * - If request path starts with /api, authentication is required
 * - Otherwise, authentication is skipped
 *
 * This middleware should be applied globally in app.ts
 * Usage in app.ts: app.use(commonAuthMiddleware);
 */
export const commonAuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Check if the request path starts with /api
  if (req.path.startsWith("/api")) {
    // Apply authentication for /api routes
    return requireAuth(req, res, next);
  }

  // Skip authentication for non-/api routes
  logger.debug({ path: req.path }, "Skipping auth for non-API route");
  next();
};
