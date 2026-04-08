import { env } from "./env";

export const clerkConfig = {
  publishableKey: env.clerk.publishableKey,
} as const;
