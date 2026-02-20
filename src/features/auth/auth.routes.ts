import { Router } from "express";
import { verify } from "./auth.controller";

const router = Router();

router.get("/verify", verify);

export default router;
