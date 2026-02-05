import { Request, Response } from "express";
import { logger } from "../../common/logger";
import { UsersService } from "./users.service";

const usersService = new UsersService();

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await usersService.getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = Array.isArray(id) ? id[0] : id;
    const user = await usersService.getUserById(parseInt(userId));

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    if (error instanceof Error && error.message === "Invalid user ID") {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Failed to fetch user" });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { email, name, password } = req.body;

    if (!password) {
      return res.status(400).json({ error: "Password is required" });
    }

    const user = await usersService.createUser({ email, name, password });
    res.status(201).json(user);
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.message.includes("Valid email") ||
        error.message.includes("already exists")
      ) {
        return res.status(400).json({ error: error.message });
      }
    }
    res.status(500).json({ error: "Failed to create user" });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = Array.isArray(id) ? id[0] : id;
    const { email, name } = req.body;

    logger.info(
      { userId: req.user?.id, targetUserId: userId, email },
      "User controller: Update user request",
    );

    const user = await usersService.updateUser(parseInt(userId), {
      email,
      name,
    });

    logger.info(
      { userId: req.user?.id, targetUserId: userId },
      "User controller: User updated successfully",
    );
    res.json(user);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "User not found") {
        return res.status(404).json({ error: error.message });
      }
      if (
        error.message.includes("Invalid user ID") ||
        error.message.includes("Valid email") ||
        error.message.includes("already taken")
      ) {
        return res.status(400).json({ error: error.message });
      }
    }
    res.status(500).json({ error: "Failed to update user" });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = Array.isArray(id) ? id[0] : id;

    logger.info(
      { userId: req.user?.id, targetUserId: userId },
      "User controller: Delete user request",
    );

    await usersService.deleteUser(parseInt(userId));

    logger.info(
      { userId: req.user?.id, deletedUserId: userId },
      "User controller: User deleted successfully",
    );
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "User not found") {
        return res.status(404).json({ error: error.message });
      }
      if (error.message === "Invalid user ID") {
        return res.status(400).json({ error: error.message });
      }
    }
    res.status(500).json({ error: "Failed to delete user" });
  }
};
