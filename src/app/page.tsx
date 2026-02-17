import Link from 'next/link';

const highlights = [
  {
    title: 'Structured Profiles',
    description: 'Manage multiple identity profiles with deterministic genome blocks.',
  },
  {
    title: 'Assessment Pipeline',
    description: 'Capture raw responses, derive traits, and update genomes predictably.',
  },
  {
    title: 'Security First',
    description: 'Firestore ownership rules and automated rule deployments via GitHub Actions.',
  },
];

export default function Home() {
  return (
    <div className="app-shell">
      <main className="page space-y-8">
        <section className="card card-body space-y-6">
          <div className="space-y-3">
            <span className="badge">Digital Genome Platform</span>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Professional identity mapping, built for scale.</h1>
            <p className="max-w-3xl text-base leading-relaxed muted sm:text-lg">
              Digital Genome transforms assessment responses into a deterministic 8-block genome representation.
              Build profiles, run assessments, and evolve trait intelligence over time.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/register" className="btn btn-primary">
              Create Account
            </Link>
            <Link href="/login" className="btn btn-secondary">
              Log In
            </Link>
            <Link href="/dashboard" className="btn btn-secondary">
              Open Dashboard
            </Link>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {highlights.map((item) => (
            <article key={item.title} className="card card-body space-y-2">
              <h2 className="text-lg font-semibold">{item.title}</h2>
              <p className="text-sm leading-relaxed muted">{item.description}</p>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
