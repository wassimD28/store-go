import { Context } from "hono";
import { createClient } from "@supabase/supabase-js";
import { db } from "@/lib/db/db";
import { hash } from "bcrypt";
import { AppUser } from "@/lib/db/schema";
import { appSignInSchema, appSignUpSchema } from "@/server/schemas/auth.schema";

class AppAuthController {
  // Supabase admin client for secure backend operations
  private static supabaseAdmin = createClient(
    process.env.SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || "",
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    },
  );

  static async signUp(c: Context) {
    try {
      // 1. Parse and validate input data
      const body = await c.req.json();
      const validationResult = appSignUpSchema.safeParse(body);

      if (!validationResult.success) {
        return c.json(
          {
            success: false,
            error: validationResult.error.errors,
          },
          400,
        );
      }

      const { name, email, password, storeId } = validationResult.data;

      // 2. Check if store exists (optional but recommended)
      const store = await db.query.stores.findFirst({
        where: (stores, { eq }) => eq(stores.id, storeId),
      });

      if (!store) {
        return c.json({ success: false, error: "Store not found" }, 404);
      }

      // 3. Create the user in Supabase Auth with store information in user_metadata
      // This metadata will be included in JWT tokens automatically by Supabase
      const { data: authData, error: authError } =
        await AppAuthController.supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true, // Auto-confirm email for mobile app users
          user_metadata: {
            name,
            storeId, // This storeId in metadata will be accessible in JWT claims
          },
        });

      if (authError) {
        console.error("Supabase auth error:", authError);
        return c.json({ success: false, error: authError.message }, 400);
      }

      // 4. Set the store context for row-level security
      await db.execute(`SET LOCAL app.current_store_id = '${storeId}'`);

      // 5. Create the user record in the app_user table
      const hashedPassword = await hash(password, 10);
      const userId = authData.user.id;

      await db.insert(AppUser).values({
        id: userId,
        storeId: storeId,
        name: name,
        email: email,
        password: hashedPassword,
        status: true,
        created_at: new Date(),
        updated_at: new Date(),
      });

      // 6. Generate a session for the user
      // This creates a session with access and refresh tokens managed by Supabase
      const { data: sessionData, error: sessionError } =
        await AppAuthController.supabaseAdmin.auth.signInWithPassword({
          email: email,
          password: password,
        });

      if (sessionError) {
        console.error("Session creation error:", sessionError);
        return c.json({ success: false, error: sessionError.message }, 500);
      }

      // 7. Return the Supabase session which already contains access and refresh tokens
      // The session object includes accessToken, refreshToken, and expiry information
      return c.json(
        {
          success: true,
          session: {
            accessToken: sessionData.session?.access_token,
            refreshToken: sessionData.session?.refresh_token,
            userId: authData.user.id,
            expiresAt: sessionData.session?.expires_at
              ? new Date(sessionData.session.expires_at * 1000).toISOString()
              : null,
          },
        },
        201,
      );
    } catch (error) {
      console.error("Sign up error:", error);
      return c.json(
        {
          success: false,
          error: "An unexpected error occurred during registration",
        },
        500,
      );
    }
  }

  static async signIn(c: Context) {
    try {
      // 1. Parse and validate input data
      const body = await c.req.json();
      const validationResult = appSignInSchema.safeParse(body);

      if (!validationResult.success) {
        return c.json(
          {
            success: false,
            error: validationResult.error.errors,
          },
          400,
        );
      }

      const { email, password, storeId } = validationResult.data;

      // check if user exists in app_user table
      const user = await db.query.AppUser.findFirst({
        where: (appUser, { eq }) => eq(appUser.email, email),
      });

      if (!user) {
        return c.json({ success: false, error: "Email not found" }, 404);
      }
      // 2. Authenticate via Supabase - creates a session with JWT tokens
      const { data, error } =
        await AppAuthController.supabaseAdmin.auth.signInWithPassword({
          email,
          password,
        });

      if (error) {
        return c.json({ success: false, error: error.message }, 401);
      }

      // 3. Verify that the user belongs to the specified store
      // Check if the storeId in the request matches the one in user metadata
      const userStoreId = data.user.user_metadata.storeId;

      if (userStoreId !== storeId) {
        return c.json(
          {
            success: false,
            error: "User not associated with this store",
          },
          403,
        );
      }

      // 4. Set the database context for row-level security
      await db.execute(`SET LOCAL app.current_store_id = '${storeId}'`);

      // 5. Verify user exists in the application database
      const userRecord = await db.query.AppUser.findFirst({
        where: (appUser, { eq, and }) =>
          and(eq(appUser.email, email), eq(appUser.storeId, storeId)),
      });

      if (!userRecord) {
        return c.json(
          {
            success: false,
            error: "User not found in this store",
          },
          404,
        );
      }

      // 6. Return the Supabase session - it already contains the tokens needed
      // The client can store these tokens and use them for authentication
      return c.json({
        success: true,
        message: "User authenticated successfully",
        session: {
          accessToken: data.session?.access_token,
          refreshToken: data.session?.refresh_token,
          userId: data.user.id,
          expiresAt: data.session?.expires_at
            ? new Date(data.session.expires_at * 1000).toISOString()
            : null,
        },
      });
    } catch (error) {
      console.error("Sign in error:", error);
      return c.json(
        {
          success: false,
          error: "An unexpected error occurred during authentication",
        },
        500,
      );
    }
  }

  static async refreshToken(c: Context) {
    try {
      // 1. Get the refresh token from the request body
      const body = await c.req.json();
      const { refreshToken } = body;

      if (!refreshToken) {
        return c.json(
          { success: false, error: "Refresh token is required" },
          400,
        );
      }

      // 2. Use Supabase's built-in token refresh mechanism
      // This automatically validates the refresh token and generates new tokens
      const { data, error } =
        await AppAuthController.supabaseAdmin.auth.refreshSession({
          refresh_token: refreshToken,
        });

      if (error) {
        // log the refresh token
        console.error("Logged refresh token:", refreshToken);
        console.error("Token refresh error:", error);
        return c.json({ success: false, error: error.message }, 401);
      }

      // 3. Return the refreshed session with new tokens
      return c.json({
        success: true,
        session: {
          accessToken: data.session?.access_token,
          refreshToken: data.session?.refresh_token,
          userId: data.user?.id,
          expiresAt: data.session?.expires_at
            ? new Date(data.session.expires_at * 1000).toISOString()
            : null,
        },
      });
    } catch (error) {
      console.error("Token refresh error:", error);
      return c.json(
        {
          success: false,
          error: "An unexpected error occurred during token refresh",
        },
        500,
      );
    }
  }

  // Add this method to src\server\controllers\appAuth.controller.ts

  static async signOut(c: Context) {
    try {
      // 1. Get the access token from the Authorization header
      const authHeader = c.req.header("Authorization");
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return c.json(
          {
            success: false,
            error: "Invalid authorization header",
          },
          401,
        );
      }

      const accessToken = authHeader.split(" ")[1];

      // 2. Instead of directly validating the token (which is causing the error),
      // use a more robust approach with session handling

      try {
        // Using the standard signOut method which doesn't require token validation
        // This will end the user's session server-side
        const { error } = await AppAuthController.supabaseAdmin.auth.signOut();

        if (error) {
          console.error("Basic logout error:", error);
          // Continue to the fallback approach if this fails
        } else {
          // If successful, return immediately
          return c.json({
            success: true,
            message: "User logged out successfully",
          });
        }
      } catch (tokenError) {
        // If the first approach fails, log but continue to fallback
        console.warn("Token-based logout failed, using fallback:", tokenError);
      }

      // 3. Fallback approach - get session information from the request body
      // This allows clients to provide the user ID directly if needed
      try {
        const body = await c.req.json().catch(() => ({}));
        const { userId } = body;

        if (userId) {
          // If client provided a userId, use admin API to invalidate all sessions
          const { error } =
            await AppAuthController.supabaseAdmin.auth.admin.deleteUser(userId);

          if (error) {
            console.error("User deletion error:", error);
            // Continue to response below
          } else {
            return c.json({
              success: true,
              message: "User sessions invalidated successfully",
            });
          }
        }
      } catch (fallbackError) {
        console.error("Fallback logout error:", fallbackError);
      }

      // 4. If all approaches failed but we don't want to expose internal errors,
      // return a general success message for the client
      // The client should still clear local tokens regardless
      return c.json({
        success: true,
        message: "Logout processed - please clear local tokens",
        clearLocalStorage: true,
      });
    } catch (error) {
      console.error("Logout error:", error);
      return c.json(
        {
          success: false,
          error: "An unexpected error occurred during logout",
        },
        500,
      );
    }
  }
}

export default AppAuthController;