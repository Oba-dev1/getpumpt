import Link from 'next/link';

export default function GymNotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0A0A0A]">
      <div className="px-4 text-center">
        <h1 className="mb-4 text-7xl font-bold text-[rgb(var(--gym-primary))]">404</h1>
        <h2 className="mb-4 text-2xl font-bold text-white">Gym Not Found</h2>
        <p className="mx-auto mb-8 max-w-md text-slate-400">
          The gym you&apos;re looking for doesn&apos;t exist or may have been removed.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-xl bg-[rgb(var(--gym-primary))] px-8 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:brightness-110 hover:shadow-lg hover:shadow-[rgba(var(--gym-primary-rgb),0.3)]"
        >
          Go to Homepage
        </Link>
      </div>
    </div>
  );
}
