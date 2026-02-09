// src/components/TraitEditor.tsx
"use client";
import { getTraits, mergeTraits } from '@/lib/traits';
import { useEffect, useState } from 'react';

interface TraitEditorProps {
  profileId: string;
}

export default function TraitEditor({ profileId }: TraitEditorProps) {
  const [traits, setTraits] = useState<{ [key: string]: any }>({});
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load traits on mount
    getTraits(profileId).then((doc) => {
      setTraits(doc?.values || {});
      setLoading(false);
    });
  }, [profileId]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Trait name is required');
      return;
    }
    // Convert to number if possible; otherwise leave as string
    const numeric = Number(value);
    const val = isNaN(numeric) ? value : numeric;
    try {
      await mergeTraits(profileId, { [trimmed]: val });
      setTraits((prev) => ({ ...prev, [trimmed]: val }));
      setName('');
      setValue('');
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) return <p>Loading traits…</p>;

  return (
    <div className="mt-6 border p-4 rounded">
      <h3 className="text-lg font-semibold mb-2">Traits</h3>
      {Object.keys(traits).length === 0 ? (
        <p>No traits yet.</p>
      ) : (
        <ul className="text-sm mb-4">
          {Object.entries(traits).map(([key, val]) => (
            <li key={key} className="flex justify-between border-b py-1">
              <span className="font-medium">{key}</span>
              <span>{String(val)}</span>
            </li>
          ))}
        </ul>
      )}
      <form onSubmit={handleUpdate} className="space-y-2">
        <div className="flex flex-col">
          <label className="text-sm font-medium">Trait Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border p-1 rounded"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-medium">Value (number or text)</label>
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="border p-1 rounded"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-3 py-1 rounded"
        >
          Update Trait
        </button>
        {error && <p className="text-red-600 text-sm">{error}</p>}
      </form>
    </div>
  );
}
