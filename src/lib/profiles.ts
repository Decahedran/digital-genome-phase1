// src/lib/profiles.ts
import {
    addDoc,
    collection,
    doc,
    getDocs,
    query,
    serverTimestamp,
    updateDoc,
    where,
} from 'firebase/firestore';
import { db } from './firebase';
import { initializeTraitsForProfile } from './traits';

export interface Profile {
  id: string;
  userId: string;
  name: string;
  genomeVersion: string;
  genomeBlocks: number[];
  genomeString: string;
  createdAt: any;
}

/**
 * Creates a new profile doc for a user and initializes its traits doc.
 */
export async function createProfile(userId: string, name: string) {
  const defaultGenomeBlocks = [0, 0, 0, 0, 0, 0, 0, 0];
  const defaultGenomeString = '000-000-000-000-000-000-000-000';

  const profileRef = await addDoc(collection(db, 'profiles'), {
    userId,
    name,
    genomeVersion: '1.2',
    genomeBlocks: defaultGenomeBlocks,
    genomeString: defaultGenomeString,
    createdAt: serverTimestamp(),
  });

  // Initialize traits doc tied to this profile id
  await initializeTraitsForProfile(userId, profileRef.id);

  return profileRef.id;
}

/**
 * Creates the default "Primary Profile" for a new user.
 * Sets profileCount = 1 on the user document.
 */
export async function createDefaultProfileForUser(userId: string) {
  const id = await createProfile(userId, 'Primary Profile');

  const userDoc = doc(db, 'users', userId);
  await updateDoc(userDoc, { profileCount: 1 });

  return id;
}

/**
 * Fetch all profiles belonging to user.
 */
export async function getProfilesForUser(userId: string): Promise<Profile[]> {
  const q = query(collection(db, 'profiles'), where('userId', '==', userId));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((snap) => {
    const data = snap.data() as any;
    return {
      id: snap.id,
      userId: data.userId,
      name: data.name,
      genomeVersion: data.genomeVersion,
      genomeBlocks: data.genomeBlocks,
      genomeString: data.genomeString,
      createdAt: data.createdAt,
    } as Profile;
  });
}
