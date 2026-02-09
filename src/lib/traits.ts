// src/lib/traits.ts
import {
    doc,
    getDoc,
    serverTimestamp,
    setDoc,
    updateDoc,
} from 'firebase/firestore';
import { db } from './firebase';

export interface TraitsDocument {
  userId: string;
  profileId: string;
  updatedAt: any;
  values: Record<string, number | string>;
}

/**
 * Initializes an empty traits document for a profile.
 * Called when a new profile is created.
 */
export async function initializeTraitsForProfile(userId: string, profileId: string) {
  const ref = doc(db, 'traits', profileId);
  await setDoc(ref, {
    userId,
    profileId,
    updatedAt: serverTimestamp(),
    values: {},
  });
}

/**
 * Retrieves the traits document for a profile.
 */
export async function getTraits(profileId: string): Promise<TraitsDocument | undefined> {
  const ref = doc(db, 'traits', profileId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return undefined;
  return snap.data() as TraitsDocument;
}

/**
 * Merge a patch into existing traits.values (non-destructive).
 * This updates only the keys you pass in.
 */
export async function mergeTraits(profileId: string, patch: Record<string, number | string>) {
  const ref = doc(db, 'traits', profileId);

  // IMPORTANT: update nested keys so we don't overwrite the whole values object
  const updates: Record<string, any> = { updatedAt: serverTimestamp() };
  for (const [k, v] of Object.entries(patch)) {
    updates[`values.${k}`] = v;
  }

  await updateDoc(ref, updates);
}

/**
 * Replace all traits.values (destructive).
 */
export async function setTraits(profileId: string, values: Record<string, number | string>) {
  const ref = doc(db, 'traits', profileId);
  await updateDoc(ref, {
    values,
    updatedAt: serverTimestamp(),
  });
}
