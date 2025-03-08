import { Context } from "hono";
import { UserRepository, UserCreateInput, UserUpdateInput } from "@/server/repositories/user.repository";
import { UserValidator } from "../validations/validator/user.validator";
import { ValidationError } from "../validations/errors/validation.error";

export class UserController {
  static async getAllUsers(c: Context) {
    try {
      const users = await UserRepository.findAll();
      return c.json({
        status: "success",
        data: users
      });
    } catch (error) {
      console.error("Error in getAllUsers:", error);
      return c.json({
        status: "error",
        message: "Failed to fetch users"
      }, 500);
    }
  }

  static async getUserById(c: Context) {
    try {
      const id = parseInt(c.req.param("id"));
      if (isNaN(id)) {
        return c.json({
          status: "error",
          message: "Invalid user ID"
        }, 400);
      }

      const user = await UserRepository.findById(id);
      if (!user) {
        return c.json({
          status: "error",
          message: "User not found"
        }, 404);
      }

      return c.json({
        status: "success",
        data: user
      });
    } catch (error) {
      console.error("Error in getUserById:", error);
      return c.json({
        status: "error",
        message: "Failed to fetch user"
      }, 500);
    }
  }

  static async createUser(c: Context) {
    try {
      const validatedData = await UserValidator.validateCreate(c);
      
      const newUser = await UserRepository.create(validatedData);

      return c.json({
        status: "success",
        message: "User created successfully",
        data: newUser
      }, 201);
    } catch (error : any) {
      console.error("Error in createUser:", error);

      // Handle ValidationError specifically
      if (error instanceof ValidationError) {
        return c.json({
          status: "error",
          message: error.message,
          errors: error.errors
        }, 400);
      }

      // Handle other errors
      return c.json({
        status: "error",
        message: "Failed to create user"
      }, 500);
    }
  }

  static async updateUser(c: Context) {
    try {
      const id = parseInt(c.req.param("id"));
      if (isNaN(id)) {
        return c.json({
          status: "error",
          message: "Invalid user ID"
        }, 400);
      }

      const body = await c.req.json();
      const updateData: UserUpdateInput = {};

      if ("name" in body) updateData.name = body.name;
      if ("email" in body) updateData.email = body.email;
      if ("description" in body) updateData.description = body.description;
      if ("status" in body) updateData.status = body.status;

      if (Object.keys(updateData).length === 0) {
        return c.json({
          status: "error",
          message: "No valid fields provided for update"
        }, 400);
      }

      const existingUser = await UserRepository.findById(id);
      if (!existingUser) {
        return c.json({
          status: "error",
          message: "User not found"
        }, 404);
      }

      const updatedUser = await UserRepository.update(id, updateData);

      return c.json({
        status: "success",
        message: "User updated successfully",
        data: updatedUser
      });
    } catch (error) {
      console.error("Error in updateUser:", error);
      return c.json({
        status: "error",
        message: "Failed to update user"
      }, 500);
    }
  }

  static async deleteUser(c: Context) {
    try {
      const id = parseInt(c.req.param("id"));
      if (isNaN(id)) {
        return c.json({
          status: "error",
          message: "Invalid user ID"
        }, 400);
      }

      const existingUser = await UserRepository.findById(id);
      if (!existingUser) {
        return c.json({
          status: "error",
          message: "User not found"
        }, 404);
      }

      await UserRepository.delete(id);

      return c.json({
        status: "success",
        message: "User deleted successfully"
      });
    } catch (error) {
      console.error("Error in deleteUser:", error);
      return c.json({
        status: "error",
        message: "Failed to delete user"
      }, 500);
    }
  }
}