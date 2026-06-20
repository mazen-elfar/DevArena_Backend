import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { jwtConfig } from "../../config/jwt.js";

const SALT_ROUNDS = 12;

export async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

export function generateToken(payload) {
  return jwt.sign(payload, jwtConfig.accessSecret, {
    expiresIn: jwtConfig.accessExpires,
    algorithm: "HS256",
  });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, jwtConfig.accessSecret, { algorithms: ["HS256"] });
}

export function generateRefreshToken() {
  return crypto.randomUUID();
}

export function generateVerificationToken() {
  return crypto.randomBytes(32).toString("hex");
}
