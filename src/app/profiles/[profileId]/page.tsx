"use client";

import TraitEditor from '@/components/TraitEditor';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type ProfileDoc = {
  userId: string;
  name: string;
  genomeVersion?: string;
  genomeString?: string;
  createdAt?: { toDate?: () => Date };
};

export default function ProfileDetailPage() {
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
          <p className="muted">Loading profile…</p>
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
          <p className="muted">No profile found.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <main className="page space-y-6">
        <Link href="/dashboard" className="text-sm font-medium">
          ← Back to dashboard
        </Link>

        <section className="card card-body space-y-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">{profile.name}</h1>
            <div className="flex flex-wrap gap-3 text-sm">
              <span className="badge">Genome v{profile.genomeVersion ?? '1.2'}</span>
              <span className="badge">Profile ID: {profile.id}</span>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <article className="rounded-xl border p-4">
              <p className="text-xs font-semibold uppercase tracking-wide muted">Genome String</p>
              <p className="mt-2 font-mono text-sm">{profile.genomeString ?? '000-000-000-000-000-000-000-000'}</p>
            </article>

            <article className="rounded-xl border p-4">
              <p className="text-xs font-semibold uppercase tracking-wide muted">Created</p>
              <p className="mt-2 text-sm">
                {profile.createdAt?.toDate?.()?.toLocaleString?.() ?? 'N/A'}
              </p>
            </article>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link href={`/profiles/${profile.id}/assessments/gene-a`} className="btn btn-primary">
              Take / Retake Gene A
            </Link>
          </div>
        </section>

        <TraitEditor profileId={profile.id} />
      </main>
    </div>
  );
}
