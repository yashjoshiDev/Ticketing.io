'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Ticket {
  title: string;
  price: number;
}

interface Order {
  _id: string;
  status: string;
  expiresAt: string;
  ticket: Ticket;
}

const STATUS_STYLES: Record<string, string> = {
  created: 'bg-yellow-900/50 text-yellow-300 border-yellow-600',
  'awaiting:payment': 'bg-blue-900/50 text-blue-300 border-blue-600',
  complete: 'bg-green-900/50 text-green-300 border-green-600',
  cancelled: 'bg-red-900/50 text-red-300 border-red-600',
};

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push('/signin'); return; }
    apiFetch('/api/orders')
      .then(res => res.json())
      .then(data => { setOrders(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => { setError('Failed to load orders.'); setLoading(false); });
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return <div className="flex justify-center items-center min-h-[40vh] text-gray-400">Loading orders...</div>;
  }

  if (error) {
    return <div className="bg-red-900/50 border border-red-600 text-red-300 rounded-lg px-4 py-3 text-sm">{error}</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">My Orders</h1>
      {orders.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 text-lg mb-4">No orders yet.</p>
          <Link href="/tickets" className="text-blue-400 hover:text-blue-300">Browse tickets →</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order._id} className="bg-gray-800 border border-gray-700 rounded-xl p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-white font-semibold text-lg">{order.ticket?.title ?? 'Unknown ticket'}</h2>
                  <p className="text-blue-400 font-bold text-xl mt-1">
                    ${order.ticket?.price?.toFixed(2) ?? '—'}
                  </p>
                  {order.expiresAt && order.status === 'created' && (
                    <p className="text-gray-500 text-sm mt-1">
                      Reserved until {new Date(order.expiresAt).toLocaleTimeString()}
                    </p>
                  )}
                </div>
                <span className={`border rounded-full px-3 py-1 text-xs font-medium ${STATUS_STYLES[order.status] ?? 'bg-gray-700 text-gray-300 border-gray-600'}`}>
                  {order.status.replace(':', ' ')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
