'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

interface Ticket {
  _id: string;
  title: string;
  price: number;
  userId: string;
}

export default function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    apiFetch('/api/tickets')
      .then(res => res.json())
      .then(data => {
        const all: Ticket[] = data.data ?? data;
        const found = all.find(t => t._id === id) ?? null;
        setTicket(found);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load ticket.');
        setLoading(false);
      });
  }, [id]);

  const handlePurchase = async () => {
    if (!user) { router.push('/signin'); return; }
    setPurchasing(true);
    setError('');
    try {
      const res = await apiFetch('/api/orders', {
        method: 'POST',
        body: JSON.stringify({ ticketId: id }),
      });
      if (res.status === 401) { router.push('/signin'); return; }
      if (!res.ok) {
        const data = await res.json();
        setError(data.message ?? 'Failed to place order.');
        return;
      }
      setSuccess('Order placed! Redirecting to your orders...');
      setTimeout(() => router.push('/orders'), 1500);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) return <div className="text-gray-400 mt-10 text-center">Loading...</div>;

  if (!ticket) return (
    <div className="text-center mt-20">
      <p className="text-gray-400 text-lg mb-4">Ticket not found.</p>
      <Link href="/tickets" className="text-blue-400 hover:text-blue-300">← Back to tickets</Link>
    </div>
  );

  return (
    <div className="max-w-lg mx-auto mt-10">
      <Link href="/tickets" className="text-blue-400 hover:text-blue-300 text-sm mb-6 inline-block">
        ← Back to tickets
      </Link>
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-8">
        <h1 className="text-3xl font-bold text-white mb-2">{ticket.title}</h1>
        <p className="text-blue-400 text-4xl font-bold mb-6">${ticket.price.toFixed(2)}</p>
        {error && (
          <div className="bg-red-900/50 border border-red-600 text-red-300 rounded-lg px-4 py-3 mb-4 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-900/50 border border-green-600 text-green-300 rounded-lg px-4 py-3 mb-4 text-sm">
            {success}
          </div>
        )}
        <button
          onClick={handlePurchase}
          disabled={purchasing}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors text-lg"
        >
          {purchasing ? 'Placing order...' : user ? 'Purchase Ticket' : 'Sign in to Purchase'}
        </button>
        {!user && (
          <p className="text-gray-400 text-sm mt-3 text-center">
            <Link href="/signin" className="text-blue-400 hover:text-blue-300">Sign in</Link> to buy this ticket
          </p>
        )}
      </div>
    </div>
  );
}
