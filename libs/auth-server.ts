import { auth } from "@/libs/auth";
import { User } from "@/types/types";
import { headers } from "next/headers";
import { cache } from "react";

/**
 * Get the current session on the server side
 * This function is cached per request
 */
export const getSession = cache(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session;
});

/**
 * Get the current user from the session
 * Returns null if not authenticated
 */
export async function getCurrentUser(): Promise<User | null> {
  const session = await getSession();
  if (!session?.user) return null;

  // Map the database user to our User type
  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    avatarUrl: session.user.image ?? undefined,
  };
}

/**
 * Check if the user is authenticated
 * Useful for protecting pages
 */
export async function isAuthenticated() {
  const session = await getSession();
  return !!session?.user;
}

/**
 * Require authentication - throws if not authenticated
 * Use this in Server Components that need auth
 */
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}
