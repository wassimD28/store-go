import { db } from "@/lib/db/db";
import { session } from "@/lib/db/schema";
import { v4 as uuidv4 } from "uuid";
export async function createSession(
  userId: string,
  ipAddress?: string,
  userAgent?: string
) {
  const sessionId = uuidv4();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 1 week
  const token = uuidv4(); // Generate session token

  await db.insert(session).values({
    id: sessionId,
    token,
    userId,
    expiresAt,
    ipAddress,
    userAgent,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return token; // Return the token for cookie storage
}