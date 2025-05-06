import { db } from "@/lib/db/db";
import { AppUser } from "@/lib/db/schema";
import { and, eq, lt, isNull } from "drizzle-orm";
import Pusher from "pusher";

export async function cleanupStaleUserStatuses() {
  try {
    // console.log("Running cleanup of stale user statuses");

    // Find users who are marked online but haven't updated their status in 2 minutes
    // Reduced from 3 minutes to be more aggressive
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);

    const staleUsers = await db
      .select({
        id: AppUser.id,
        storeId: AppUser.storeId,
        last_seen: AppUser.last_seen,
      })
      .from(AppUser)
      .where(
        and(eq(AppUser.is_online, true), lt(AppUser.last_seen, twoMinutesAgo)),
      );

      
      if (staleUsers.length > 0) {
      console.log(`Found ${staleUsers.length} stale users to mark as offline`);
      // Initialize Pusher
      const pusher = new Pusher({
        appId: process.env.PUSHER_APP_ID!,
        key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
        secret: process.env.PUSHER_APP_SECRET!,
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      });

      // Update each stale user and notify via Pusher
      for (const user of staleUsers) {
        console.log(`Marking user ${user.id} as offline due to inactivity`);

        // Update database
        await db
          .update(AppUser)
          .set({
            is_online: false,
            last_seen: new Date(),
          })
          .where(eq(AppUser.id, user.id));

        // Notify via Pusher
        await pusher.trigger(`store-${user.storeId}`, "user-status-changed", {
          userId: user.id,
          isOnline: false,
          lastSeen: new Date().toISOString(),
        });
      }

      console.log(`Marked ${staleUsers.length} stale users as offline`);
    }

    // Also look for users with null last_seen but marked as online
    const inconsistentUsers = await db
      .select({
        id: AppUser.id,
        storeId: AppUser.storeId,
      })
      .from(AppUser)
      .where(and(eq(AppUser.is_online, true), isNull(AppUser.last_seen)));

    if (inconsistentUsers.length > 0) {
      console.log(
        `Found ${inconsistentUsers.length} users with inconsistent status`,
      );

      // Initialize Pusher if not already done
      const pusher = new Pusher({
        appId: process.env.PUSHER_APP_ID!,
        key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
        secret: process.env.PUSHER_APP_SECRET!,
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      });

      // Fix these inconsistent users too
      for (const user of inconsistentUsers) {
        await db
          .update(AppUser)
          .set({
            is_online: false,
            last_seen: new Date(),
          })
          .where(eq(AppUser.id, user.id));

        await pusher.trigger(`store-${user.storeId}`, "user-status-changed", {
          userId: user.id,
          isOnline: false,
          lastSeen: new Date().toISOString(),
        });
      }
    }
  } catch (error) {
    console.error("Error cleaning up stale user statuses:", error);
  }
}
