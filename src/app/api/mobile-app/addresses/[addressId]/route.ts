import { Hono } from "hono";
import { handle } from "hono/vercel";
import { AddressController } from "@/server/controllers/address.controller";
import { isAuthenticated } from "@/server/middleware/isAuthenticated.middleware";

const app = new Hono()
  .basePath("/api/mobile-app/addresses")
  .use("*", isAuthenticated)
  .get("/:addressId", AddressController.getAddressById)
  .put("/:addressId", AddressController.updateAddress)
  .delete("/:addressId", AddressController.deleteAddress);

export const GET = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);