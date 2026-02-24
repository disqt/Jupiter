'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BottomNav() {
  const pathname = usePathname();
  const isHome = pathname === '/';

  return (
    <nav className="bottom-nav">
      <Link href="/" className={`nav-item ${isHome ? 'active' : ''}`}>
        <span className="nav-icon">📅</span>
        <span className="nav-label">Calendrier</span>
      </Link>
      <div className="nav-item disabled">
        <span className="nav-icon">📊</span>
        <span className="nav-label">Stats</span>
      </div>
    </nav>
  );
}
