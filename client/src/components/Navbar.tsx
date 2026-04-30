'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <nav className="bg-gray-800 border-b border-gray-700 px-6 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link href="/" className="text-white text-xl font-bold hover:text-blue-400 transition-colors">
          Ticketing.io
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/tickets" className="text-gray-300 hover:text-white transition-colors">
            Browse Tickets
          </Link>
          {!loading && (
            <>
              {user ? (
                <>
                  <Link href="/orders" className="text-gray-300 hover:text-white transition-colors">
                    My Orders
                  </Link>
                  <Link href="/tickets/new" className="text-gray-300 hover:text-white transition-colors">
                    Sell Ticket
                  </Link>
                  <span className="text-gray-400 text-sm">{user.email}</span>
                  <button
                    onClick={handleSignOut}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/signin" className="text-gray-300 hover:text-white transition-colors">
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
