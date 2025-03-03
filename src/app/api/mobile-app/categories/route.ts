import { Hono } from "hono";
import { handle } from "hono/vercel";

// Option 1: If you want to use basePath
const app = new Hono().basePath("/api/mobile-app/categories")
  .get("/", async (c) => {
    return c.json({
      message: "Categories route is working correctly!",
      status: "success",
      timestamp: new Date().toISOString()
    });
  });

// Option 2: Alternative approach without basePath
// const app = new Hono()
//   .get("/api/mobile-app/categories", async (c) => {
//     return c.json({
//       message: "Categories route is working correctly!",
//       status: "success",
//       timestamp: new Date().toISOString()
//     });
//   });

// Export the handle function to make the Hono app compatible with Vercel serverless functions
export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);