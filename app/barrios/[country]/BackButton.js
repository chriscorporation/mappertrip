'use client';

import { useRouter } from 'next/navigation';

export default function BackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push('/barrios')}
      className="px-6 py-3 text-sm text-white font-bold bg-blue-500 hover:bg-blue-600 focus:ring-4 focus:ring-blue-200 rounded-full cursor-pointer transition-colors"
    >
      Ver todos los países
    </button>
  );
}
