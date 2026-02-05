import { NextFunction, Request, Response } from "express";
import { AuthService } from "../features/auth/auth.service";

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
  };
}

const authService = new AuthService();

export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  const decoded = authService.verifyToken(token);
  if (!decoded) {
    return res.status(403).json({ error: "Invalid or expired token" });
  }

  req.user = decoded;
  next();
};
