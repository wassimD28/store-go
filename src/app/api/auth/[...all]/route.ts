import { Hono } from "hono";
import { auth } from "@/lib/auth";
import { handle } from "hono/vercel";

const app = new Hono()

  // Auth endpoints
  .all("*", async (c) => {
    const response = await auth.handler(c.req.raw);
    return new Response(response.body, response);
  });

export const GET = handle(app);
export const POST = handle(app);
