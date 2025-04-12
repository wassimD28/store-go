import { Context } from "hono";
import { AddressRepository } from "@/server/repositories/address.repository";
import { idSchema } from "../schemas/common.schema";
import {
  createAddressSchema,
  updateAddressSchema,
} from "../schemas/address.schema";

export class AddressController {
  static async getAllAddresses(c: Context) {
    try {
      const { id: userId } = c.get("user");
      const addresses = await AddressRepository.findAll(userId);

      return c.json({
        status: "success",
        data: addresses,
      });
    } catch (error) {
      console.error("Error in getAllAddresses:", error);
      return c.json(
        {
          status: "error",
          message: "Failed to fetch addresses",
        },
        500,
      );
    }
  }

  static async getAddressById(c: Context) {
    try {
      const addressId = c.req.param("addressId");
      // Validate address ID
      const validId = idSchema.safeParse(addressId);
      if (!validId.success) {
        return c.json(
          {
            status: "error",
            message: "Invalid address ID",
          },
          400,
        );
      }

      const { id: userId } = c.get("user");
      const address = await AddressRepository.findById(addressId, userId);

      if (!address) {
        return c.json(
          {
            status: "error",
            message: "Address not found",
          },
          404,
        );
      }

      return c.json({
        status: "success",
        data: address,
      });
    } catch (error) {
      console.error("Error in getAddressById:", error);
      return c.json(
        {
          status: "error",
          message: "Failed to fetch address",
        },
        500,
      );
    }
  }

  static async createAddress(c: Context) {
    try {
      // Get user data from authenticated context
      const { id: userId, storeId } = c.get("user");

      // Check if the request has content before trying to parse it
      const contentType = c.req.header("Content-Type");
      const contentLength = parseInt(c.req.header("Content-Length") || "0");

      // Check if the request body is empty
      if (
        !contentType ||
        !contentType.includes("application/json") ||
        contentLength === 0
      ) {
        return c.json(
          {
            status: "error",
            message: "Request body is required and must be JSON format",
          },
          400,
        );
      }

      // Try to parse the body with error handling
      let body;
      try {
        body = await c.req.json();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        return c.json(
          {
            status: "error",
            message: "Invalid JSON in request body",
          },
          400,
        );
      }

      // Check if body is empty after parsing
      if (!body || Object.keys(body).length === 0) {
        return c.json(
          {
            status: "error",
            message: "Address data is required",
          },
          400,
        );
      }

      // Parse and validate request body
      const validatedData = createAddressSchema.safeParse({
        ...body,
        app_user_id: userId,
        storeId,
      });

      if (!validatedData.success) {
        return c.json(
          {
            status: "error",
            message: "Invalid address data",
            errors: validatedData.error.format(),
          },
          400,
        );
      }

      const newAddress = await AddressRepository.create(validatedData.data);

      return c.json(
        {
          status: "success",
          message: "Address created successfully",
          data: newAddress,
        },
        201,
      );
    } catch (error) {
      console.error("Error in createAddress:", error);
      return c.json(
        {
          status: "error",
          message: "Failed to create address",
        },
        500,
      );
    }
  }

  static async updateAddress(c: Context) {
    try {
      const addressId = c.req.param("addressId");
      // Validate address ID
      const validId = idSchema.safeParse(addressId);
      if (!validId.success) {
        return c.json(
          {
            status: "error",
            message: "Invalid address ID",
          },
          400,
        );
      }

      // Get user data from authenticated context
      const { id: userId } = c.get("user");

      // Check if the request has content before trying to parse it
      const contentType = c.req.header("Content-Type");
      const contentLength = parseInt(c.req.header("Content-Length") || "0");

      // Check if the request body is empty
      if (
        !contentType ||
        !contentType.includes("application/json") ||
        contentLength === 0
      ) {
        return c.json(
          {
            status: "error",
            message: "Request body is required and must be JSON format",
          },
          400,
        );
      }

      // Check if address exists and belongs to the user
      const existingAddress = await AddressRepository.findById(
        addressId,
        userId,
      );
      if (!existingAddress) {
        return c.json(
          {
            status: "error",
            message: "Address not found",
          },
          404,
        );
      }

      // Parse and validate request body
      let body;
      try {
        body = await c.req.json();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        return c.json(
          {
            status: "error",
            message: "Invalid JSON in request body",
          },
          400,
        );
      }

      // Check for typos in field names by using strict validation
      const updateSchema = updateAddressSchema
        .strict()
        .refine((data) => Object.keys(data).length > 0, {
          message: "At least one field must be provided for update",
        });

      const validatedData = updateSchema.safeParse(body);
      if (!validatedData.success) {
        return c.json(
          {
            status: "error",
            message: "Invalid address data",
            errors: validatedData.error.format(),
          },
          400,
        );
      }

      // Update the address
      const updatedAddress = await AddressRepository.update(
        addressId,
        validatedData.data,
      );

      return c.json({
        status: "success",
        message: "Address updated successfully",
        data: updatedAddress,
      });
    } catch (error) {
      console.error("Error in updateAddress:", error);
      return c.json(
        {
          status: "error",
          message: "Failed to update address",
        },
        500,
      );
    }
  }

  static async deleteAddress(c: Context) {
    try {
      const addressId = c.req.param("addressId");
      // Validate address ID
      const validId = idSchema.safeParse(addressId);
      if (!validId.success) {
        return c.json(
          {
            status: "error",
            message: "Invalid address ID",
          },
          400,
        );
      }

      // Get user data from authenticated context
      const { id: userId } = c.get("user");

      // Check if address exists and belongs to the user
      const existingAddress = await AddressRepository.findById(
        addressId,
        userId,
      );
      if (!existingAddress) {
        return c.json(
          {
            status: "error",
            message: "Address not found",
          },
          404,
        );
      }

      // Delete the address
      await AddressRepository.delete(addressId);

      return c.json({
        status: "success",
        message: "Address deleted successfully",
      });
    } catch (error) {
      console.error("Error in deleteAddress:", error);
      return c.json(
        {
          status: "error",
          message: "Failed to delete address",
        },
        500,
      );
    }
  }
}
