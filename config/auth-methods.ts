/**
 * Metode login dinamis sesuai konfigurasi Clerk Dashboard.
 * Di .env isi CLERK_AUTH_METHODS (comma-separated); app.config.js memetakan ke extra.
 */
import { env } from "./env";

function authMethodsRaw(): string {
  const fromEnv = env.clerk.authMethods.trim();
  if (fromEnv.length > 0) return fromEnv;
  const fromProcess =
    process.env.EXPO_PUBLIC_CLERK_AUTH_METHODS?.trim() ??
    process.env.CLERK_AUTH_METHODS?.trim();
  if (fromProcess && fromProcess.length > 0) return fromProcess;
  return "oauth_google,oauth_microsoft,oauth_apple,password";
}

const OAUTH_LABELS: Record<string, string> = {
  oauth_google: "Google",
  oauth_github: "GitHub",
  oauth_microsoft: "Microsoft",
  oauth_apple: "Apple",
  oauth_discord: "Discord",
  oauth_facebook: "Facebook",
  oauth_twitter: "Twitter",
  oauth_linkedin: "LinkedIn",
};

export type AuthMethod =
  | { type: "oauth"; strategy: string; label: string }
  | { type: "password" };

function parseAuthMethods(): AuthMethod[] {
  const raw = authMethodsRaw()
    .split(",")
    .map((s: any) => s.trim().toLowerCase())
    .filter(Boolean);
  const result: AuthMethod[] = [];

  for (const item of raw) {
    if (item === "password") {
      result.push({ type: "password" });
    } else if (item.startsWith("oauth_")) {
      result.push({
        type: "oauth",
        strategy: item,
        label: OAUTH_LABELS[item] ?? item.replace("oauth_", ""),
      });
    }
  }

  return result.length > 0
    ? result
    : [{ type: "oauth", strategy: "oauth_google", label: "Google" }];
}

export const authMethods = parseAuthMethods();

export const hasPassword = authMethods.some((m) => m.type === "password");
export const oauthMethods = authMethods.filter((m) => m.type === "oauth");
