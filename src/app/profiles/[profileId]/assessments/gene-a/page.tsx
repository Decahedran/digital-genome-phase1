"use client";

import GeneAAssessmentForm from '@/components/GeneAAssessmentForm';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type ProfileDoc = {
  userId: string;
  name: string;
};

export default function GeneAAssessmentPage() {
  const router = useRouter();
  const params = useParams<{ profileId: string }>();
  const profileId = params?.profileId;

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<(ProfileDoc & { id: string }) | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profileId) return;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (!user) {
          router.replace('/login');
          return;
        }

        const ref = doc(db, 'profiles', profileId);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          router.replace('/dashboard');
          return;
        }

        const data = snap.data() as ProfileDoc;
        if (data.userId !== user.uid) {
          router.replace('/dashboard');
          return;
        }

        setProfile({ id: snap.id, ...data });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load profile.';
        setError(message);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [profileId, router]);

  if (loading) return <p className="p-4">Loading…</p>;
  if (error) return <p className="p-4 text-red-600">Error: {error}</p>;
  if (!profile) return <p className="p-4">Profile not found.</p>;

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-2xl font-bold">Gene A Assessment</h1>
      <p className="text-sm text-zinc-700 dark:text-zinc-200">
        Profile: <span className="font-semibold">{profile.name}</span>
      </p>

      <GeneAAssessmentForm profileId={profile.id} />

      <Link href={`/profiles/${profile.id}`} className="inline-block text-sm text-blue-600 underline">
        ← Back to profile
      </Link>
    </div>
  );
}
