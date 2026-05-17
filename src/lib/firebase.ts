// ─────────────────────────────────────────────────────────────────────────────
// src/lib/firebase.ts
//
// SETUP INSTRUCTIONS:
// 1. Go to https://console.firebase.google.com
// 2. Create a project (or open your existing one)
// 3. Click the </> web icon to "Add a web app"
// 4. Copy the firebaseConfig values shown and paste below
// 5. In the Firebase console sidebar: Build → Firestore Database → Create database
// 6. In the Firebase console sidebar: Build → Authentication → Get started → Enable Email/Password
// ─────────────────────────────────────────────────────────────────────────────

import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  type User,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
  type DocumentData,
} from "firebase/firestore";

// ─── PASTE YOUR FIREBASE CONFIG HERE ─────────────────────────────────────────
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};
// ─────────────────────────────────────────────────────────────────────────────

// Initialize only once (SSR / HMR safe)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db   = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// ─── Auth helpers ─────────────────────────────────────────────────────────────

export async function registerWithEmail(email: string, password: string, displayName: string) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  const user = credential.user;
  // Attempt to create the user profile — don't block auth if Firestore is not yet enabled
  try {
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email,
      displayName,
      createdAt: serverTimestamp(),
      sessions: [],
      readinessScore: 0,
    });
  } catch {
    // Firestore may not be enabled yet — auth still succeeds
    console.warn("Firestore profile write skipped:", user.uid);
  }
  return user;
}

export async function loginWithEmail(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function loginWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  const user   = result.user;
  // Upsert user document (new users only)
  try {
    const ref = doc(db, "users", user.uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        createdAt: serverTimestamp(),
        sessions: [],
        readinessScore: 0,
      });
    }
  } catch {
    console.warn("Firestore upsert skipped for Google user:", user.uid);
  }
  return user;
}

export function logout() {
  return signOut(auth);
}

export function onUserChange(cb: (user: User | null) => void) {
  return onAuthStateChanged(auth, cb);
}

// ─── Firestore helpers ────────────────────────────────────────────────────────

/** Save a candidate's resume + job description profile */
export async function saveProfile(uid: string, data: {
  resumeText: string;
  jobDescription: string;
  targetRole: string;
}) {
  await updateDoc(doc(db, "users", uid), {
    profile: { ...data, updatedAt: serverTimestamp() },
  });
}

/** Save a completed interview session */
export async function saveSession(uid: string, session: {
  twinId: string;
  twinName: string;
  durationMs: number;
  scores: { clarity: number; pace: number; confidence: number; energy: number };
  transcript: { role: "ai" | "user"; text: string }[];
}) {
  const sessionRef = doc(collection(db, "users", uid, "sessions"));
  await setDoc(sessionRef, {
    ...session,
    createdAt: serverTimestamp(),
  });
  return sessionRef.id;
}

/** Fetch a user's profile from Firestore */
export async function fetchUserProfile(uid: string): Promise<DocumentData | null> {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data() : null;
}
