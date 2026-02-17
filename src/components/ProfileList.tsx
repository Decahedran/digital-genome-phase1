"use client";
import { auth } from '@/lib/firebase';
import { getProfilesForUser, Profile } from '@/lib/profiles';
import { onAuthStateChanged } from 'firebase/auth';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function ProfileList() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const data = await getProfilesForUser(user.uid);
        setProfiles(data);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <p>Loading profiles…</p>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Your Profiles</h2>
      {profiles.length === 0 ? (
        <p>You have no profiles.{' '}
          <Link href="/profiles/new" className="text-blue-600 underline">
            Create one
          </Link>.
        </p>
      ) : (
        <ul className="space-y-2">
          {profiles.map((profile) => (
            <li key={profile.id} className="border p-3 rounded shadow-sm">
              <Link href={`/profiles/${profile.id}`} className="text-blue-600 font-medium underline">
                {profile.name}
              </Link>
              <p className="text-sm text-zinc-600 dark:text-zinc-300">
                Genome: {profile.genomeString}
              </p>
            </li>
          ))}
        </ul>
      )}
      <Link
        href="/profiles/new"
        className="inline-block mt-4 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
      >
        + New Profile
      </Link>
    </div>
  );
}
