import { Context } from "hono";
import { UserRepository, UserCreateInput, UserUpdateInput } from "@/server/repositories/user.repository";

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
      const body = await c.req.json();

      const requiredFields = ["name", "email"];
      for (const field of requiredFields) {
        if (!(field in body)) {
          return c.json({
            status: "error",
            message: `Missing required field: ${field}`
          }, 400);
        }
      }

      const userData: UserCreateInput = {
        name: body.name,
        email: body.email,
        description: body.description || "",
        status: body.status || true
      };

      const newUser = await UserRepository.create(userData);

      return c.json({
        status: "success",
        message: "User created successfully",
        data: newUser
      }, 201);
    } catch (error) {
      console.error("Error in createUser:", error);
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