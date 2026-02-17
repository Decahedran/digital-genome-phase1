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
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to load profile.';
        setError(message);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [profileId, router]);

  if (loading) {
    return (
      <div className="app-shell">
        <main className="page">
          <p className="muted">Loading assessment…</p>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-shell">
        <main className="page">
          <p className="text-sm text-red-600">Error: {error}</p>
        </main>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="app-shell">
        <main className="page">
          <p className="muted">Profile not found.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <main className="page-narrow space-y-4">
        <Link href={`/profiles/${profile.id}`} className="text-sm font-medium">
          ← Back to profile
        </Link>

        <section className="card card-body space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Gene A Assessment</h1>
          <p className="text-sm muted">
            Profile: <span className="font-semibold text-zinc-900 dark:text-zinc-100">{profile.name}</span>
          </p>
        </section>

        <GeneAAssessmentForm profileId={profile.id} />
      </main>
    </div>
  );
}
