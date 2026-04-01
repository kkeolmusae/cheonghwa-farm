import { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Menu, X, Leaf } from 'lucide-react';
import { FARM_INFO } from '@/constants/farm';
import { cn } from '@/utils/cn';

const NAV_ITEMS = [
  { to: '/',         label: '홈',     end: true  },
  { to: '/about',    label: '농장소개', end: false },
  { to: '/products', label: '농작물',  end: false },
  { to: '/journals', label: '농장일지', end: false },
  { to: '/notices',  label: '공지사항', end: false },
] as const;

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled]     = useState(false);
  const location = useLocation();

  // 스크롤 감지 — 헤더 배경 강조
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 라우트 변경 시 모바일 메뉴 닫기
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // 모바일 메뉴 열릴 때 body 스크롤 잠금
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full',
        'transition-[background-color,box-shadow,border-color]',
        'duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
        scrolled
          ? 'bg-cream-50/90 backdrop-blur-xl shadow-sm border-b border-border/70'
          : 'bg-cream-50/80 backdrop-blur-xl border-b border-transparent',
      )}
      style={{ WebkitBackdropFilter: 'blur(20px) saturate(180%)' }}
    >
      <div className="mx-auto flex h-16 max-w-[82rem] items-center justify-between px-5 md:h-[4.25rem] md:px-8 lg:px-12">

        {/* Logo */}
        <Link
          to="/"
          className={cn(
            'flex items-center gap-2.5',
            'font-headline font-extrabold tracking-tight text-on-bg',
            'transition-opacity hover:opacity-80',
            'text-xl md:text-2xl',
          )}
          onClick={() => setMobileOpen(false)}
          aria-label="청화 농원 홈으로 이동"
        >
          <span
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary shadow-sm"
            aria-hidden="true"
          >
            <Leaf className="h-4 w-4 text-white" />
          </span>
          <span>{FARM_INFO.name}</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-7 md:flex" aria-label="주요 메뉴">
          {NAV_ITEMS.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'relative py-1',
                  'font-body text-sm font-semibold',
                  'transition-colors duration-[180ms]',
                  // underline indicator
                  'after:absolute after:-bottom-0.5 after:left-0',
                  'after:h-0.5 after:rounded-full after:bg-primary',
                  'after:transition-[width] after:duration-[250ms] after:ease-[cubic-bezier(0.4,0,0.2,1)]',
                  isActive
                    ? 'text-primary after:w-full'
                    : 'text-on-muted hover:text-primary after:w-0 hover:after:w-full',
                )
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Mobile Hamburger */}
        <button
          type="button"
          className={cn(
            'inline-flex h-10 w-10 items-center justify-center',
            'rounded-xl text-on-muted',
            'transition-colors hover:bg-surface-muted hover:text-on-surface',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
            'md:hidden',
          )}
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? '메뉴 닫기' : '메뉴 열기'}
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav"
        >
          {mobileOpen
            ? <X     className="h-5 w-5" />
            : <Menu  className="h-5 w-5" />
          }
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 top-16 z-40 bg-stone-950/30 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Drawer */}
      <nav
        id="mobile-nav"
        aria-label="모바일 메뉴"
        className={cn(
          'fixed right-0 top-16 z-50',
          'flex h-[calc(100dvh-4rem)] w-[min(100%,22rem)] flex-col',
          'bg-surface-raised',
          'border-l border-border/80',
          'shadow-xl',
          'transition-transform duration-[350ms] ease-[cubic-bezier(0.4,0,0.2,1)]',
          'md:hidden',
          mobileOpen ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        {/* Nav items */}
        <div className="flex flex-col gap-1 p-4 pt-6">
          {NAV_ITEMS.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-4 py-3.5',
                  'font-body text-sm font-semibold',
                  'transition-colors duration-[150ms]',
                  isActive
                    ? 'bg-primary-surface text-primary'
                    : 'text-on-muted hover:bg-surface-muted hover:text-on-surface',
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span
                      className="h-5 w-1 rounded-full bg-primary shrink-0"
                      aria-hidden="true"
                    />
                  )}
                  <span className={isActive ? '' : 'ml-4'}>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>

        {/* Bottom info */}
        <div className="mt-auto border-t border-border/60 p-6">
          <p className="text-caption text-on-subtle leading-relaxed">
            {FARM_INFO.address}
            <br />
            {FARM_INFO.contactDisplay}
          </p>
        </div>
      </nav>
    </header>
  );
}
