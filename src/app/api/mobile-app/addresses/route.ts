import { Hono } from "hono";
import { handle } from "hono/vercel";
import { AddressController } from "@/server/controllers/address.controller";
import { isAuthenticated } from "@/server/middleware/isAuthenticated.middleware";

const app = new Hono()
  .basePath("/api/mobile-app/addresses")
  .use("*", isAuthenticated)
  .get("/", AddressController.getAllAddresses)
  .post("/", AddressController.createAddress);

export const GET = handle(app);
export const POST = handle(app);