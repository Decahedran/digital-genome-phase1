"use client";

import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

type ProfileDoc = {
  userId: string;
  name: string;
  genomeVersion?: string;
  genomeString?: string;
  createdAt?: { toDate?: () => Date };
};

type TraitsDoc = {
  values?: Record<string, string | number>;
};

const genePlaceholders = [
  { code: 'B', title: 'Cognition' },
  { code: 'C', title: 'Emotionality' },
  { code: 'D', title: 'Motivation' },
  { code: 'E', title: 'Sociality' },
  { code: 'F', title: 'Ethics' },
  { code: 'G', title: 'Behavior' },
  { code: 'H', title: 'Adaptability' },
];

export default function ProfileDetailPage() {
  const router = useRouter();
  const params = useParams<{ profileId: string }>();
  const profileId = params?.profileId;

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<(ProfileDoc & { id: string }) | null>(null);
  const [geneAValue, setGeneAValue] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profileId) return;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (!user) {
          router.replace('/login');
          return;
        }

        const profileRef = doc(db, 'profiles', profileId);
        const profileSnap = await getDoc(profileRef);

        if (!profileSnap.exists()) {
          router.replace('/dashboard');
          return;
        }

        const profileData = profileSnap.data() as ProfileDoc;
        if (profileData.userId !== user.uid) {
          router.replace('/dashboard');
          return;
        }

        const traitsRef = doc(db, 'traits', profileId);
        const traitsSnap = await getDoc(traitsRef);

        const traitsData = traitsSnap.exists() ? (traitsSnap.data() as TraitsDoc) : undefined;
        const rawGeneA = traitsData?.values?.gene_a;

        setGeneAValue(typeof rawGeneA === 'number' ? rawGeneA : null);
        setProfile({ id: profileSnap.id, ...profileData });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to load profile.';
        setError(message);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [profileId, router]);

  const geneAStatus = useMemo(() => {
    if (geneAValue === null) {
      return {
        assessed: false,
        label: 'Not Assessed',
        buttonText: 'Take Assessment',
      };
    }

    return {
      assessed: true,
      label: `Trait Value: ${String(geneAValue).padStart(3, '0')}`,
      buttonText: 'Retake Assessment',
    };
  }, [geneAValue]);

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
              <p className="mt-2 text-sm">{profile.createdAt?.toDate?.()?.toLocaleString?.() ?? 'N/A'}</p>
            </article>
          </div>
        </section>

        <section className="card card-body space-y-4">
          <h2 className="text-xl font-semibold">Genome Assessments</h2>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <article className="rounded-xl border p-4 space-y-3">
              <div>
                <h3 className="text-base font-semibold">Gene A: Physicality</h3>
                <p className="text-sm muted">{geneAStatus.label}</p>
              </div>

              <Link href={`/profiles/${profile.id}/assessments/gene-a`} className="btn btn-primary w-full">
                {geneAStatus.buttonText}
              </Link>
            </article>

            {genePlaceholders.map((gene) => (
              <article key={gene.code} className="rounded-xl border p-4 space-y-3">
                <div>
                  <h3 className="text-base font-semibold">Gene {gene.code}: {gene.title}</h3>
                  <p className="text-sm muted">Not Assessed</p>
                </div>
                <button type="button" disabled className="btn btn-secondary w-full">
                  Coming Soon
                </button>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
