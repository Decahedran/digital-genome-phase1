"use client";

import CreateProfileForm from '@/components/CreateProfileForm';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function NewProfilePage() {
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
          <p className="muted">Loading…</p>
        </main>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <main className="page-narrow space-y-4">
        <Link href="/dashboard" className="text-sm font-medium">
          ← Back to dashboard
        </Link>

        <section className="card card-body space-y-4">
          <header className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">Create a profile</h1>
            <p className="text-sm muted">Each profile represents a distinct identity record and genome timeline.</p>
          </header>

          <CreateProfileForm />
        </section>
      </main>
    </div>
  );
}
