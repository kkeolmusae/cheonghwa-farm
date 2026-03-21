import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { FARM_INFO } from '@/constants/farm';
import { cn } from '@/utils/cn';

const NAV_ITEMS = [
  { to: '/', label: '홈', end: true },
  { to: '/about', label: '농장소개' },
  { to: '/products', label: '농작물' },
  { to: '/journals', label: '농장일지' },
  { to: '/notices', label: '공지사항' },
] as const;

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 shadow-ambient backdrop-blur-xl supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-4 py-3 md:h-[4.5rem] md:px-8">
        <Link
          to="/"
          className="font-headline text-xl font-extrabold tracking-tighter text-primary-500 md:text-2xl"
          onClick={() => setMobileOpen(false)}
        >
          {FARM_INFO.name}
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_ITEMS.map(({ to, label, ...rest }) => (
            <NavLink
              key={to}
              to={to}
              end={'end' in rest}
              className={({ isActive }) =>
                cn(
                  'border-b-2 pb-1 font-headline text-sm font-bold tracking-tight transition-colors duration-300',
                  isActive
                    ? 'border-primary-500 text-primary-500'
                    : 'border-transparent text-secondary hover:text-primary-500',
                )
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-on-surface-variant transition-colors hover:bg-surface-container-low md:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? '메뉴 닫기' : '메뉴 열기'}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 top-16 z-40 bg-inverse-surface/20 md:hidden"
            onClick={() => setMobileOpen(false)}
            aria-hidden
          />
          <nav className="fixed right-0 top-16 z-50 flex h-[calc(100dvh-4rem)] w-[min(100%,20rem)] flex-col gap-0.5 border-l border-outline-variant/15 bg-surface-container-lowest p-4 shadow-ambient-md md:hidden">
            {NAV_ITEMS.map(({ to, label, ...rest }) => (
              <NavLink
                key={to}
                to={to}
                end={'end' in rest}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'rounded-xl px-4 py-3 font-headline text-sm font-bold transition-colors',
                    isActive
                      ? 'bg-primary-500/10 text-primary-500'
                      : 'text-secondary hover:bg-surface-container-low hover:text-primary-500',
                  )
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </>
      )}
    </header>
  );
}
