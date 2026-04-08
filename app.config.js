const fs = require("fs");
const path = require("path");

const appJson = require("./app-base.json");

const PUBLIC_ENV_KEYS = [
  { target: "EXPO_PUBLIC_SUPABASE_URL", source: "SUPABASE_URL" },
  { target: "EXPO_PUBLIC_SUPABASE_ANON_KEY", source: "SUPABASE_ANON_KEY" },
  {
    target: "EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY",
    source: "CLERK_PUBLISHABLE_KEY",
  },
  {
    target: "EXPO_PUBLIC_GOOGLE_AUTH_WEB_CLIENT_ID",
    source: "GOOGLE_AUTH_WEB_CLIENT_ID",
  },
  { target: "EXPO_PUBLIC_CLERK_AUTH_METHODS", source: "CLERK_AUTH_METHODS" },
  { target: "EXPO_PUBLIC_S3_BUCKET_URL", source: "S3_BUCKET_URL" },
  { target: "EXPO_PUBLIC_TERMS_OF_SERVICE_URL", source: "TERMS_OF_SERVICE_URL" },
  { target: "EXPO_PUBLIC_PRIVACY_POLICY_URL", source: "PRIVACY_POLICY_URL" },
];

function resolveEnvFile() {
  const profile =
    process.env.EAS_BUILD_PROFILE || process.env.APP_ENV || "development";

  if (profile === "production") return ".env.production";
  if (profile === "preview") return ".env.preview";
  return ".env";
}

function loadEnvFromFile(fileName) {
  const envPath = path.resolve(process.cwd(), fileName);
  if (!fs.existsSync(envPath)) return;

  const raw = fs.readFileSync(envPath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const eqIndex = trimmed.indexOf("=");
    if (eqIndex <= 0) continue;

    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim();
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadEnvFromFile(resolveEnvFile());

module.exports = () => {
  const baseExpoConfig = appJson.expo ?? {};
  const baseExtra = baseExpoConfig.extra ?? {};

  const publicExtra = Object.fromEntries(
    PUBLIC_ENV_KEYS.map(({ target, source }) => [
      target,
      process.env[target] ?? process.env[source] ?? "",
    ]),
  );

  return {
    expo: {
      ...baseExpoConfig,
      extra: {
        ...baseExtra,
        ...publicExtra,
      },
    },
  };
};
