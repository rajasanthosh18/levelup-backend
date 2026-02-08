import { asc, eq } from "drizzle-orm";
import { db } from "../../db/neonDB";
import { waitlist } from "../../db/schema";

export interface WaitlistEntry {
  id: number;
  email: string;
  createdAt: Date | null;
}

export interface CreateWaitlistData {
  email: string;
}

export class WaitlistDAO {
  async findByEmail(email: string): Promise<WaitlistEntry | null> {
    const result = await db
      .select()
      .from(waitlist)
      .where(eq(waitlist.email, email));
    return result.length > 0 ? result[0] : null;
  }

  async findAll(): Promise<WaitlistEntry[]> {
    return await db.select().from(waitlist).orderBy(asc(waitlist.createdAt));
  }

  async create(data: CreateWaitlistData): Promise<WaitlistEntry> {
    const result = await db.insert(waitlist).values(data).returning();
    return result[0];
  }
}
