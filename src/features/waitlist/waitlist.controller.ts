import { Request, Response } from "express";
import { logger } from "../../common/logger";
import { WaitlistService } from "./waitlist.service";

const waitlistService = new WaitlistService();

export const joinWaitlist = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const entry = await waitlistService.join({ email });
    res.status(201).json(entry);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Valid email is required") {
        return res.status(400).json({ error: error.message });
      }
      logger.error({ err: error }, "Waitlist controller: join failed");
    }
    res.status(500).json({ error: "Failed to join waitlist" });
  }
};

export const listWaitlist = async (_req: Request, res: Response) => {
  try {
    const entries = await waitlistService.list();
    res.json(entries);
  } catch (error) {
    logger.error({ err: error }, "Waitlist controller: list failed");
    res.status(500).json({ error: "Failed to list waitlist" });
  }
};
