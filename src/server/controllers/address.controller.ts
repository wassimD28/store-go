import { Context } from "hono";
import { AddressRepository } from "@/server/repositories/address.repository";
import { idSchema } from "../schemas/common.schema";
import { createAddressSchema, updateAddressSchema } from "../schemas/address.schema";

export class AddressController {
  static async getAllAddresses(c: Context) {
    try {
      const { userId } = c.get("user");
      const addresses = await AddressRepository.findAll(userId);
      return c.json({
        status: "success",
        data: addresses
      });
    } catch (error) {
      console.error("Error in getAllAddresses:", error);
      return c.json({
        status: "error",
        message: "Failed to fetch addresses"
      }, 500);
    }
  }

  static async getAddressById(c: Context) {
    try {
      const id = c.req.param("id");
      const validId = idSchema.safeParse(id);
      if (!validId.success) {
        return c.json({
          status: "error",
          message: "Invalid ID"
        }, 400);
      }

      const { userId } = c.get("user");
      const address = await AddressRepository.findById(id, userId);
      if (!address) {
        return c.json({
          status: "error",
          message: "Address not found"
        }, 404);
      }

      return c.json({
        status: "success",
        data: address
      });
    } catch (error) {
      console.error("Error in getAddressById:", error);
      return c.json({
        status: "error",
        message: "Failed to fetch address"
      }, 500);
    }
  }

  static async createAddress(c: Context) {
    try {
      const { userId } = c.get("user");
      const body = await c.req.json();
      
      const addressData = createAddressSchema.safeParse({
        ...body,
        app_user_id: userId
      });
      
      if (!addressData.success) {
        return c.json({
          status: "error",
          message: "Invalid address data",
          errors: addressData.error.errors
        }, 400);
      }

      const newAddress = await AddressRepository.create(addressData.data);
      return c.json({
        status: "success",
        data: newAddress
      }, 201);
    } catch (error) {
      console.error("Error in createAddress:", error);
      return c.json({
        status: "error",
        message: "Failed to create address"
      }, 500);
    }
  }

  static async updateAddress(c: Context) {
    try {
      const id = c.req.param("id");
      const validId = idSchema.safeParse(id);
      if (!validId.success) {
        return c.json({
          status: "error",
          message: "Invalid ID"
        }, 400);
      }

      const { userId } = c.get("user");
      const body = await c.req.json();
      
      const addressData = updateAddressSchema.safeParse(body);
      if (!addressData.success) {
        return c.json({
          status: "error",
          message: "Invalid address data",
          errors: addressData.error.errors
        }, 400);
      }

      const existingAddress = await AddressRepository.findById(id, userId);
      if (!existingAddress) {
        return c.json({
          status: "error",
          message: "Address not found"
        }, 404);
      }

      const updatedAddress = await AddressRepository.update(id, addressData.data);
      return c.json({
        status: "success",
        data: updatedAddress
      });
    } catch (error) {
      console.error("Error in updateAddress:", error);
      return c.json({
        status: "error",
        message: "Failed to update address"
      }, 500);
    }
  }

  static async deleteAddress(c: Context) {
    try {
      const id = c.req.param("id");
      const validId = idSchema.safeParse(id);
      if (!validId.success) {
        return c.json({
          status: "error",
          message: "Invalid ID"
        }, 400);
      }

      const { userId } = c.get("user");
      
      const existingAddress = await AddressRepository.findById(id, userId);
      if (!existingAddress) {
        return c.json({
          status: "error",
          message: "Address not found"
        }, 404);
      }

      await AddressRepository.delete(id);
      return c.json({
        status: "success",
        message: "Address deleted successfully"
      });
    } catch (error) {
      console.error("Error in deleteAddress:", error);
      return c.json({
        status: "error",
        message: "Failed to delete address"
      }, 500);
    }
  }
}