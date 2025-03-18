import { Context } from "hono";
import { createClient } from "@supabase/supabase-js";
import { db } from "@/lib/db/db";
import { AppUser } from "@/lib/db/schema";
import { oauthProviderSchema, oauthCallbackSchema } from "@/server/validations/schemas/Oauth.schema";

class AppOauthController {
  // Supabase admin client for secure backend operations
  private static supabaseAdmin = createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    }
  );

  /**
   * Initiates the OAuth flow by generating a URL for the specified provider
   */
  static async initiateOauth(c: Context) {
    try {
      // Parse and validate input data as before
      const body = await c.req.json();
      const validationResult = oauthProviderSchema.safeParse(body);

      if (!validationResult.success) {
        return c.json({
          success: false,
          error: validationResult.error.errors
        }, 400);
      }

      const { provider, storeId, redirectUrl } = validationResult.data;

      // Check if store exists as before
      const store = await db.query.stores.findFirst({
        where: (stores, { eq }) => eq(stores.id, storeId)
      });

      if (!store) {
        return c.json({ success: false, error: 'Store not found' }, 404);
      }

      // Use the correct Supabase method for OAuth
      const { data, error } = await AppOauthController.supabaseAdmin.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            store_id: storeId
          }
        }
      });

      if (error) {
        console.error("OAuth URL generation error:", error);
        return c.json({ success: false, error: error.message }, 500);
      }
    
      // Return the OAuth URL to the client
      return c.json({
        success: true,
        authUrl: data.url
      });
    

    } catch (error) {
      console.error("OAuth initiation error:", error);
      return c.json({
        success: false,
        error: 'An unexpected error occurred during OAuth initiation'
      }, 500);
    }
  }


  /**
   * Links an OAuth account to an existing user account
   */
  static async linkOauthAccount(c: Context) {
    try {
      // 1. Get the user ID, provider, and auth token from the request
      const body = await c.req.json();
      const { userId, provider, providerToken, storeId } = body;

      // 2. Validate inputs
      if (!userId || !provider || !providerToken || !storeId) {
        return c.json({
          success: false,
          error: 'Missing required fields'
        }, 400);
      }

      // 3. Set the store context for row-level security
      await db.execute(`SET LOCAL app.current_store_id = '${storeId}'`);

      // 4. Check if user exists in our database
      const appUser = await db.query.AppUser.findFirst({
        where: (appUser, { eq }) => eq(appUser.id, userId)
      });

      if (!appUser) {
        return c.json({ success: false, error: 'User not found' }, 404);
      }

      // 5. Get the Supabase user to access user_metadata
      const { data: supabaseUser, error: userError } = await AppOauthController.supabaseAdmin.auth.admin.getUserById(userId);

      if (userError || !supabaseUser) {
        console.error("Failed to fetch Supabase user:", userError);
        return c.json({ success: false, error: 'User not found in authentication system' }, 404);
      }

      // 6. Update the user_metadata to track connected providers
      const currentProviders = supabaseUser.user.user_metadata?.providers || [];
      const updatedProviders = [...currentProviders, provider].filter((value, index, self) =>
        self.indexOf(value) === index); // Remove duplicates

      const { error } = await AppOauthController.supabaseAdmin.auth.admin.updateUserById(
        userId,
        {
          user_metadata: {
            ...supabaseUser.user.user_metadata,
            providers: updatedProviders
          }
        }
      );

      if (error) {
        console.error("OAuth account linking error:", error);
        return c.json({ success: false, error: error.message }, 500);
      }

      // 7. Return success response
      return c.json({
        success: true,
        message: `Successfully linked ${provider} account`
      });

    } catch (error) {
      console.error("OAuth account linking error:", error);
      return c.json({
        success: false,
        error: 'An unexpected error occurred while linking OAuth account'
      }, 500);
    }
  }
  /**
   * Handles direct sign-in with OAuth provider token
   */
  static async signInWithOauth(c: Context) {
    try {
      // 1. Get the provider, token, and store ID from the request
      const body = await c.req.json();
      const { provider, providerToken, storeId } = body;

      // 2. Validate inputs
      if (!provider || !providerToken || !storeId) {
        return c.json({
          success: false,
          error: 'Missing required fields'
        }, 400);
      }

      // 3. Sign in with the provider token
      const { data, error } = await AppOauthController.supabaseAdmin.auth.signInWithIdToken({
        provider,
        token: providerToken,
      });

      if (error) {
        console.error("OAuth sign-in error:", error);
        return c.json({ success: false, error: error.message }, 401);
      }

      // 4. Set the store context for row-level security
      await db.execute(`SET LOCAL app.current_store_id = '${storeId}'`);

      // 5. Check if user exists in our database
      const user = data.user;
      let appUser = await db.query.AppUser.findFirst({
        where: (appUser, { eq }) => eq(appUser.email, user?.email || '')
      });

      // 6. If not, create a new user record
      if (!appUser && user) {
        // First, update the Supabase user metadata to include the store ID
        await AppOauthController.supabaseAdmin.auth.admin.updateUserById(
          user.id,
          {
            user_metadata: {
              ...user.user_metadata,
              storeId: storeId
            }
          }
        );

        // Then, create the user in our database
        const name = user.user_metadata?.name || user.user_metadata?.full_name || 'User';

        await db.insert(AppUser).values({
          id: user.id,
          storeId: storeId,
          name: name,
          email: user.email || '',
          // No password for OAuth users
          status: true,
          created_at: new Date(),
          updated_at: new Date()
        });
      }

      // 7. Return the session tokens to the mobile app
      const session = data.session;
      return c.json({
        success: true,
        session: {
          accessToken: session?.access_token,
          refreshToken: session?.refresh_token,
          userId: user?.id,
          expiresAt: session?.expires_at
            ? new Date(session.expires_at * 1000).toISOString()
            : null
        }
      });

    } catch (error) {
      console.error("OAuth sign-in error:", error);
      return c.json({
        success: false,
        error: 'An unexpected error occurred during OAuth sign-in'
      }, 500);
    }
  }
}

export default AppOauthController;