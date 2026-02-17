import { db } from '@/lib/firebase';
import { mergeTraits } from '@/lib/traits';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';

export type RaceCategory = 'asian' | 'black' | 'native' | 'white' | 'other';

export type GenderIdentity =
  | 'male'
  | 'female'
  | 'non-binary'
  | 'other'
  | 'prefer-not-to-say';

export type HeightUnit = 'metric' | 'imperial';

export interface GeneAHeightInput {
  unit: HeightUnit;
  centimeters: number;
  metricCentimeters?: number;
  feet?: number;
  inches?: number;
}

export interface GeneARawResponses {
  genderIdentity: GenderIdentity;
  raceCategory: RaceCategory;
  birthDate: string; // YYYY-MM-DD
  height: GeneAHeightInput;
}

const GENE_A_VERSION = '1.0';
const DEFAULT_BLOCKS = [0, 0, 0, 0, 0, 0, 0, 0];

export function mapRaceToBandStart(race: RaceCategory): number {
  switch (race) {
    case 'asian':
      return 0;
    case 'black':
      return 200;
    case 'native':
      return 400;
    case 'white':
      return 600;
    case 'other':
      return 800;
    default:
      return 800;
  }
}

export function mapGenderToCode(gender: GenderIdentity): number {
  switch (gender) {
    case 'male':
      return 0;
    case 'female':
      return 1;
    case 'non-binary':
      return 2;
    case 'other':
      return 3;
    case 'prefer-not-to-say':
      return 4;
    default:
      return 4;
  }
}

export function calculateAgeYears(birthDateIso: string, now: Date = new Date()): number {
  const birth = new Date(birthDateIso);
  let age = now.getFullYear() - birth.getFullYear();

  const monthDiff = now.getMonth() - birth.getMonth();
  const hadBirthdayThisYear =
    monthDiff > 0 || (monthDiff === 0 && now.getDate() >= birth.getDate());

  if (!hadBirthdayThisYear) age -= 1;
  return Math.max(0, age);
}

export function mapAgeToBand(ageYears: number): number {
  if (ageYears <= 17) return 0;
  if (ageYears <= 29) return 1;
  if (ageYears <= 44) return 2;
  if (ageYears <= 64) return 3;
  return 4;
}

export function mapHeightCmToBand(heightCm: number): number {
  if (heightCm < 150) return 0;
  if (heightCm < 160) return 1;
  if (heightCm < 170) return 2;
  if (heightCm < 180) return 3;
  if (heightCm < 190) return 4;
  if (heightCm < 200) return 5;
  if (heightCm < 210) return 6;
  return 7;
}

export function imperialToCentimeters(feet: number, inches: number): number {
  const totalInches = feet * 12 + inches;
  return Number((totalInches * 2.54).toFixed(1));
}

export function computeGeneA(input: {
  raceCategory: RaceCategory;
  genderIdentity: GenderIdentity;
  ageYears: number;
  heightCm: number;
}): number {
  const raceBandStart = mapRaceToBandStart(input.raceCategory);
  const genderCode = mapGenderToCode(input.genderIdentity);
  const ageBand = mapAgeToBand(input.ageYears);
  const heightBand = mapHeightCmToBand(input.heightCm);

  // 5 genders * 5 age bands * 8 height bands = 200 unique subcodes
  const subCode = genderCode * 40 + ageBand * 8 + heightBand;
  return raceBandStart + subCode;
}

function formatGenomeString(blocks: number[]): string {
  return blocks.map((block) => String(block).padStart(3, '0')).join('-');
}

async function updateProfileGeneABlock(profileId: string, geneA: number) {
  const profileRef = doc(db, 'profiles', profileId);
  const profileSnap = await getDoc(profileRef);

  if (!profileSnap.exists()) {
    throw new Error('Profile not found.');
  }

  const data = profileSnap.data() as { genomeBlocks?: number[]; genomeVersion?: string };
  const currentBlocks = Array.isArray(data.genomeBlocks)
    ? [...data.genomeBlocks]
    : [...DEFAULT_BLOCKS];

  while (currentBlocks.length < 8) {
    currentBlocks.push(0);
  }

  currentBlocks[0] = geneA;

  await updateDoc(profileRef, {
    genomeBlocks: currentBlocks,
    genomeString: formatGenomeString(currentBlocks),
    genomeVersion: data.genomeVersion ?? '1.2',
    updatedAt: serverTimestamp(),
  });
}

export async function saveGeneAAssessmentAndApply(params: {
  userId: string;
  profileId: string;
  responses: GeneARawResponses;
}) {
  const { userId, profileId, responses } = params;

  const ageYears = calculateAgeYears(responses.birthDate);
  const heightCm = responses.height.centimeters;
  const ageBand = mapAgeToBand(ageYears);
  const heightBand = mapHeightCmToBand(heightCm);
  const geneA = computeGeneA({
    raceCategory: responses.raceCategory,
    genderIdentity: responses.genderIdentity,
    ageYears,
    heightCm,
  });

  const assessmentRef = await addDoc(collection(db, 'assessments'), {
    userId,
    profileId,
    type: 'gene-a',
    version: GENE_A_VERSION,
    responses,
    createdAt: serverTimestamp(),
  });

  await mergeTraits(profileId, {
    physical_gender_identity: responses.genderIdentity,
    physical_race_category: responses.raceCategory,
    physical_birth_date: responses.birthDate,
    physical_age_years: ageYears,
    physical_age_band: ageBand,
    physical_height_cm: heightCm,
    physical_height_band: heightBand,
    gene_a: geneA,
    gene_a_version: GENE_A_VERSION,
  });

  await updateProfileGeneABlock(profileId, geneA);

  return {
    assessmentId: assessmentRef.id,
    geneA,
  };
}
