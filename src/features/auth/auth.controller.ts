import { Request, Response } from "express";
import { AuthService } from "./auth.service";

const authService = new AuthService();

export const verify = async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  const user = await authService.verifyToken(token);
  if (!user) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  res.json({
    user: { id: user.id, email: user.email, name: user.name },
  });
};
