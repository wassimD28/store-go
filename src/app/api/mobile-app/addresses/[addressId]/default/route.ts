import { Hono } from "hono";
import { handle } from "hono/vercel";
import { AddressController } from "@/server/controllers/address.controller";
import { isAuthenticated } from "@/server/middleware/isAuthenticated.middleware";

const app = new Hono()
  .basePath("/api/mobile-app/addresses")
  .use("*", isAuthenticated)
  .put("/:addressId/default", AddressController.setAddressAsDefault);

export const PUT = handle(app);
