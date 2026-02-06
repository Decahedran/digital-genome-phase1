// src/lib/auth.ts
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    updateProfile,
} from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

/**
 * Registers a new user with email and password, then creates a Firestore document
 */
export async function registerUser(
  email: string,
  password: string,
  displayName?: string
) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName) {
    await updateProfile(cred.user, { displayName });
  }
  // Create a user document in Firestore
  const ref = doc(db, 'users', cred.user.uid);
  await setDoc(ref, {
    email,
    displayName: displayName || null,
    createdAt: serverTimestamp(),
    profileCount: 0,
    plan: 'free',
  });
}

/**
 * Logs a user in with email and password
 */
export async function loginUser(email: string, password: string) {
  await signInWithEmailAndPassword(auth, email, password);
}

/**
 * Logs the current user out
 */
export async function logoutUser() {
  await signOut(auth);
}
