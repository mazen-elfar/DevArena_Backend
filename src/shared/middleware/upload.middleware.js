/**
 * shared/middleware/upload.middleware.js
 * Multer middleware with MIME type validation and file size limits.
 */

import multer from "multer";
import path from "path";
import crypto from "crypto";
import { Errors } from "../errors/error-definitions.js";

const ALLOWED_MIMES = {
  avatar: ["image/jpeg", "image/png", "image/webp"],
  banner: ["image/jpeg", "image/png", "image/webp"],
};

const MAX_SIZES = {
  avatar: 5 * 1024 * 1024,   // 5 MB
  banner: 10 * 1024 * 1024,  // 10 MB
};

function makeStorage(subfolder) {
  return multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, path.resolve("uploads", subfolder));
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const name = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${ext}`;
      cb(null, name);
    },
  });
}

function fileFilter(type) {
  const allowed = ALLOWED_MIMES[type];
  return (_req, file, cb) => {
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(Errors.BadRequest(`Invalid file type: ${file.mimetype}. Allowed: ${allowed.join(", ")}`));
    }
  };
}

export const uploadAvatar = multer({
  storage: makeStorage("avatars"),
  limits: { fileSize: MAX_SIZES.avatar },
  fileFilter: fileFilter("avatar"),
});

export const uploadBanner = multer({
  storage: makeStorage("banners"),
  limits: { fileSize: MAX_SIZES.banner },
  fileFilter: fileFilter("banner"),
});

/**
 * Express error handler for multer errors.
 * Place after multer middleware in the route chain.
 */
export function handleUploadError(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return next(Errors.BadRequest("File too large. Maximum size is 5 MB for avatar and 10 MB for banner."));
    }
    return next(Errors.BadRequest(`Upload error: ${err.message}`));
  }
  next(err);
}
