const BASE_URL =
  typeof window === 'undefined'
    ? process.env.API_URL ?? 'http://api-gateway:8000'
    : process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

export async function apiFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  return res;
}
