// src/server/repositories/user.repository.ts
import { db } from "../../lib/db/db";
import { eq } from "drizzle-orm";
import * as schema from "../../lib/db/schema";

export interface UserCreateInput {
  name: string;
  email: string;
  description?: string;
  status?: boolean;
}

export interface UserUpdateInput {
  name?: string;
  email?: string;
  description?: string;
  status?: boolean;
}

export class UserRepository {
  static async findAll() {
    try {
      return await db.query.AppUser.findMany();
    } catch (error) {
      console.error("Error fetching users:", error);
      throw new Error("Failed to fetch users");
    }
  }

  static async findById(id: number) {
    try {
      return await db.query.AppUser.findFirst({
        where: eq(schema.AppUser.id, id)
      });
    } catch (error) {
      console.error(`Error fetching user with ID ${id}:`, error);
      throw new Error(`Failed to fetch user with ID ${id}`);
    }
  }

  static async create(data: UserCreateInput) {
    try {
      const result = await db.insert(schema.AppUser).values(data).returning();
      return result[0];
    } catch (error) {
      console.error("Error creating user:", error);
      throw new Error("Failed to create user");
    }
  }

  static async update(id: number, data: UserUpdateInput) {
    try {
      const result = await db
        .update(schema.AppUser)
        .set({ ...data, updated_at: new Date() })
        .where(eq(schema.AppUser.id, id))
        .returning();
      return result[0];
    } catch (error) {
      console.error(`Error updating user with ID ${id}:`, error);
      throw new Error(`Failed to update user with ID ${id}`);
    }
  }

  static async delete(id: number) {
    try {
      return await db
        .delete(schema.AppUser)
        .where(eq(schema.AppUser.id, id))
        .returning();
    } catch (error) {
      console.error(`Error deleting user with ID ${id}:`, error);
      throw new Error(`Failed to delete user with ID ${id}`);
    }
  }
}