"use client";
import CreateProfileForm from '@/components/CreateProfileForm';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
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

  if (loading) return <p>Loading…</p>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Create a New Profile</h1>
      <CreateProfileForm />
    </div>
  );
}
