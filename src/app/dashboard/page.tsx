"use client";

import ProfileList from '@/components/ProfileList';
import { logoutUser } from '@/lib/auth';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace('/login');
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="app-shell">
        <main className="page">
          <p className="muted">Loading dashboard…</p>
        </main>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <main className="page space-y-6">
        <section className="card card-body flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-sm muted">Manage profiles and run assessments from one place.</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link href="/profiles/new" className="btn btn-secondary">
              New Profile
            </Link>
            <button
              className="btn btn-danger"
              onClick={async () => {
                await logoutUser();
                router.push('/login');
              }}
            >
              Log out
            </button>
          </div>
        </section>

        <ProfileList />
      </main>
    </div>
  );
}
