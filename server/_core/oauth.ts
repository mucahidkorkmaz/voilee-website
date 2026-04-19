import type { Express } from "express";

// OAuth routes removed - using self-hosted JWT auth only.
// All user authentication is handled via /api/auth/* in userAuth.ts
// and admin password login in localAuth.ts.
export function registerOAuthRoutes(_app: Express) {
  // intentionally empty
}
