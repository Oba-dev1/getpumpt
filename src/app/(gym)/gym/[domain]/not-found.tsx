import Link from 'next/link';

export default function GymNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F172A]">
      <div className="text-center px-4">
        <h1 className="text-6xl font-bold text-[#6366F1] mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-white mb-4">Gym Not Found</h2>
        <p className="text-gray-400 mb-8 max-w-md">
          The gym you&apos;re looking for doesn&apos;t exist or may have been removed.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center bg-[#6366F1] hover:bg-[#4F46E5] text-white px-8 py-3 font-semibold rounded-md transition-colors"
        >
          Go to Homepage
        </Link>
      </div>
    </div>
  );
}
