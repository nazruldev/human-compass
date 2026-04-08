import { env } from "./env";

export const clerkConfig = {
  get publishableKey() {
    return env.clerk.publishableKey;
  },
} as const;
