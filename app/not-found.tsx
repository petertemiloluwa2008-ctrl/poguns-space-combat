import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#050510] text-white">
      <h2 className="text-4xl font-bold text-[#FF1493] mb-4">404 - Not Found</h2>
      <p className="text-gray-400 mb-6">Lost in deep space.</p>
      <Link href="/" className="px-6 py-2 bg-[#FF1493] text-white rounded font-mono">
        Return to Base
      </Link>
    </div>
  );
}

