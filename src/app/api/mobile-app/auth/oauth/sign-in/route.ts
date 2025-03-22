import AppOauthController from "@/server/controllers/appOauth.controller";
import { Hono } from "hono";
import { handle } from "hono/vercel";

const app = new Hono().basePath("/api/mobile-app/auth/oauth/sign-in")
  // handle both GET and POST methods on this route
  .get("/", AppOauthController.signInWithOauth)
  .post("/", AppOauthController.signInWithOauth);

export const GET = handle(app);
export const POST = handle(app);