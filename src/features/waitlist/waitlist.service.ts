import { logger } from "../../common/logger";
import {
  CreateWaitlistData,
  WaitlistDAO,
  WaitlistEntry,
} from "./waitlist.dao";

export class WaitlistService {
  private waitlistDAO: WaitlistDAO;

  constructor() {
    this.waitlistDAO = new WaitlistDAO();
  }

  private isValidEmail(email: string): boolean {
    return typeof email === "string" && email.includes("@") && email.length > 0;
  }

  /**
   * Join the waitlist. Idempotent: if email is already on the list,
   * returns the existing entry without error or duplicate insert.
   */
  async join(data: CreateWaitlistData): Promise<WaitlistEntry> {
    const trimmedEmail = data.email?.trim();
    if (!trimmedEmail || !this.isValidEmail(trimmedEmail)) {
      throw new Error("Valid email is required");
    }

    const existing = await this.waitlistDAO.findByEmail(trimmedEmail);
    if (existing) {
      logger.info(
        { email: trimmedEmail },
        "Waitlist: join requested for already registered email",
      );
      return existing;
    }

    const entry = await this.waitlistDAO.create({ email: trimmedEmail });
    logger.info(
      { email: entry.email, waitlistId: entry.id },
      "Waitlist: new signup",
    );
    return entry;
  }

  async list(): Promise<WaitlistEntry[]> {
    return await this.waitlistDAO.findAll();
  }
}
