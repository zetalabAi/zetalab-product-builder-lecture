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
import { FirebaseError } from 'firebase/app';
import { AuthError, NetworkError } from './errors';

/**
 * Helper function to create session cookie
 */
async function createSessionCookie(idToken: string) {
  const response = await fetch('/api/auth/session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ idToken }),
  });

  if (!response.ok) {
    throw new AuthError('세션 생성에 실패했습니다');
  }

  return response.json();
}

// Firebase configuration
// Validate environment variables
function getFirebaseConfig() {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;

  if (!apiKey || !authDomain || !projectId) {
    throw new Error(
      'Firebase configuration missing. Please set VITE_FIREBASE_API_KEY, ' +
      'VITE_FIREBASE_AUTH_DOMAIN, and VITE_FIREBASE_PROJECT_ID in .env.local'
    );
  }

  return {
    apiKey,
    authDomain,
    projectId,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || `${projectId}.appspot.com`,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  };
}

// Initialize Firebase
const app = initializeApp(getFirebaseConfig());

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
    console.log('[Firebase Auth] Checking redirect result...');
    const result = await getRedirectResult(auth);

    if (!result) {
      console.log('[Firebase Auth] No redirect result');
      return null; // No redirect result
    }

    console.log('[Firebase Auth] Redirect result found:', {
      uid: result.user.uid,
      email: result.user.email,
      displayName: result.user.displayName,
      photoURL: result.user.photoURL,
    });

    // Get ID token
    const idToken = await result.user.getIdToken();
    console.log('[Firebase Auth] Got ID token:', idToken.substring(0, 50) + '...');

    // Store in localStorage
    localStorage.setItem('firebase_id_token', idToken);
    console.log('[Firebase Auth] Stored token in localStorage');

    // Send to backend to create session and upsert user
    try {
      console.log('[Firebase Auth] Creating session on server...');
      const response = await fetch('/api/auth/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[Firebase Auth] Session creation failed:', response.status, errorText);
        // Continue anyway - Authorization header will work
      } else {
        const data = await response.json();
        console.log('[Firebase Auth] Session created successfully:', data);
      }
    } catch (sessionError) {
      console.error('[Firebase Auth] Session creation error:', sessionError);
      // Continue anyway - Authorization header will work
    }

    return {
      success: true,
      user: {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
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

    // Get ID token and create session
    const idToken = await result.user.getIdToken();
    return await createSessionCookie(idToken);
  } catch (error: unknown) {
    console.error('[Firebase Auth] Email sign in failed:', error);

    // Handle specific Firebase Auth errors
    if (error instanceof FirebaseError) {
      switch (error.code) {
        case 'auth/user-not-found':
          throw new AuthError('등록되지 않은 이메일입니다', error.code);
        case 'auth/wrong-password':
          throw new AuthError('비밀번호가 올바르지 않습니다', error.code);
        case 'auth/invalid-email':
          throw new AuthError('올바른 이메일 형식이 아닙니다', error.code);
        case 'auth/user-disabled':
          throw new AuthError('비활성화된 계정입니다', error.code);
        case 'auth/too-many-requests':
          throw new AuthError('너무 많은 로그인 시도가 있었습니다. 잠시 후 다시 시도해주세요', error.code);
        case 'auth/network-request-failed':
          throw new NetworkError('네트워크 연결을 확인해주세요');
        default:
          throw new AuthError(error.message, error.code);
      }
    }

    // Handle network errors
    if (error instanceof Error && error.message.includes('fetch')) {
      throw new NetworkError();
    }

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

    // Get ID token and create session
    const idToken = await result.user.getIdToken();
    return await createSessionCookie(idToken);
  } catch (error: unknown) {
    console.error('[Firebase Auth] Email sign up failed:', error);

    // Handle specific Firebase Auth errors
    if (error instanceof FirebaseError) {
      switch (error.code) {
        case 'auth/email-already-in-use':
          throw new AuthError('이미 사용 중인 이메일입니다', error.code);
        case 'auth/invalid-email':
          throw new AuthError('올바른 이메일 형식이 아닙니다', error.code);
        case 'auth/weak-password':
          throw new AuthError('비밀번호는 최소 6자 이상이어야 합니다', error.code);
        case 'auth/operation-not-allowed':
          throw new AuthError('이메일 가입이 비활성화되어 있습니다', error.code);
        case 'auth/network-request-failed':
          throw new NetworkError('네트워크 연결을 확인해주세요');
        default:
          throw new AuthError(error.message, error.code);
      }
    }

    // Handle network errors
    if (error instanceof Error && error.message.includes('fetch')) {
      throw new NetworkError();
    }

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
