import { Router } from "express";
import { deleteUser, updateUser } from "./users.controller";

const router = Router();

// Note: Use /api/auth/signup for user registration instead of POST /api/users
// router.get("/", getUsers);
// router.get("/:id", getUserById);
// router.post("/", createUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;
