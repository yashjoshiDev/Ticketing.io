'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';

interface Ticket {
  _id: string;
  title: string;
  price: number;
  userId: string;
}

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch('/api/tickets')
      .then(res => res.json())
      .then(data => {
        setTickets(data.data ?? data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load tickets.');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[40vh]">
        <div className="text-gray-400">Loading tickets...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/50 border border-red-600 text-red-300 rounded-lg px-4 py-3 text-sm">
        {error}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-white">Available Tickets</h1>
        <Link
          href="/tickets/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
        >
          + Sell a Ticket
        </Link>
      </div>
      {tickets.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 text-lg mb-4">No tickets available yet.</p>
          <Link href="/tickets/new" className="text-blue-400 hover:text-blue-300">
            Be the first to list a ticket →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tickets.map(ticket => (
            <Link key={ticket._id} href={`/tickets/${ticket._id}`}>
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:border-blue-500 transition-colors cursor-pointer">
                <h2 className="text-white font-semibold text-lg mb-2 truncate">{ticket.title}</h2>
                <p className="text-blue-400 text-2xl font-bold">${ticket.price.toFixed(2)}</p>
                <p className="text-gray-500 text-sm mt-2">Click to purchase</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
