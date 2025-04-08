import AppOauthController from "@/server/controllers/appOauth.controller";
import { Hono } from "hono";
import { handle } from "hono/vercel";

const app = new Hono()
  .basePath("/api/mobile-app/auth/oauth/callback")
  .post("/", AppOauthController.handleOauthCallback);

export const POST = handle(app);
