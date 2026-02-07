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
      const id = await createProfile(user.uid, name);
      router.push(`/profiles/${id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-3">
      <label className="block">
        <span className="text-sm font-medium">Profile Name</span>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full border p-2 rounded"
        />
      </label>
      <button
        type="submit"
        disabled={loading}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-500"
      >
        {loading ? 'Creating…' : 'Create Profile'}
      </button>
      {error && <p className="text-red-600 text-sm">{error}</p>}
    </form>
  );
}
