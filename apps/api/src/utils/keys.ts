import crypto from "crypto";
export const generateApiKey = () =>
  "vaan_" + crypto.randomBytes(32).toString("hex");
