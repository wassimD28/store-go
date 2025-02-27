import { Hono } from "hono";
import { cors } from "hono/cors";
import { auth } from "@/lib/auth";
import { handle } from "hono/vercel";

const app = new Hono()
  // Add CORS middleware
  .use('*', cors({
    origin: process.env.NEXT_PUBLIC_BASE_URL!,
    credentials: true
  }))
  // Auth endpoints
  .all("*", async (c) => {
    console.log('Auth route triggerd')
    const response = await auth.handler(c.req.raw);
    return new Response(response.body, response);
  });

export const GET = handle(app);
export const POST = handle(app);
