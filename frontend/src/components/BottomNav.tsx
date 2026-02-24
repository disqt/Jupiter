'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex">
      <Link
        href="/"
        className={`flex-1 py-3 text-center text-sm font-medium ${
          pathname === '/' ? 'text-blue-600' : 'text-gray-500'
        }`}
      >
        Calendrier
      </Link>
      <div className="flex-1 py-3 text-center text-sm font-medium text-gray-300 cursor-not-allowed">
        Stats
      </div>
    </nav>
  );
}
