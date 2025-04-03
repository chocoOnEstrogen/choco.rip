import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Loads environment variables based on the current environment.
 * In production (Vercel), environment variables are already set.
 * In development, loads .env.local first, then falls back to .env.
 * If no .env files are found, dotenv will automatically look for a .env file in the current directory.
 */
export function loadEnv(): void {
  if (process.env.NODE_ENV === "production") {
    return; // Environment variables are already set in production
  }

  const envLocalPath = path.join(__dirname, "../../.env.local");
  const envPath = path.join(__dirname, "../../.env");

  if (fs.existsSync(envLocalPath)) {
    dotenv.config({ path: envLocalPath });
    console.log("✅ Loaded environment variables from .env.local");
  } else if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    console.log("✅ Loaded environment variables from .env");
  } else {
    dotenv.config();
    console.log("✅ Loaded environment variables from default location");
  }
}

// Load environment variables
loadEnv();
