import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, type Auth } from 'firebase/auth';

// Config comes from the gitignored .env (VITE_FIREBASE_*). When absent, the
// Google button is hidden so the app still works without Firebase.
const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string | undefined,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string | undefined,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string | undefined,
};

export const firebaseEnabled = Boolean(config.apiKey);

let auth: Auth | null = null;
if (firebaseEnabled) {
  const app = initializeApp(config as Record<string, string>);
  auth = getAuth(app);
}

/** Opens the Google sign-in popup and returns the account's email + name. */
export async function signInWithGoogle(): Promise<{ email: string; name: string } | null> {
  if (!auth) return null;
  const result = await signInWithPopup(auth, new GoogleAuthProvider());
  return { email: result.user.email ?? '', name: result.user.displayName ?? '' };
}
