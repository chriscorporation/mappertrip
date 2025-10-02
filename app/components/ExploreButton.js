'use client';

export default function ExploreButton({ text = "Explorar destinos seguros" }) {
  return (
    <button
      onClick={() => window.location.href = '/'}
      className="px-6 py-3 text-sm text-white font-bold bg-blue-500 hover:bg-blue-600 focus:ring-4 focus:ring-blue-200 rounded-full cursor-pointer transition-colors"
    >
      {text}
    </button>
  );
}
