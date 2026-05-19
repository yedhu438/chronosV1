'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';

export function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <nav className="ch-nav">
      <Link href="/" className="ch-nav-logo" style={{ textDecoration: 'none' }}>
        FullyMerched Chronos
      </Link>
      <div className="ch-nav-links">
        {[['/', 'Home'], ['/calendar', 'Calendar'], ['/events', 'Events']].map(([href, label]) => (
          <Link
            key={href}
            href={href}
            className={`ch-nav-link${pathname === href ? ' active' : ''}`}
            style={{ textDecoration: 'none' }}
          >
            {label}
          </Link>
        ))}
        {session ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link href="/admin" className="ch-nav-link gold" style={{ textDecoration: 'none' }}>
              Admin Panel
            </Link>
            <button
              className="ch-nav-link"
              onClick={() => signOut({ callbackUrl: '/' })}
            >
              Sign Out
            </button>
          </div>
        ) : (
          <Link href="/admin" className="ch-nav-link gold" style={{ textDecoration: 'none' }}>
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
}
