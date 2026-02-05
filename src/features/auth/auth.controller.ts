import { Request, Response } from "express";
import { AuthService } from "./auth.service";

const authService = new AuthService();

export const signup = async (req: Request, res: Response) => {
  try {
    const { email, name, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    const result = await authService.signup({
      email,
      name,
      password,
    });

    res.status(201).json({
      message: "User registered successfully",
      user: result.user,
      token: result.token,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.message.includes("Valid email") ||
        error.message.includes("already exists") ||
        error.message.includes("password")
      ) {
        return res.status(400).json({ error: error.message });
      }
    }
    res.status(500).json({ error: "Failed to register user" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const result = await authService.login(email, password);

    if (!result) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    res.json({
      message: "Login successful",
      user: result.user,
      token: result.token,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Invalid email or password") {
        return res.status(401).json({ error: error.message });
      }
    }
    res.status(500).json({ error: "Login failed" });
  }
};
