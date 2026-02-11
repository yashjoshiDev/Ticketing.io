'use client';

import { useState, useEffect } from "react";

export default function Home() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    // Fetch data from our Backend on Port 4000
    fetch('http://localhost:4000/')
      .then((res) => res.json())
      .then((data) => setData(data))
      .catch((err) => console.error("Failed to fetch:", err));
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-8">Ticketing App</h1>

      <div className="p-6 border border-gray-700 rounded-lg bg-gray-800">
        <h2 className="text-xl font-semibold mb-4">Backend Status:</h2>

        {data ? (
          <div className="text-green-400">
            <p>✅ {data.message}</p>
            <p className="text-sm text-gray-400 mt-2">Server Time: {data.time}</p>
          </div>
        ) : (
          <p className="text-yellow-500">Connecting to server...</p>
        )}
      </div>
    </div>
  );
}
