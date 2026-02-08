// Firebase client SDK configuration
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut
} from 'firebase/auth';

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
 * Sign in with Google redirect (more reliable than popup)
 * Returns the ID token that can be sent to the backend
 */
export async function signInWithGoogle() {
  try {
    // Use redirect instead of popup to avoid COOP issues
    await signInWithRedirect(auth, googleProvider);
    return null; // Redirect will happen, no immediate return
  } catch (error) {
    console.error('[Firebase Auth] Sign in failed:', error);
    throw error;
  }
}

/**
 * Handle redirect result after Google sign-in
 * Call this on app initialization
 */
export async function handleRedirectResult() {
  try {
    const result = await getRedirectResult(auth);
    if (!result) {
      return null; // No redirect result
    }

    // Get ID token and store in localStorage
    const idToken = await result.user.getIdToken();
    localStorage.setItem('firebase_id_token', idToken);

    return {
      success: true,
      user: {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
      }
    };
  } catch (error) {
    console.error('[Firebase Auth] Redirect result handling failed:', error);
    throw error;
  }
}

/**
 * Sign in with email and password
 * Returns the ID token that can be sent to the backend
 */
export async function signInWithEmail(email: string, password: string) {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);

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
  } catch (error: any) {
    console.error('[Firebase Auth] Email sign in failed:', error);
    throw error;
  }
}

/**
 * Sign up with email and password
 * Creates new user account and returns the ID token
 */
export async function signUpWithEmail(email: string, password: string) {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);

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
  } catch (error: any) {
    console.error('[Firebase Auth] Email sign up failed:', error);
    throw error;
  }
}

/**
 * Sign out user
 * Clears localStorage and signs out from Firebase
 */
export async function signOut() {
  try {
    // Clear stored token
    localStorage.removeItem('firebase_id_token');

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
  if (!user) {
    // Try to get from localStorage as fallback
    return localStorage.getItem('firebase_id_token');
  }

  try {
    const idToken = await user.getIdToken();
    localStorage.setItem('firebase_id_token', idToken);
    return idToken;
  } catch (error) {
    console.error('[Firebase Auth] Failed to get ID token:', error);
    return localStorage.getItem('firebase_id_token');
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!auth.currentUser || !!localStorage.getItem('firebase_id_token');
}
