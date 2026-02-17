"use client";

import { auth } from '@/lib/firebase';
import { createProfile } from '@/lib/profiles';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function CreateProfileForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const user = auth.currentUser;
    if (!user) {
      setError('You must be logged in to create a profile.');
      setLoading(false);
      return;
    }

    try {
      const id = await createProfile(user.uid, name.trim());
      router.push(`/profiles/${id}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create profile.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="profile-name" className="label">
          Profile name
        </label>
        <input
          id="profile-name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Primary Profile"
        />
      </div>

      <button type="submit" disabled={loading} className="btn btn-primary w-full">
        {loading ? 'Creating profile…' : 'Create profile'}
      </button>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </form>
  );
}
