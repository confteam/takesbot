import "dotenv/config";

export const config = {
  TOKEN: process.env.TOKEN || "",
  API_URL: process.env.BOTSINFO_SERVICE_URL || "",
}
