'use client';

import { useState } from 'react';

export default function SignupPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const onSubmit = async (event: React.FormEvent) => {
        event.preventDefault(); // Stop the page from reloading

        try {
            const response = await fetch('http://localhost:4000/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
                credentials: 'include'
            });

            const data = await response.json();

            if (response.ok) {
                alert('Success: ' + data.message);
            } else {
                alert('Error: ' + 'Something went wrong');
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">
            <form onSubmit={onSubmit} className="w-96 p-8 bg-gray-800 rounded-lg border border-gray-700 shadow-xl">
                <h1 className="text-2xl font-bold mb-6 text-center">Join Us</h1>

                <div className="mb-4">
                    <label className="block mb-2 text-sm text-gray-400">Email Address</label>
                    <input
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:border-blue-500 outline-none"
                        type="email"
                    />
                </div>

                <div className="mb-6">
                    <label className="block mb-2 text-sm text-gray-400">Password</label>
                    <input
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:border-blue-500 outline-none"
                        type="password"
                    />
                </div>

                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors">
                    Sign Up
                </button>
            </form>
        </div>
    );
}