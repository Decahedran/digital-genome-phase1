"use client";

import { getTraits, mergeTraits } from '@/lib/traits';
import { useEffect, useState } from 'react';

interface TraitEditorProps {
  profileId: string;
}

export default function TraitEditor({ profileId }: TraitEditorProps) {
  const [traits, setTraits] = useState<Record<string, string | number>>({});
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getTraits(profileId).then((doc) => {
      setTraits((doc?.values as Record<string, string | number>) || {});
      setLoading(false);
    });
  }, [profileId]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const traitName = name.trim();
    if (!traitName) {
      setError('Trait name is required.');
      return;
    }

    const numericValue = Number(value);
    const traitValue = Number.isNaN(numericValue) ? value : numericValue;

    try {
      await mergeTraits(profileId, { [traitName]: traitValue });
      setTraits((prev) => ({ ...prev, [traitName]: traitValue }));
      setName('');
      setValue('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update trait.';
      setError(message);
    }
  };

  if (loading) {
    return <p className="muted">Loading traits…</p>;
  }

  return (
    <section className="card card-body space-y-4">
      <header>
        <h2 className="text-xl font-semibold">Trait Editor</h2>
        <p className="text-sm muted">Manual trait patching for testing and validation.</p>
      </header>

      {Object.keys(traits).length === 0 ? (
        <p className="rounded-xl border border-dashed p-4 text-sm muted">No traits saved yet for this profile.</p>
      ) : (
        <ul className="space-y-2">
          {Object.entries(traits).map(([key, val]) => (
            <li key={key} className="flex items-center justify-between rounded-xl border px-3 py-2 text-sm">
              <span className="font-medium">{key}</span>
              <span className="font-mono">{String(val)}</span>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleUpdate} className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="trait-name" className="label">
            Trait name
          </label>
          <input
            id="trait-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. physical_height_cm"
          />
        </div>

        <div>
          <label htmlFor="trait-value" className="label">
            Trait value
          </label>
          <input
            id="trait-value"
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="e.g. 180 or high"
          />
        </div>

        <div className="sm:col-span-2">
          <button type="submit" className="btn btn-secondary w-full sm:w-auto">
            Update trait
          </button>
        </div>
      </form>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </section>
  );
}
