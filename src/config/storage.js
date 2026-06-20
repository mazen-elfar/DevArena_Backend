import { env } from "./env.js";

export const storageConfig = {
  bucket: env.STORAGE_BUCKET,
  region: env.STORAGE_REGION,
  accessKey: env.STORAGE_ACCESS_KEY,
  secretKey: env.STORAGE_SECRET_KEY,
  endpoint: env.STORAGE_ENDPOINT,
};
