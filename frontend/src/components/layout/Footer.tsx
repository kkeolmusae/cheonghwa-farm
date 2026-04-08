import { Leaf, MapPin, Phone, Clock, User, Hash } from "lucide-react";
import { Link } from "react-router-dom";
import { FARM_INFO } from "@/constants/farm";

const NAV_LINKS = [
  { to: "/about", label: "농장소개" },
  { to: "/products", label: "농작물" },
  { to: "/journals", label: "농장일지" },
  { to: "/notices", label: "공지사항" },
] as const;

export function Footer() {
  return (
    <footer className="bg-surface-dark text-white/80">
      {/* Top wave divider */}
      <div className="overflow-hidden">
        <svg viewBox="0 0 1440 48" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="block h-12 w-full" aria-hidden="true">
          <path d="M0 48h1440V28C1200 8 960 48 720 28S240 8 0 28z" fill="#0c3217" />
        </svg>
      </div>

      <div className="mx-auto max-w-[82rem] px-5 pb-10 pt-2 md:px-8 lg:px-12">
        {/* Main grid */}
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          {/* Brand column */}
          <div className="lg:col-span-1">
            <Link to="/" className="mb-5 inline-flex items-center gap-2.5 transition-opacity hover:opacity-80" aria-label="청화 농원 홈">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-forest-500 shadow-sm">
                <Leaf className="h-4 w-4 text-white" />
              </span>
              <span className="font-headline text-lg font-extrabold tracking-tight text-white">{FARM_INFO.name}</span>
            </Link>
            <p className="text-sm leading-relaxed text-white/60">
              정성껏 키운 신선한 농산물을
              <br />
              농장에서 식탁까지 직접 전해드립니다.
            </p>

            {/* Quick nav */}
            <nav className="mt-6 flex flex-wrap gap-x-4 gap-y-2" aria-label="푸터 메뉴">
              {NAV_LINKS.map(({ to, label }) => (
                <Link key={to} to={to} className="text-sm text-white/55 transition-colors hover:text-white">
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact column */}
          <div>
            <h3 className="mb-5 text-label uppercase tracking-[0.15em] text-white/40">연락처</h3>
            <ul className="space-y-3.5 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-forest-400" aria-hidden="true" />
                <span className="text-white/70 leading-relaxed">{FARM_INFO.address}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 shrink-0 text-forest-400" aria-hidden="true" />
                <a href={`tel:${FARM_INFO.phone}`} className="text-white/70 transition-colors hover:text-white">
                  {FARM_INFO.contactDisplay}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Clock className="h-4 w-4 shrink-0 text-forest-400" aria-hidden="true" />
                <span className="whitespace-pre-line text-white/70 leading-relaxed">{FARM_INFO.hours}</span>
              </li>
            </ul>
          </div>

          {/* Business info column */}
          <div>
            <h3 className="mb-5 text-label uppercase tracking-[0.15em] text-white/40">사업자 정보</h3>
            <ul className="space-y-3.5 text-sm">
              <li className="flex items-center gap-3">
                <User className="h-4 w-4 shrink-0 text-forest-400" aria-hidden="true" />
                <span className="text-white/70">대표: {FARM_INFO.representative}</span>
              </li>
              <li className="flex items-start gap-3">
                <Hash className="mt-0.5 h-4 w-4 shrink-0 text-forest-400" aria-hidden="true" />
                <span className="text-white/70">
                  사업자등록번호
                  <br />
                  {FARM_INFO.businessNumber}
                </span>
              </li>
            </ul>
          </div>

          {/* Account column */}
          <div>
            <h3 className="mb-5 text-label uppercase tracking-[0.15em] text-white/40">입금 계좌</h3>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
              <p className="font-semibold text-white">농협 716-12-338141</p>
              <p className="mt-2 text-sm text-white/55">
                예금주: {FARM_INFO.representative}
                <br />({FARM_INFO.name})
              </p>
            </div>

            {/* Seasonal badge */}
            <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-forest-700 bg-forest-900/50 px-3 py-1.5">
              <span className="block h-1.5 w-1.5 rounded-full bg-forest-400" aria-hidden="true" />
              <span className="text-[0.7rem] font-semibold text-forest-300">당일 수확 · 당일 발송</span>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-8 sm:flex-row">
          <p className="text-xs text-white/35">
            &copy; {new Date().getFullYear()} {FARM_INFO.name}. All rights reserved.
          </p>
          <p className="text-xs text-white/25">농업경영체 등록 농가 · 직거래 인증</p>
        </div>
      </div>
    </footer>
  );
}
