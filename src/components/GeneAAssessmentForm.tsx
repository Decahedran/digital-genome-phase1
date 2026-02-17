"use client";

import {
  GenderIdentity,
  GeneARawResponses,
  HeightUnit,
  RaceCategory,
  imperialToCentimeters,
  saveGeneAAssessmentAndApply,
} from '@/lib/assessments';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

interface GeneAAssessmentFormProps {
  profileId: string;
}

const raceOptions: { label: string; value: RaceCategory }[] = [
  { label: 'Asian', value: 'asian' },
  { label: 'Black', value: 'black' },
  { label: 'Native', value: 'native' },
  { label: 'White', value: 'white' },
  { label: 'Other / Prefer Not To Say', value: 'other' },
];

const genderOptions: { label: string; value: GenderIdentity }[] = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Non-binary', value: 'non-binary' },
  { label: 'Other', value: 'other' },
  { label: 'Prefer not to say', value: 'prefer-not-to-say' },
];

export default function GeneAAssessmentForm({ profileId }: GeneAAssessmentFormProps) {
  const router = useRouter();

  const [genderIdentity, setGenderIdentity] = useState<GenderIdentity>('prefer-not-to-say');
  const [raceCategory, setRaceCategory] = useState<RaceCategory>('other');
  const [birthDate, setBirthDate] = useState('');

  const [heightUnit, setHeightUnit] = useState<HeightUnit>('metric');
  const [heightCmInput, setHeightCmInput] = useState('');
  const [feetInput, setFeetInput] = useState('');
  const [inchesInput, setInchesInput] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const previewHeightCm = useMemo(() => {
    if (heightUnit === 'metric') {
      const cm = Number(heightCmInput);
      return Number.isFinite(cm) && cm > 0 ? cm : null;
    }

    const feet = Number(feetInput);
    const inches = Number(inchesInput);
    if (!Number.isFinite(feet) || !Number.isFinite(inches)) return null;
    if (feet < 0 || inches < 0 || inches >= 12) return null;

    return imperialToCentimeters(feet, inches);
  }, [heightCmInput, feetInput, inchesInput, heightUnit]);

  const buildResponses = (): GeneARawResponses => {
    if (!birthDate) {
      throw new Error('Birth date is required.');
    }

    if (!previewHeightCm || previewHeightCm <= 0) {
      throw new Error('Please provide a valid height.');
    }

    if (heightUnit === 'metric') {
      return {
        genderIdentity,
        raceCategory,
        birthDate,
        height: {
          unit: 'metric',
          centimeters: previewHeightCm,
          metricCentimeters: previewHeightCm,
        },
      };
    }

    const feet = Number(feetInput);
    const inches = Number(inchesInput);
    if (!Number.isFinite(feet) || !Number.isFinite(inches)) {
      throw new Error('Imperial height must include valid feet and inches values.');
    }

    return {
      genderIdentity,
      raceCategory,
      birthDate,
      height: {
        unit: 'imperial',
        centimeters: previewHeightCm,
        feet,
        inches,
      },
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('You must be logged in to submit an assessment.');
      }

      const responses = buildResponses();
      await saveGeneAAssessmentAndApply({
        userId: user.uid,
        profileId,
        responses,
      });

      router.push(`/profiles/${profileId}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save assessment.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="card card-body">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="genderIdentity">
              Gender Identity
            </label>
            <select
              id="genderIdentity"
              value={genderIdentity}
              onChange={(e) => setGenderIdentity(e.target.value as GenderIdentity)}
            >
              {genderOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label" htmlFor="raceCategory">
              Race / Ethnicity
            </label>
            <select
              id="raceCategory"
              value={raceCategory}
              onChange={(e) => setRaceCategory(e.target.value as RaceCategory)}
            >
              {raceOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="label" htmlFor="birthDate">
            Birth Date
          </label>
          <input
            id="birthDate"
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            required
          />
        </div>

        <fieldset className="space-y-3 rounded-xl border p-4">
          <legend className="px-1 text-sm font-semibold">Height</legend>

          <div className="flex flex-wrap gap-4 text-sm">
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="height-unit"
                checked={heightUnit === 'metric'}
                onChange={() => setHeightUnit('metric')}
              />
              Metric (cm)
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="height-unit"
                checked={heightUnit === 'imperial'}
                onChange={() => setHeightUnit('imperial')}
              />
              Imperial (ft / in)
            </label>
          </div>

          {heightUnit === 'metric' ? (
            <div>
              <label className="label" htmlFor="heightCm">
                Height in centimeters
              </label>
              <input
                id="heightCm"
                type="number"
                min={1}
                step="0.1"
                value={heightCmInput}
                onChange={(e) => setHeightCmInput(e.target.value)}
                placeholder="e.g. 175"
                required
              />
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="heightFeet">
                  Feet
                </label>
                <input
                  id="heightFeet"
                  type="number"
                  min={0}
                  step={1}
                  value={feetInput}
                  onChange={(e) => setFeetInput(e.target.value)}
                  placeholder="e.g. 5"
                  required
                />
              </div>

              <div>
                <label className="label" htmlFor="heightInches">
                  Inches
                </label>
                <input
                  id="heightInches"
                  type="number"
                  min={0}
                  max={11}
                  step={1}
                  value={inchesInput}
                  onChange={(e) => setInchesInput(e.target.value)}
                  placeholder="e.g. 11"
                  required
                />
              </div>
            </div>
          )}

          <p className="text-sm muted">
            Normalized height: <span className="font-semibold text-zinc-900 dark:text-zinc-100">{previewHeightCm ?? '—'} cm</span>
          </p>
        </fieldset>

        <button type="submit" disabled={loading} className="btn btn-primary w-full sm:w-auto">
          {loading ? 'Saving assessment…' : 'Save Gene A Assessment'}
        </button>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </form>
    </section>
  );
}
