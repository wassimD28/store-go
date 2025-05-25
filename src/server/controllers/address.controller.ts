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
      const { id: userId, storeId } = c.get("user");
      const addresses = await AddressRepository.findAll(userId, storeId);

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

      const { id: userId, storeId } = c.get("user");
      const address = await AddressRepository.findById(
        addressId,
        userId,
        storeId,
      );

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
      const { id: userId, storeId } = c.get("user");

      const contentType = c.req.header("Content-Type");
      const contentLength = parseInt(c.req.header("Content-Length") || "0");

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

      let body;
      try {
        body = await c.req.json();
      } catch (error) {
        return c.json(
          {
            status: "error",
            message: "Invalid JSON in request body",
          },
          400,
        );
      }

      if (!body || Object.keys(body).length === 0) {
        return c.json(
          {
            status: "error",
            message: "Address data is required",
          },
          400,
        );
      }

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

      const { id: userId, storeId } = c.get("user");

      const existingAddress = await AddressRepository.findById(
        addressId,
        userId,
        storeId,
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

      const contentType = c.req.header("Content-Type");
      const contentLength = parseInt(c.req.header("Content-Length") || "0");

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

      let body;
      try {
        body = await c.req.json();
      } catch (error) {
        return c.json(
          {
            status: "error",
            message: "Invalid JSON in request body",
          },
          400,
        );
      }

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
      const updatedAddress = await AddressRepository.update(
        addressId,
        validatedData.data,
        userId,
        storeId,
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

      const { id: userId, storeId } = c.get("user");

      const existingAddress = await AddressRepository.findById(
        addressId,
        userId,
        storeId,
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

  static async setAddressAsDefault(c: Context) {
    try {
      const addressId = c.req.param("addressId");
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

      const { id: userId, storeId } = c.get("user");

      // Check if the address exists and belongs to the user
      const existingAddress = await AddressRepository.findById(
        addressId,
        userId,
        storeId,
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

      // Check if the address is already default
      if (existingAddress.isDefault) {
        return c.json({
          status: "success",
          message: "Address is already set as default",
          data: existingAddress,
        });
      }

      // Set the address as default
      const updatedAddress = await AddressRepository.setAsDefault(
        addressId,
        userId,
        storeId,
      );

      return c.json({
        status: "success",
        message: "Address set as default successfully",
        data: updatedAddress,
      });
    } catch (error) {
      console.error("Error in setAddressAsDefault:", error);
      return c.json(
        {
          status: "error",
          message: "Failed to set address as default",
        },
        500,
      );
    }
  }
}
