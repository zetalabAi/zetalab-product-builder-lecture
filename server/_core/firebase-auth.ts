// Firebase Authentication helpers for ZetaLab
import * as admin from 'firebase-admin';
import type { Express, Request, Response } from "express";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./cookies";
import * as db from "../db";

// Initialize Firebase Admin if not already initialized
function initializeFirebase() {
  if (admin.apps.length === 0) {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId: process.env.FIREBASE_PROJECT_ID || 'zetalab-product-builder'
    });
  }
}

initializeFirebase();

/**
 * Verify Firebase ID token from request
 * @param idToken - Firebase ID token from client
 * @returns Decoded token with user info
 */
export async function verifyIdToken(idToken: string) {
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error('[Firebase Auth] Token verification failed:', error);
    throw new Error('Invalid authentication token');
  }
}

/**
 * Create a session cookie for the user
 * @param idToken - Firebase ID token
 * @param expiresIn - Session duration in milliseconds
 * @returns Session cookie string
 */
export async function createSessionCookie(idToken: string, expiresIn: number = ONE_YEAR_MS) {
  try {
    const sessionCookie = await admin.auth().createSessionCookie(idToken, {
      expiresIn,
    });
    return sessionCookie;
  } catch (error) {
    console.error('[Firebase Auth] Session cookie creation failed:', error);
    throw new Error('Failed to create session cookie');
  }
}

/**
 * Verify session cookie from request
 * @param sessionCookie - Session cookie string
 * @returns Decoded session with user info
 */
export async function verifySessionCookie(sessionCookie: string) {
  try {
    const decodedClaims = await admin.auth().verifySessionCookie(sessionCookie, true);
    return decodedClaims;
  } catch (error) {
    console.error('[Firebase Auth] Session verification failed:', error);
    return null;
  }
}

/**
 * Get user from Firebase Auth by UID
 * @param uid - Firebase user UID
 * @returns User record
 */
export async function getUserByUid(uid: string) {
  try {
    const userRecord = await admin.auth().getUser(uid);
    return userRecord;
  } catch (error) {
    console.error('[Firebase Auth] Get user failed:', error);
    return null;
  }
}

/**
 * Register Firebase Authentication routes
 * Handles Google Sign-In and session management
 */
export function registerFirebaseAuthRoutes(app: Express) {
  /**
   * POST /api/auth/session
   * Creates a session cookie from Firebase ID token
   */
  app.post("/api/auth/session", async (req: Request, res: Response) => {
    const idToken = req.body.idToken;

    if (!idToken) {
      res.status(400).json({ error: "idToken is required" });
      return;
    }

    try {
      // Verify the ID token
      const decodedToken = await verifyIdToken(idToken);

      // Create session cookie
      const sessionCookie = await createSessionCookie(idToken, ONE_YEAR_MS);

      // Get user info from Firebase
      const userRecord = await getUserByUid(decodedToken.uid);

      if (!userRecord) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      // Upsert user in Firestore
      await db.upsertUser({
        uid: decodedToken.uid,
        openId: decodedToken.uid, // Use Firebase UID as openId
        name: userRecord.displayName || null,
        email: userRecord.email || null,
        loginMethod: userRecord.providerData[0]?.providerId || 'google.com',
        lastSignedIn: new Date(),
      });

      // Set session cookie
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionCookie, {
        ...cookieOptions,
        maxAge: ONE_YEAR_MS
      });

      res.json({
        success: true,
        user: {
          uid: decodedToken.uid,
          email: userRecord.email,
          displayName: userRecord.displayName,
        }
      });
    } catch (error) {
      console.error("[Firebase Auth] Session creation failed", error);
      res.status(500).json({ error: "Authentication failed" });
    }
  });

  /**
   * POST /api/auth/logout
   * Clears session cookie and revokes refresh tokens
   */
  app.post("/api/auth/logout", async (req: Request, res: Response) => {
    const sessionCookie = req.cookies[COOKIE_NAME];

    if (!sessionCookie) {
      res.status(400).json({ error: "No session found" });
      return;
    }

    try {
      // Verify session and get user
      const decodedClaims = await verifySessionCookie(sessionCookie);

      if (decodedClaims) {
        // Revoke refresh tokens
        await admin.auth().revokeRefreshTokens(decodedClaims.uid);
      }

      // Clear session cookie
      res.clearCookie(COOKIE_NAME);
      res.json({ success: true });
    } catch (error) {
      console.error("[Firebase Auth] Logout failed", error);
      // Clear cookie anyway
      res.clearCookie(COOKIE_NAME);
      res.status(500).json({ error: "Logout failed" });
    }
  });

  /**
   * GET /api/auth/me
   * Get current authenticated user info
   */
  app.get("/api/auth/me", async (req: Request, res: Response) => {
    const sessionCookie = req.cookies[COOKIE_NAME];

    if (!sessionCookie) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    try {
      const decodedClaims = await verifySessionCookie(sessionCookie);

      if (!decodedClaims) {
        res.status(401).json({ error: "Invalid session" });
        return;
      }

      // Get user from Firestore
      const user = await db.getUserByUid(decodedClaims.uid);

      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      res.json({
        uid: decodedClaims.uid,
        email: decodedClaims.email,
        name: user.name,
        role: user.role,
      });
    } catch (error) {
      console.error("[Firebase Auth] Get user failed", error);
      res.status(500).json({ error: "Failed to get user info" });
    }
  });
}

/**
 * Middleware to verify Firebase session cookie
 * Attaches user info to req.user
 */
export async function verifyFirebaseSession(req: Request): Promise<admin.auth.DecodedIdToken | null> {
  const sessionCookie = req.cookies?.[COOKIE_NAME];

  if (!sessionCookie) {
    return null;
  }

  try {
    const decodedClaims = await verifySessionCookie(sessionCookie);
    return decodedClaims;
  } catch (error) {
    console.error('[Firebase Auth] Session verification failed:', error);
    return null;
  }
}
