import packageJson from "../package.json";
import Constants from "expo-constants";

type ExtraMap = Record<string, unknown>;
type PublicEnvKey =
  | "EXPO_PUBLIC_SUPABASE_URL"
  | "EXPO_PUBLIC_SUPABASE_ANON_KEY"
  | "EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY"
  | "EXPO_PUBLIC_CLERK_AUTH_METHODS"
  | "EXPO_PUBLIC_S3_BUCKET_URL"
  | "EXPO_PUBLIC_TERMS_OF_SERVICE_URL"
  | "EXPO_PUBLIC_PRIVACY_POLICY_URL";

function getManifestExtra(): ExtraMap {
  const expoExtra = Constants.expoConfig?.extra;
  if (expoExtra && typeof expoExtra === "object") {
    return expoExtra as ExtraMap;
  }

  const embedded = Constants.manifest;
  if (embedded && typeof embedded === "object" && "extra" in embedded) {
    const m = (embedded as { extra?: unknown }).extra;
    if (m && typeof m === "object") {
      return m as ExtraMap;
    }
  }

  const updateExtra = Constants.manifest2?.extra?.expoClient?.extra;
  if (updateExtra && typeof updateExtra === "object") {
    return updateExtra as ExtraMap;
  }

  return {};
}

function getProcessPublicEnv(name: PublicEnvKey): string | undefined {
  switch (name) {
    case "EXPO_PUBLIC_SUPABASE_URL":
      return process.env.EXPO_PUBLIC_SUPABASE_URL;
    case "EXPO_PUBLIC_SUPABASE_ANON_KEY":
      return process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
    case "EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY":
      return process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
    case "EXPO_PUBLIC_CLERK_AUTH_METHODS":
      return process.env.EXPO_PUBLIC_CLERK_AUTH_METHODS;
    case "EXPO_PUBLIC_S3_BUCKET_URL":
      return process.env.EXPO_PUBLIC_S3_BUCKET_URL;
    case "EXPO_PUBLIC_TERMS_OF_SERVICE_URL":
      return process.env.EXPO_PUBLIC_TERMS_OF_SERVICE_URL;
    case "EXPO_PUBLIC_PRIVACY_POLICY_URL":
      return process.env.EXPO_PUBLIC_PRIVACY_POLICY_URL;
    default:
      return undefined;
  }
}

function readPublicEnv(name: PublicEnvKey, fallback = ""): string {
  const fromProcess = getProcessPublicEnv(name);
  if (typeof fromProcess === "string" && fromProcess.length > 0) {
    return fromProcess;
  }

  // Names from .env used by app.config.js (Metro / tooling may expose these on process.env)
  if (name === "EXPO_PUBLIC_SUPABASE_URL") {
    const legacy = process.env.SUPABASE_URL;
    if (typeof legacy === "string" && legacy.trim().length > 0) {
      return legacy.trim();
    }
  }
  if (name === "EXPO_PUBLIC_SUPABASE_ANON_KEY") {
    const legacy = process.env.SUPABASE_ANON_KEY;
    if (typeof legacy === "string" && legacy.trim().length > 0) {
      return legacy.trim();
    }
  }
  if (name === "EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY") {
    const legacy = process.env.CLERK_PUBLISHABLE_KEY;
    if (typeof legacy === "string" && legacy.trim().length > 0) {
      return legacy.trim();
    }
  }
  if (name === "EXPO_PUBLIC_S3_BUCKET_URL") {
    const legacy = process.env.S3_BUCKET_URL;
    if (typeof legacy === "string" && legacy.trim().length > 0) {
      return legacy.trim();
    }
  }

  const fromExtra = getManifestExtra()[name];
  if (typeof fromExtra === "string" && fromExtra.length > 0) {
    return fromExtra;
  }

  return fallback;
}

/**
 * Central environment variables.
 * Gunakan EXPO_PUBLIC_* untuk variabel yang dipakai di client.
 * Getters re-read manifest / process.env on each access (avoids stale empty reads).
 */
export const env = {
  get supabase() {
    return {
      url: readPublicEnv("EXPO_PUBLIC_SUPABASE_URL"),
      anonKey: readPublicEnv("EXPO_PUBLIC_SUPABASE_ANON_KEY"),
    };
  },
  get clerk() {
    return {
      publishableKey: readPublicEnv("EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY"),
      authMethods: readPublicEnv(
        "EXPO_PUBLIC_CLERK_AUTH_METHODS",
        "oauth_google,password",
      ),
    };
  },
  get s3BucketUrl() {
    return readPublicEnv("EXPO_PUBLIC_S3_BUCKET_URL");
  },
  get termsOfServiceUrl() {
    return readPublicEnv("EXPO_PUBLIC_TERMS_OF_SERVICE_URL");
  },
  get privacyPolicyUrl() {
    return readPublicEnv("EXPO_PUBLIC_PRIVACY_POLICY_URL");
  },
  get version() {
    return packageJson.version;
  },
};
