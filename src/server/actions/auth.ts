"use server";
import { signUpSchema } from "@/lib/validations/auth";
import { db } from "@/lib/db/db";
import { user, account } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
type FormState = {
  error?:
    | {
        [key: string]: string[];
      }
    | {
        _form: string[];
      };
  success?: boolean;
};

export async function signUpAction(
  prevState: FormState | null,
  formData: FormData
): Promise<FormState> {
  const rawData = Object.fromEntries(formData.entries());
  const parsed = signUpSchema.safeParse(rawData);

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { email, password, name } = parsed.data;

  try {
    // Check if user exists
    const existingUser = await db.query.user.findFirst({
      where: eq(user.email, email),
    });

    if (existingUser) {
      return { error: { email: ["Email already in use"] } };
    }

    // Create user ID
    const userId = uuidv4();

    // Create transaction for user and account
    await db.transaction(async (tx) => {
      // Create user
      await tx.insert(user).values({
        id: userId,
        name,
        email,
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Create account with password
      await tx.insert(account).values({
        id: uuidv4(),
        userId: userId,
        providerId: "credentials",
        accountId: userId,
        password: await bcrypt.hash(password, 10),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });

    return { success: true };
  } catch (error) {
    console.error("Signup error:", error);
    return { error: { _form: ["Something went wrong"] } };
  }
}
