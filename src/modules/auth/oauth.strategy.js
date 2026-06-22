/**
 * oauth.strategy.js
 * Manual OAuth profile fetching for Google and GitHub.
 * Exchanges an authorization code for an access token then fetches the user profile.
 * Keeps Passport.js out of the stack — pure fetch-based strategy.
 */

import { env } from "../../config/env.js";

// ─── Google ──────────────────────────────────────────────────────────────────

/**
 * Exchange a Google authorization code for tokens + profile.
 * @param {string} code - Authorization code from Google redirect
 * @returns {{ providerUid, email, name, avatarUrl, accessToken, refreshToken }}
 */
export async function exchangeGoogleCode(code) {
  // 1. Exchange code for tokens
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      redirect_uri: env.GOOGLE_CALLBACK_URL,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenRes.ok) {
    const err = await tokenRes.json().catch(() => ({}));
    throw new Error(`Google token exchange failed: ${err.error_description ?? tokenRes.status}`);
  }

  const { access_token, refresh_token } = await tokenRes.json();

  // 2. Fetch profile
  const profileRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${access_token}` },
  });

  if (!profileRes.ok) throw new Error("Failed to fetch Google profile");

  const profile = await profileRes.json();
  return {
    providerUid: profile.id,
    email: profile.email,
    name: profile.name,
    avatarUrl: profile.picture ?? null,
    accessToken: access_token,
    refreshToken: refresh_token ?? null,
  };
}

// ─── GitHub ──────────────────────────────────────────────────────────────────

/**
 * Exchange a GitHub authorization code for tokens + profile.
 * @param {string} code - Authorization code from GitHub redirect
 * @returns {{ providerUid, email, name, avatarUrl, accessToken, refreshToken }}
 */
export async function exchangeGitHubCode(code) {
  // 1. Exchange code for access token
  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: new URLSearchParams({
      code,
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      redirect_uri: env.GITHUB_CALLBACK_URL,
    }),
  });

  if (!tokenRes.ok) throw new Error("GitHub token exchange failed");

  const { access_token } = await tokenRes.json();

  // 2. Fetch basic profile
  const profileRes = await fetch("https://api.github.com/user", {
    headers: { Authorization: `Bearer ${access_token}`, "User-Agent": "DevArena" },
  });
  if (!profileRes.ok) throw new Error("Failed to fetch GitHub profile");
  const profile = await profileRes.json();

  // 3. GitHub may return null email — fetch from /user/emails
  let email = profile.email;
  if (!email) {
    const emailsRes = await fetch("https://api.github.com/user/emails", {
      headers: { Authorization: `Bearer ${access_token}`, "User-Agent": "DevArena" },
    });
    if (emailsRes.ok) {
      const emails = await emailsRes.json();
      const primary = emails.find((e) => e.primary && e.verified);
      email = primary?.email ?? null;
    }
  }

  return {
    providerUid: String(profile.id),
    email,
    name: profile.name ?? profile.login,
    avatarUrl: profile.avatar_url ?? null,
    accessToken: access_token,
    refreshToken: null,
  };
}
