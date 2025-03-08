// src/server/routes/user/routes.ts
import { Hono } from "hono";
import { UserController } from "../../../../server/controllers/user.controller";
import { handle } from "hono/vercel";

const app = new Hono().basePath("/api/mobile-app/users");


app.get("/", UserController.getAllUsers);

app.post("/", UserController.createUser);

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);