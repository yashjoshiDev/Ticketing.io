import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h1 className="text-5xl font-bold mb-4 text-white">Welcome to Ticketing.io</h1>
      <p className="text-gray-400 text-lg mb-8 max-w-xl">
        Buy and sell event tickets in a secure, fast marketplace.
      </p>
      <div className="flex gap-4">
        <Link
          href="/tickets"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
        >
          Browse Tickets
        </Link>
        <Link
          href="/signup"
          className="border border-gray-600 hover:border-gray-400 text-gray-300 hover:text-white px-6 py-3 rounded-lg font-semibold transition-colors"
        >
          Get Started
        </Link>
      </div>
    </div>
  );
}
