import { pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";

export const waitlist = pgTable("waitlist", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
