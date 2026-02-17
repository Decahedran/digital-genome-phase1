# Digital Genome

Digital Genome is a Next.js + Firebase app for building profile-based genomic identity blocks from user traits and assessments.

## Current capabilities

- Email/password auth (register, login, logout)
- Multi-profile support per user
- Trait storage per profile (`traits/{profileId}`)
- Gene A assessment flow:
  - Saves raw responses to `assessments`
  - Derives/merges normalized traits
  - Computes and updates `profiles.genomeBlocks[0]` and `genomeString`
- Firestore rules stored in repo (`firestore.rules`)
- Automated Firestore rules deploy via GitHub Actions

## Tech stack

- Next.js (App Router) + React + TypeScript
- Firebase Auth + Firestore
- Tailwind CSS v4
- Vercel hosting

## Local development

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` with Firebase web config:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

3. Run dev server:

```bash
npm run dev
```

## Firestore rules deployment

Rules source: `firestore.rules`

Firebase config: `firebase.json`

### Manual deploy (local)

```bash
firebase deploy --only firestore:rules --project <your-project-id>
```

### Automated deploy (GitHub Actions)

Workflow file: `.github/workflows/deploy-firestore-rules.yml`

Triggered on push to `main` when any of these change:
- `firestore.rules`
- `firebase.json`
- workflow file

#### Required GitHub secrets

- `FIREBASE_PROJECT_ID`: Firebase project id
- `FIREBASE_SERVICE_ACCOUNT`: full service account JSON (raw JSON text)

## Theming (light/dark mode)

The app uses browser preference (`prefers-color-scheme`) and global CSS tokens in `src/app/globals.css`.

- Automatically adapts to light/dark mode
- Form controls (`input/select/textarea`) are globally theme-aware
- Focus outlines and muted/link colors adapt by theme

## Verification checklist

- GitHub Actions run is green for **Deploy Firestore Rules**
- Firebase Console → Firestore → Rules shows a recent publish timestamp
- In dark mode, assessment dropdowns and inputs remain readable
- Gene A submission updates profile genome block 0 and genome string
