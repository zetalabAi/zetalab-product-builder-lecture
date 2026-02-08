import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import express from "express";
import cookieParser from "cookie-parser";
// Initialize Firebase Admin
admin.initializeApp();
const app = express();
// Middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());
// CORS for Firebase Hosting
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") {
        res.sendStatus(200);
        return;
    }
    next();
});
// Auth routes
app.post("/api/auth/session", async (req, res) => {
    const idToken = req.body.idToken;
    if (!idToken) {
        res.status(400).json({ error: "idToken is required" });
        return;
    }
    try {
        // Verify ID token
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        // Create session cookie (max 2 weeks)
        const expiresIn = 60 * 60 * 24 * 14 * 1000; // 2 weeks
        const sessionCookie = await admin.auth().createSessionCookie(idToken, {
            expiresIn,
        });
        // Get user info
        const userRecord = await admin.auth().getUser(decodedToken.uid);
        // Set session cookie
        res.cookie("app_session_id", sessionCookie, {
            maxAge: expiresIn,
            httpOnly: true,
            secure: true,
            sameSite: "lax",
        });
        res.json({
            success: true,
            user: {
                uid: decodedToken.uid,
                email: userRecord.email,
                displayName: userRecord.displayName,
            },
        });
    }
    catch (error) {
        console.error("[Firebase Auth] Session creation failed", error);
        res.status(500).json({ error: "Authentication failed" });
    }
});
app.post("/api/auth/logout", async (req, res) => {
    res.clearCookie("app_session_id");
    res.json({ success: true });
});
// Export as Firebase Function
export const api = functions.https.onRequest(app);
