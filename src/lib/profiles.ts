// src/lib/profiles.ts
import {
    addDoc, collection,
    doc,
    getDocs,
    query,
    serverTimestamp, updateDoc,
    where
} from 'firebase/firestore';
import { db } from './firebase';

export interface Profile {
  id: string;
  userId: string;
  name: string;
  genomeVersion: string;
  genomeBlocks: number[];
  genomeString: string;
  createdAt: any;
}

/** Creates a new profile document for the specified user. Returns the new document ID. */
export async function createProfile(userId: string, name: string) {
  // Placeholder genome values (will be computed in a later phase)
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
  return profileRef.id;
}

/** Creates a default profile for a newly registered user and updates the user's profile count. */
export async function createDefaultProfileForUser(userId: string) {
  const id = await createProfile(userId, 'Primary Profile');
  const userDoc = doc(db, 'users', userId);
  await updateDoc(userDoc, { profileCount: 1 });
  return id;
}

/** Retrieves all profiles belonging to a user as a simple array. */
export async function getProfilesForUser(userId: string): Promise<Profile[]> {
  const q = query(collection(db, 'profiles'), where('userId', '==', userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      userId: data.userId,
      name: data.name,
      genomeVersion: data.genomeVersion,
      genomeBlocks: data.genomeBlocks,
      genomeString: data.genomeString,
      createdAt: data.createdAt,
    } as Profile;
  });
}
