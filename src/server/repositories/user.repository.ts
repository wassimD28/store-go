import { db } from "../../lib/db/db";
import { eq } from "drizzle-orm";
import { AppUser } from "@/lib/db";

export class UserRepository {
  static async update(id: string, data: Partial<typeof AppUser.$inferInsert>) {
    try {
      // Create the current timestamp for the updatedAt field
      const updatedAt = new Date();

      // Add updatedAt to the data being updated
      const updateData = {
        ...data,
        updated_at: updatedAt, // Adjusted to match the schema's updated_at field name
      };

      // Update the user in the database
      await db.update(AppUser).set(updateData).where(eq(AppUser.id, id));

      // Fetch and return the updated user record
      const updatedUser = await db.query.AppUser.findFirst({
        where: eq(AppUser.id, id),
      });

      return updatedUser;
    } catch (error) {
      console.error(`Error updating user with ID ${id}:`, error);
      throw new Error(`Failed to update user with ID ${id}`);
    }
  }

  static async findById(id: string) {
    try {
      const foundUser = await db.query.AppUser.findFirst({
        where: eq(AppUser.id, id),
        columns: {
          id: true,
          storeId: true,
          name: true,
          email: true,
          gender: true,
          age_range: true,
          status: true,
          created_at: true,
          updated_at: true,
          avatar: true,
          // Note: omit password by not including it here
        },
      });
      return foundUser;
    } catch (error) {
      console.error(`Error finding user with ID ${id}:`, error);
      throw new Error(`Failed to find user with ID ${id}`);
    }
  }
}
