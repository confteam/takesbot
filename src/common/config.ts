import "dotenv/config";

export const config = {
  token: process.env.TOKEN || "",
  botsInfoServiceUrl: process.env.BOTSINFO_SERVICE_URL || "",
}
