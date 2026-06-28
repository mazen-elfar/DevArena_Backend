/**
 * shared/services/storage.service.js
 * File storage abstraction. Currently uses local disk.
 * Swap to Cloudinary/S3 by replacing the provider functions.
 */

import fs from "fs/promises";
import path from "path";

const UPLOADS_DIR = path.resolve("uploads");

/**
 * Delete a previously uploaded file.
 * @param {string|null} filePath — relative path like "avatars/abc.png" or absolute URL
 */
export async function deleteFile(filePath) {
  if (!filePath) return;

  // If it's a URL, extract the path after the host
  let relativePath = filePath;
  if (filePath.startsWith("http")) {
    try {
      const url = new URL(filePath);
      relativePath = url.pathname.replace(/^\/+/, "");
    } catch {
      return; // Invalid URL, skip
    }
  }

  const fullPath = path.resolve(UPLOADS_DIR, "..", relativePath);
  try {
    await fs.unlink(fullPath);
  } catch {
    // File may not exist — ignore
  }
}

/**
 * Get the public URL for an uploaded file.
 * @param {string} filename — just the filename
 * @param {string} subfolder — "avatars" or "banners"
 * @returns {string} URL path
 */
export function getFileUrl(filename, subfolder) {
  return `/uploads/${subfolder}/${filename}`;
}
