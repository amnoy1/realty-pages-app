import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white text-center px-4">
      <h1 className="text-6xl font-extrabold text-blue-500 drop-shadow-lg">404</h1>
      <h2 className="mt-4 text-3xl font-bold">הדף לא נמצא</h2>
      <p className="mt-2 text-slate-300">מצטערים, לא הצלחנו למצוא את הדף שחיפשת.</p>
      <Link href="/" className="mt-8 inline-block bg-blue-600 text-white py-3 px-6 rounded-full hover:bg-blue-700 transition-colors font-semibold shadow-lg">
        חזרה לדף הבית
      </Link>
    </div>
  )
}