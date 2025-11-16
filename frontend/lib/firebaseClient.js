import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult as firebaseGetRedirectResult, signOut, onAuthStateChanged, setPersistence, browserLocalPersistence } from 'firebase/auth';

// Helper to clean env values that may be quoted in .env
function cleanEnv(v) {
  if (!v && v !== '') return v;
  return String(v).trim().replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1');
}

const firebaseConfig = {
  apiKey: cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
  authDomain: cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN),
  projectId: cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
  storageBucket: cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID),
  appId: cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_APP_ID),
  measurementId: cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID),
};

function ensureClientSide() {
  if (typeof window === 'undefined') {
    // Running on server — do not initialize Firebase here.
    return false;
  }
  return true;
}

// Module-level cached auth instance
let authInstance = null;
let persistenceSet = false;

function ensureAppInitialized() {
  if (!ensureClientSide()) return false;
  // Provide explicit guidance if apiKey missing: this helps avoid the vague "invalid-api-key" at runtime.
  if (!firebaseConfig.apiKey) {
    // Note: do not initialize on server. Give clear instructions for the frontend env.
    console.error(
      'Firebase client not initialized: NEXT_PUBLIC_FIREBASE_API_KEY is missing or empty.\n' +
      'Fix: create a frontend .env.local with NEXT_PUBLIC_FIREBASE_API_KEY (and other NEXT_PUBLIC_FIREBASE_* values) and restart Next.js.\n' +
      'Example .env.local contents (no surrounding quotes):\n' +
      'NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here\n' +
      'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com\n' +
      'NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id\n' +
      'Then restart the dev server.'
    );
    return false;
  }

  if (!getApps().length) {
    try {
      initializeApp(firebaseConfig);
    } catch (e) {
      console.warn('Firebase initializeApp failed:', e && e.message ? e.message : e);
      return false;
    }
  }
  return true;
}

function getAuthIfReady() {
  // Return cached if ready
  if (authInstance) return authInstance;
  if (!ensureClientSide()) return null;
  if (!ensureAppInitialized()) {
    // Provide clearer guidance in the thrown error path below
    return null;
  }
  try {
    authInstance = getAuth();
    // ensure persistence (set once)
    if (!persistenceSet) {
      try {
        // set browser local persistence so user stays signed in across reloads
        setPersistence(authInstance, browserLocalPersistence).then(() => {
          persistenceSet = true;
          // noop - persistence set
        }).catch((err) => {
          console.warn('Failed to set Firebase persistence:', err && err.message ? err.message : err);
        });
      } catch (e) {
        console.warn('setPersistence not available or failed:', e && e.message ? e.message : e);
      }
    }
    return authInstance;
  } catch (e) {
    console.warn('Firebase getAuth failed:', e && e.message ? e.message : e);
    return null;
  }
}

// Sign in with Google popup. Returns the UserCredential or throws if not available.
// Falls back to redirect if popup is blocked.
export async function signInWithGooglePopup() {
  const auth = getAuthIfReady();
  if (!auth) {
    // Throw with explicit instruction so caller (UI) can present/follow steps
    throw new Error(
      'Firebase Auth is not available in this environment. Ensure you have set the frontend NEXT_PUBLIC_FIREBASE_* env variables (especially NEXT_PUBLIC_FIREBASE_API_KEY) in frontend/.env.local (no quotes) and restarted Next.js. ' +
      'Also ensure this code runs in the browser (not on the server).'
    );
  }
  const provider = new GoogleAuthProvider();
  
  try {
    return await signInWithPopup(auth, provider);
  } catch (error) {
    // If popup is blocked, fall back to redirect
    if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user') {
      // Use redirect instead
      await signInWithRedirect(auth, provider);
      // This will redirect the page, so we throw a special error to indicate redirect
      throw new Error('REDIRECT_INITIATED');
    }
    throw error;
  }
}

// Sign in with Google redirect (alternative to popup)
export async function signInWithGoogleRedirect() {
  const auth = getAuthIfReady();
  if (!auth) {
    throw new Error(
      'Firebase Auth is not available in this environment. Ensure frontend NEXT_PUBLIC_FIREBASE_API_KEY is set and code runs in the browser.'
    );
  }
  const provider = new GoogleAuthProvider();
  return signInWithRedirect(auth, provider);
}

// Check if we're returning from a redirect and get the result
export async function getRedirectResult() {
  const auth = getAuthIfReady();
  if (!auth) return null;
  try {
    return await firebaseGetRedirectResult(auth);
  } catch (error) {
    console.error('Error getting redirect result:', error);
    return null;
  }
}

// Sign out current user.
export async function signOutUser() {
  const auth = getAuthIfReady();
  if (!auth) {
    throw new Error(
      'Firebase Auth is not available in this environment. Ensure frontend NEXT_PUBLIC_FIREBASE_API_KEY is set and code runs in the browser.'
    );
  }
  return signOut(auth);
}

// Return current auth user (may be null). Safe to call during SSR (returns null).
export function getCurrentUser() {
  const auth = getAuthIfReady();
  if (!auth) return null;
  return auth.currentUser || null;
}

// Return current user's ID token suitable for Authorization header (or null)
export async function getIdTokenForCurrentUser() {
  const auth = getAuthIfReady();
  if (!auth) return null;
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken();
}

// Subscribe to auth state changes. callback receives firebase user or null.
// Returns unsubscribe function.
export function onAuthStateChangedListener(callback) {
  const auth = getAuthIfReady();
  if (!auth) {
    // nothing to subscribe to on server; invoke callback(null) to clear state
    callback(null);
    return () => {};
  }
  // setPersistence attempted already in getAuthIfReady; onAuthStateChanged will reflect persisted user
  const unsub = onAuthStateChanged(auth, (user) => {
    // user is null when signed out
    callback(user);
  });
  return unsub;
}

// Example usage in Next.js client code:
// const credential = await signInWithGooglePopup();
// const idToken = await getIdTokenForCurrentUser();
// fetch('/api/some-protected', { headers: { Authorization: `Bearer ${idToken}` } });
