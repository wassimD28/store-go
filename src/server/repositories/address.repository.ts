import { db } from "../../lib/db/db";
import { eq, and } from "drizzle-orm";
import { AppAddress } from "@/lib/db/schema";
import {
  createAddressSchema,
  updateAddressSchema,
} from "../schemas/address.schema";
import { z } from "zod";

// Define types based on the Zod schemas
type AddressCreateData = z.infer<typeof createAddressSchema>;
type AddressUpdateData = z.infer<typeof updateAddressSchema>;

export class AddressRepository {
  static async findAll(userId: string, storeId: string) {
    try {
      return await db.query.AppAddress.findMany({
        where: and(
          eq(AppAddress.appUserId, userId),
          eq(AppAddress.storeId, storeId),
        ),
      });
    } catch (error) {
      console.error("Error fetching addresses:", error);
      throw new Error("Failed to fetch addresses");
    }
  }

  static async findById(id: string, userId: string, storeId: string) {
    try {
      return await db.query.AppAddress.findFirst({
        where: and(
          eq(AppAddress.id, id),
          eq(AppAddress.appUserId, userId),
          eq(AppAddress.storeId, storeId),
        ),
      });
    } catch (error) {
      console.error(`Error fetching address with ID ${id}:`, error);
      throw new Error(`Failed to fetch address with ID ${id}`);
    }
  }
  static async create(addressData: AddressCreateData) {
    try {
      // Check if this is the user's first address
      const existingAddresses = await db.query.AppAddress.findMany({
        where: and(
          eq(AppAddress.appUserId, addressData.app_user_id),
          eq(AppAddress.storeId, addressData.storeId),
        ),
      });

      const isFirstAddress = existingAddresses.length === 0;
      const shouldBeDefault = addressData.isDefault || isFirstAddress;

      // If setting as default, unset all other addresses as default
      if (shouldBeDefault && !isFirstAddress) {
        await db
          .update(AppAddress)
          .set({
            isDefault: false,
            updated_at: new Date(),
          })
          .where(
            and(
              eq(AppAddress.appUserId, addressData.app_user_id),
              eq(AppAddress.storeId, addressData.storeId),
            ),
          );
      }

      const [newAddress] = await db
        .insert(AppAddress)
        .values({
          storeId: addressData.storeId,
          appUserId: addressData.app_user_id,
          street: addressData.street,
          city: addressData.city,
          state: addressData.state,
          postalCode: addressData.postalCode,
          country: addressData.country,
          isDefault: shouldBeDefault,
          status: addressData.status,
        })
        .returning();

      return newAddress;
    } catch (error) {
      console.error("Error creating address:", error);
      throw new Error("Failed to create address");
    }
  }
  static async update(
    id: string,
    addressData: AddressUpdateData,
    userId?: string,
    storeId?: string,
  ) {
    try {
      // If setting as default, unset all other addresses as default first
      if (addressData.isDefault === true && userId && storeId) {
        await db
          .update(AppAddress)
          .set({
            isDefault: false,
            updated_at: new Date(),
          })
          .where(
            and(
              eq(AppAddress.appUserId, userId),
              eq(AppAddress.storeId, storeId),
            ),
          );
      }

      const updateValues = {
        ...(addressData.street !== undefined && {
          street: addressData.street,
        }),
        ...(addressData.city !== undefined && { city: addressData.city }),
        ...(addressData.state !== undefined && { state: addressData.state }),
        ...(addressData.postalCode !== undefined && {
          postalCode: addressData.postalCode,
        }),
        ...(addressData.country !== undefined && {
          country: addressData.country,
        }),
        ...(addressData.isDefault !== undefined && {
          isDefault: addressData.isDefault,
        }),
        ...(addressData.status !== undefined && {
          status: addressData.status,
        }),
      };

      const [updatedAddress] = await db
        .update(AppAddress)
        .set({ ...updateValues, updated_at: new Date() })
        .where(eq(AppAddress.id, id))
        .returning();

      return updatedAddress;
    } catch (error) {
      console.error(`Error updating address with ID ${id}:`, error);
      throw new Error(`Failed to update address with ID ${id}`);
    }
  }

  static async delete(id: string) {
    try {
      await db.delete(AppAddress).where(eq(AppAddress.id, id));
      return true;
    } catch (error) {
      console.error(`Error deleting address with ID ${id}:`, error);
      throw new Error(`Failed to delete address with ID ${id}`);
    }
  }
  static async setAsDefault(id: string, userId: string, storeId: string) {
    try {
      // First, unset all other addresses as default for this user and store
      await db
        .update(AppAddress)
        .set({
          isDefault: false,
          updated_at: new Date(),
        })
        .where(
          and(
            eq(AppAddress.appUserId, userId),
            eq(AppAddress.storeId, storeId),
          ),
        );

      // Then set the specified address as default
      const [updatedAddress] = await db
        .update(AppAddress)
        .set({
          isDefault: true,
          updated_at: new Date(),
        })
        .where(
          and(
            eq(AppAddress.id, id),
            eq(AppAddress.appUserId, userId),
            eq(AppAddress.storeId, storeId),
          ),
        )
        .returning();

      return updatedAddress;
    } catch (error) {
      console.error(`Error setting address ${id} as default:`, error);
      throw new Error(`Failed to set address ${id} as default`);
    }
  }
}
