"use client";

import TraitEditor from "@/components/TraitEditor";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type ProfileDoc = {
  userId: string;
  name: string;
  genomeVersion?: string;
  genomeString?: string;
  createdAt?: any;
};

export default function ProfileDetailPage() {
  const router = useRouter();
  const params = useParams<{ profileId: string }>();
  const profileId = params?.profileId;

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<(ProfileDoc & { id: string }) | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profileId) return;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (!user) {
          router.replace("/login");
          return;
        }

        const ref = doc(db, "profiles", profileId);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          router.replace("/dashboard");
          return;
        }

        const data = snap.data() as ProfileDoc;

        // Ownership check (defense in depth; rules should also enforce this)
        if (data.userId !== user.uid) {
          router.replace("/dashboard");
          return;
        }

        setProfile({ id: snap.id, ...data });
        setLoading(false);
      } catch (e: any) {
        console.error(e);
        setError(e?.message ?? "Failed to load profile.");
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [profileId, router]);

  if (loading) return <p className="p-4">Loading…</p>;
  if (error) return <p className="p-4 text-red-600">Error: {error}</p>;
  if (!profile) return <p className="p-4">No profile found.</p>;

  return (
    <div className="p-4 space-y-2">
      <h1 className="text-2xl font-bold">{profile.name}</h1>

      <p>
        <span className="font-semibold">Genome Version:</span>{" "}
        {profile.genomeVersion ?? "1.2"}
      </p>

      <p>
        <span className="font-semibold">Genome:</span>{" "}
        {profile.genomeString ?? "000-000-000-000-000-000-000-000"}
      </p>

      <p className="text-sm text-zinc-600 dark:text-zinc-300">
        Created at: {profile.createdAt?.toDate?.().toLocaleString?.() ?? "N/A"}
      </p>

      <Link
        href={`/profiles/${profile.id}/assessments/gene-a`}
        className="inline-block rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
      >
        Take / Retake Gene A Assessment
      </Link>

      {/* Trait system testing UI */}
      <TraitEditor profileId={profile.id} />
    </div>
  );
}
