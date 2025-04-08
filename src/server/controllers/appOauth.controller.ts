import { Context } from "hono";
import { createClient } from "@supabase/supabase-js";
import { db } from "@/lib/db/db";
import { AppUser } from "@/lib/db/schema";
import { oauthProviderSchema } from "@/server/schemas/Oauth.schema";
import { and, eq } from "drizzle-orm";
import { OAuthService } from "../services/oauth.service";

class AppOauthController {
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

  /**
   * Registers or links a user account after OAuth authentication
   * @param userData User data from OAuth provider
   * @param storeId Store ID to associate with the user
   * @returns Registered user data
   */
  static async registerOauthUser(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    userData: any,
    storeId: string,
    provider: string,
  ) {
    try {
      // Check if store exists
      const store = await db.query.stores.findFirst({
        where: (stores, { eq }) => eq(stores.id, storeId),
      });

      if (!store) {
        throw new Error("Store not found");
      }

      const userEmail = userData.email;

      if (!userEmail) {
        throw new Error("Email not provided by OAuth provider");
      }

      // Check if user already exists in AppUser table
      const existingUser = await db.query.AppUser.findFirst({
        where: (appUser, { eq, and }) =>
          and(eq(appUser.email, userEmail), eq(appUser.storeId, storeId)),
      });

      if (existingUser) {
        // User already exists - update OAuth-specific fields
        const updatedUser = await db
          .update(AppUser)
          .set({
            // Update fields that might have changed (like avatar or name)
            name:
              userData.user_metadata?.full_name ||
              userData.user_metadata?.name ||
              existingUser.name,
            avatar:
              existingUser.avatar == null
                ? userData.user_metadata?.avatar_url ||
                  userData.user_metadata?.picture
                : existingUser.avatar,
            updated_at: new Date(),
          })
          .where(
            and(eq(AppUser.id, existingUser.id), eq(AppUser.storeId, storeId)),
          )
          .returning();

        return {
          success: true,
          isNewUser: false,
          user: updatedUser[0],
          message: "User account updated to use OAuth",
        };
      }

      // Create new user
      const newUser = await db
        .insert(AppUser)
        .values({
          id: userData.id,
          storeId,
          name:
            userData.user_metadata?.full_name ||
            userData.user_metadata?.name ||
            "User",
          email: userEmail,
          password: null, // OAuth users don't have passwords
          avatar:
            userData.user_metadata?.avatar_url ||
            userData.user_metadata?.picture ||
            null,
          gender: null,
          auth_type: "oauth",
          auth_provider: provider,
          age_range: null,
          status: true,
        })
        .returning();

      return {
        success: true,
        isNewUser: true,
        user: newUser[0],
        message: "User registered successfully",
      };
    } catch (error) {
      console.error("OAuth user registration error:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred during registration",
      };
    }
  }

  /**
   * Initiates the OAuth flow by generating a URL for the specified provider
   */
  static async initiateOauth(c: Context) {
    try {
      // Parse and validate input data as before
      const body = await c.req.json();
      const validationResult = oauthProviderSchema.safeParse(body);

      if (!validationResult.success) {
        return c.json(
          {
            success: false,
            error: validationResult.error.errors,
          },
          400,
        );
      }

      const { provider, storeId, redirectUrl } = validationResult.data;

      // Check if store exists as before
      const store = await db.query.stores.findFirst({
        where: (stores, { eq }) => eq(stores.id, storeId),
      });

      if (!store) {
        return c.json({ success: false, error: "Store not found" }, 404);
      }

      // Use the correct Supabase method for OAuth
      const { data, error } =
        await AppOauthController.supabaseAdmin.auth.signInWithOAuth({
          provider: provider,
          options: {
            redirectTo: redirectUrl,
            queryParams: {
              store_id: storeId,
            },
          },
        });

      if (error) {
        console.error("OAuth URL generation error:", error);
        return c.json({ success: false, error: error.message }, 500);
      }

      // Return the OAuth URL to the client
      return c.json({
        success: true,
        authUrl: data.url,
      });
    } catch (error) {
      console.error("OAuth initiation error:", error);
      return c.json(
        {
          success: false,
          error: "An unexpected error occurred during OAuth initiation",
        },
        500,
      );
    }
  }

  /**
   * Handles OAuth callback and user registration
   */
  // In AppOauthController.ts
  static async handleOauthCallback(c: Context) {
    try {
      // Extract data from the request
        const { accessToken, storeId, provider, providerToken } =
          await c.req.json();

        if (!accessToken || !storeId || !provider || !providerToken) {
          return c.json(
            {
              success: false,
              error: "Missing required authentication parameters",
            },
            400,
          );
        }

      // Get user data from Supabase using the token
      const {
        data: { user },
        error: userError,
      } = await AppOauthController.supabaseAdmin.auth.getUser(accessToken);

      if (userError || !user) {
        return c.json(
          {
            success: false,
            error: userError?.message || "Invalid token",
          },
          401,
        );
      }
      // check if user email exist
      if (!user.email){
        return c.json(
          {
            success: false,
            error: "No user email found to complete oauth validation",
          },
          401,
        );
      }

      // IMPORTANT: Validate the provider token with the actual provider
      const isValidProviderToken = await OAuthService.validateProviderToken(
        provider,
        providerToken,
        user.email,
      );

      if (!isValidProviderToken) {
        return c.json(
          {
            success: false,
            error: "Invalid authentication flow detected",
          },
          401,
        );
      }

      // Register or update the user
      const registrationResult = await AppOauthController.registerOauthUser(
        user,
        storeId,
        provider,
      );

      if (!registrationResult.success) {
        return c.json(
          {
            success: false,
            error: registrationResult.error,
          },
          500,
        );
      }

      // Rather than just returning registration data, create a proper session like signIn does
      // This ensures we match the format from regular sign-in
      return c.json({
        success: true,
        message: "User authenticated successfully",
        session: {
          accessToken: accessToken,
          // Note: Ideally we would get a refresh token too, but it seems your redirect URL already has it
          // You could extract it from the URL or get it from Supabase during the process
          //refreshToken: null, // You might want to extract this from the redirect URL
          userId: user.id,
        },
      });
    } catch (error) {
      console.error("OAuth callback error:", error);
      return c.json(
        {
          success: false,
          error:
            "An unexpected error occurred during OAuth callback processing",
        },
        500,
      );
    }
  }

  
}

export default AppOauthController;
