import { uuid, pgTable, text } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users_table", {
  id: uuid("id").primaryKey().unique().defaultRandom().notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  profileImageUrl: text("profile_image_url").notNull(),
});
