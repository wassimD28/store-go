import AppAuthController from "@/server/controllers/appAuth.controller";
import { Hono } from "hono";
import { handle } from "hono/vercel";

const app = new Hono().basePath("/api/mobile-app/auth/sign-up")
.post("/", AppAuthController.signUp)



export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);