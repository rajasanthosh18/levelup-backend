import { Router } from "express";
import { joinWaitlist, listWaitlist } from "./waitlist.controller";

const router = Router();

router.post("/", joinWaitlist);
router.get("/", listWaitlist);

export default router;
