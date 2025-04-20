import { Context } from "hono";
import Pusher from "pusher";

class PusherController {
  private static pusher = new Pusher({
    appId: process.env.PUSHER_APP_ID!,
    key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
    secret: process.env.PUSHER_APP_SECRET!,
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  });

  static async authenticatePresenceChannel(c: Context) {
    try {
      // Get the socket ID and channel name from the request
      const  {socket_id, channel_name} = await c.req.json();
      const { id: userId, storeId, email } = c.get("user");
     

      // Create presence data with user info
      const presenceData = {
        user_id: userId,
        user_info: {
          email,
          storeId
        },
      };

      // Generate auth signature
      const auth = PusherController.pusher.authorizeChannel(
        socket_id,
        channel_name,
        presenceData,
      );

      return c.json(auth);
    } catch (error) {
      console.error("Pusher auth error:", error);
      return c.json({ error: "Authentication failed" }, 500);
    }
  }
}

export default PusherController;
