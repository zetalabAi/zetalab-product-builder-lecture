// Firebase Authentication helpers for ZetaLab
import admin from 'firebase-admin';
import type { Express, Request, Response } from "express";
import { COOKIE_NAME, ONE_YEAR_MS, TWO_WEEKS_MS } from "@shared/const";
import { getSessionCookieOptions } from "./cookies";
import * as db from "../db";

// Initialize Firebase Admin if not already initialized
function initializeFirebase() {
  if (admin.apps.length > 0) {
    console.log('[Firebase Admin] Already initialized');
    return;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;

  if (!projectId) {
    console.error('[Firebase Admin] FIREBASE_PROJECT_ID environment variable is missing');
    throw new Error('FIREBASE_PROJECT_ID environment variable is required');
  }

  console.log(`[Firebase Admin] Initializing with project: ${projectId}`);

  try {
    // Try to initialize with Application Default Credentials
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId: projectId
    });
    console.log('[Firebase Admin] ✓ Successfully initialized with Application Default Credentials');
  } catch (error: any) {
    // Fallback: Initialize without credentials for development
    console.warn('[Firebase Admin] ⚠ Application Default Credentials not found');
    console.warn('[Firebase Admin] ⚠ Error:', error?.message || error);
    console.warn('[Firebase Admin] ⚠ Initializing in development mode (limited functionality)');
    console.warn('[Firebase Admin] ⚠ For production, please configure one of the following:');
    console.warn('[Firebase Admin]   1. Set GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json');
    console.warn('[Firebase Admin]   2. Run: gcloud auth application-default login');

    try {
      // Initialize with cert if available, otherwise minimal config
      admin.initializeApp({
        projectId: projectId
      });
      console.log('[Firebase Admin] ✓ Initialized in development mode');
    } catch (initError: any) {
      console.error('[Firebase Admin] ✗ Failed to initialize:', initError?.message || initError);
      throw initError;
    }
  }
}

// Initialize on module load
try {
  initializeFirebase();
} catch (error) {
  console.error('[Firebase Admin] Fatal initialization error:', error);
}

/**
 * Verify Firebase ID token from request
 * @param idToken - Firebase ID token from client
 * @returns Decoded token with user info
 */
export async function verifyIdToken(idToken: string) {
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error: any) {
    console.error('[Firebase Auth] Token verification failed:', error?.message || error);

    // If the error is due to missing credentials, try alternative verification
    if (error?.message?.includes('Could not load the default credentials') ||
        error?.message?.includes('Application Default Credentials')) {
      console.warn('[Firebase Auth] Falling back to public key verification');

      // Import jwt-decode for fallback verification
      try {
        // Use Firebase REST API for public verification
        const response = await fetch(
          `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${process.env.VITE_FIREBASE_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken })
          }
        );

        if (!response.ok) {
          throw new Error('Token verification via REST API failed');
        }

        const data = await response.json();
        if (data.users && data.users[0]) {
          const user = data.users[0];
          // Return a structure similar to admin.auth().DecodedIdToken
          return {
            uid: user.localId,
            email: user.email,
            email_verified: user.emailVerified,
            name: user.displayName,
            picture: user.photoUrl,
            firebase: {
              sign_in_provider: user.providerUserInfo?.[0]?.providerId || 'unknown'
            }
          } as any;
        }
      } catch (fallbackError) {
        console.error('[Firebase Auth] Fallback verification failed:', fallbackError);
      }
    }

    throw new Error('Invalid authentication token');
  }
}

/**
 * Create a session cookie for the user
 * @param idToken - Firebase ID token
 * @param expiresIn - Session duration in milliseconds (max 2 weeks for Firebase)
 * @returns Session cookie string
 */
export async function createSessionCookie(idToken: string, expiresIn: number = TWO_WEEKS_MS) {
  // Firebase requires session cookie duration between 5 minutes and 2 weeks
  const FIVE_MINUTES_MS = 5 * 60 * 1000;
  const MAX_SESSION_MS = TWO_WEEKS_MS;

  // Clamp the value to Firebase's allowed range
  const validExpiresIn = Math.min(Math.max(expiresIn, FIVE_MINUTES_MS), MAX_SESSION_MS);

  try {
    const sessionCookie = await admin.auth().createSessionCookie(idToken, {
      expiresIn: validExpiresIn,
    });
    return sessionCookie;
  } catch (error: any) {
    console.error('[Firebase Auth] Session cookie creation failed:', error?.message || error);

    // If credentials are missing, use the idToken as session cookie (dev fallback)
    if (error?.message?.includes('Could not load the default credentials') ||
        error?.message?.includes('Application Default Credentials')) {
      console.warn('[Firebase Auth] Using idToken as session cookie (development mode)');
      console.warn('[Firebase Auth] For production, please set up Firebase Admin SDK credentials');

      // In development, we can use the ID token directly as a session token
      // This is NOT recommended for production
      return idToken;
    }

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
  } catch (error: any) {
    console.error('[Firebase Auth] Session verification failed:', error?.message || error);

    // Fallback: Try to verify as ID token (development mode)
    if (error?.message?.includes('Could not load the default credentials') ||
        error?.message?.includes('Application Default Credentials') ||
        error?.code === 'auth/argument-error') {
      try {
        // Try verifying as an ID token instead
        const decodedToken = await verifyIdToken(sessionCookie);
        return decodedToken;
      } catch (fallbackError) {
        console.error('[Firebase Auth] Fallback session verification failed:', fallbackError);
      }
    }

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

      // Create session cookie (Firebase max: 2 weeks)
      const sessionCookie = await createSessionCookie(idToken, TWO_WEEKS_MS);

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
 * Middleware to verify Firebase session cookie or Authorization header
 * Attaches user info to req.user
 */
export async function verifyFirebaseSession(req: Request): Promise<admin.auth.DecodedIdToken | null> {
  // First, try Authorization header (for ID tokens)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const idToken = authHeader.substring(7); // Remove 'Bearer ' prefix
    try {
      const decodedToken = await verifyIdToken(idToken);
      return decodedToken;
    } catch (error) {
      console.error('[Firebase Auth] Authorization header verification failed:', error);
      // Continue to try session cookie
    }
  }

  // Fallback to session cookie
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
