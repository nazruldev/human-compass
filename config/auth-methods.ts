/**
 * Metode login dinamis sesuai konfigurasi Clerk Dashboard.
 * Set EXPO_PUBLIC_CLERK_AUTH_METHODS di .env (comma-separated).
 * Contoh: oauth_google,oauth_github,password
 *
 * OAuth: oauth_google, oauth_github, oauth_microsoft, oauth_apple, dll.
 * Password: password (email + password)
 */
const AUTH_METHODS_ENV =
  process.env.EXPO_PUBLIC_CLERK_AUTH_METHODS ??
  "oauth_google,oauth_microsoft,oauth_apple,password";

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
  const raw = AUTH_METHODS_ENV.split(",")
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
