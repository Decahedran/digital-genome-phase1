// src/app/register/page.tsx
"use client";
import { registerUser } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await registerUser(email, password, displayName);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md p-4">
      <h1 className="text-2xl font-bold mb-4">Create an Account</h1>
      <form onSubmit={handleSubmit} className="flex flex-col space-y-3">
        <label className="flex flex-col">
          Display Name
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            className="border p-2 rounded"
          />
        </label>
        <label className="flex flex-col">
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="border p-2 rounded"
          />
        </label>
        <label className="flex flex-col">
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="border p-2 rounded"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-gray-500"
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
        {error && <p className="text-red-600">{error}</p>}
      </form>
      <p className="mt-4 text-sm">
        Already have an account?{' '}
        <a href="/login" className="text-blue-600 underline">
          Log in
        </a>
      </p>
    </div>
  );
}
