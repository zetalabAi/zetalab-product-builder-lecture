// Firebase client SDK configuration
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';

// Firebase configuration
// These values should be stored in environment variables for production
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDemoKey",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "zetalab-product-builder.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "zetalab-product-builder",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "zetalab-product-builder.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:abcdef"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();

/**
 * Sign in with Google popup
 * Returns the ID token that can be sent to the backend
 */
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);

    // Get ID token
    const idToken = await result.user.getIdToken();

    // Send ID token to backend to create session cookie
    const response = await fetch('/api/auth/session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idToken }),
    });

    if (!response.ok) {
      throw new Error('Failed to create session');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('[Firebase Auth] Sign in failed:', error);
    throw error;
  }
}

/**
 * Sign out user
 * Clears session cookie on backend and signs out from Firebase
 */
export async function signOut() {
  try {
    // Sign out from backend (clear session cookie)
    await fetch('/api/auth/logout', {
      method: 'POST',
    });

    // Sign out from Firebase
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('[Firebase Auth] Sign out failed:', error);
    throw error;
  }
}

/**
 * Get current user's ID token
 * Useful for making authenticated API calls
 */
export async function getCurrentUserIdToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;

  try {
    const idToken = await user.getIdToken();
    return idToken;
  } catch (error) {
    console.error('[Firebase Auth] Failed to get ID token:', error);
    return null;
  }
}
