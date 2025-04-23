import { cleanupStaleUserStatuses } from "./user-status-cleaner";
import cron from "node-cron";

export function startWorkers() {
  // Run every minute
  cron.schedule("* * * * *", async () => {
    console.log("Running stale user status cleanup worker");
    try {
      await cleanupStaleUserStatuses();
    } catch (error) {
      console.error("Error in status cleanup worker:", error);
    }
  });

  console.log("Workers scheduled successfully");
}
