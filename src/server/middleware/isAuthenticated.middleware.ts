import { Context, Next } from "hono";
import { createClient } from "@supabase/supabase-js";

export const supabaseAdmin = createClient(
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
 * Middleware to check if the user is authenticated
 * Extracts the Bearer token from the Authorization header
 * Verifies the token with Supabase and sets the user context
 */
export async function isAuthenticated(c: Context, next: Next) {
    try {
        // Get the authorization header
        const authHeader = c.req.header('Authorization');
        
        // Check if the header exists and has the Bearer format
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return c.json({
                success: false,
                error: 'Unauthorized: Missing or invalid authorization header'
            }, 401);
        }
        
        // Extract the token
        const token = authHeader.split(' ')[1];
        
        if (!token) {
            return c.json({
                success: false,
                error: 'Unauthorized: Missing access token'
            }, 401);
        }
        
        // Verify the token with Supabase
        const { data, error } = await supabaseAdmin.auth.getUser(token);
        
        if (error || !data.user) {
            return c.json({
                success: false,
                error: 'Unauthorized: Invalid or expired token'
            }, 401);
        }
        
        // Extract storeId from user metadata
        const storeId = data.user.user_metadata.storeId;
        
        if (!storeId) {
            return c.json({
                success: false,
                error: 'Unauthorized: User does not have a store associated'
            }, 403);
        }
        
        // Set the database context for row-level security
        await supabaseAdmin.rpc('set_store_context', { store_id: storeId });
        
        // Add user data to the request context for use in later handlers
        c.set('user', {
            id: data.user.id,
            email: data.user.email,
            storeId,
        });
        
        // Continue to the next middleware or route handler
        await next();
        
    } catch (error) {
        console.error("Authentication error:", error);
        return c.json({
            success: false,
            error: 'An unexpected error occurred during authentication'
        }, 500);
    }
}