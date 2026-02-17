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

  if (loading) {
    return <p className="muted">Loading profiles…</p>;
  }

  return (
    <section className="card card-body space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Your Profiles</h2>
          <p className="text-sm muted">Select a profile to view traits, genome state, and assessments.</p>
        </div>

        <Link href="/profiles/new" className="btn btn-primary">
          + New Profile
        </Link>
      </div>

      {profiles.length === 0 ? (
        <p className="rounded-xl border border-dashed p-4 text-sm muted">
          No profiles yet. Create your first profile to start assessment tracking.
        </p>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {profiles.map((profile) => (
            <li key={profile.id} className="rounded-xl border p-4">
              <div className="space-y-2">
                <Link href={`/profiles/${profile.id}`} className="text-base font-semibold">
                  {profile.name}
                </Link>
                <p className="text-xs font-semibold uppercase tracking-wide muted">Genome</p>
                <p className="font-mono text-sm">{profile.genomeString}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
