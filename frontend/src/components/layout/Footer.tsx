import { Leaf, MapPin, Phone, Clock, User, Hash } from 'lucide-react';
import { FARM_INFO } from '@/constants/farm';

export function Footer() {
  return (
    <footer className="bg-inverse-surface text-inverse-on-surface">
      <div className="mx-auto max-w-screen-2xl px-4 py-14 md:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <Leaf className="h-5 w-5 text-primary-fixed-dim" />
              <span className="font-headline text-lg font-extrabold text-inverse-on-surface">
                {FARM_INFO.name}
              </span>
            </div>
            <p className="text-sm leading-relaxed text-inverse-on-surface/75">
              정성껏 키운 신선한 농산물을
              <br />
              농장에서 식탁까지 직접 전해드립니다.
            </p>
          </div>

          <div>
            <h3 className="mb-4 font-headline text-xs font-bold uppercase tracking-[0.2em] text-inverse-on-surface/55">
              연락처
            </h3>
            <ul className="space-y-3 text-sm text-inverse-on-surface/85">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-inverse-on-surface/55" />
                <span>{FARM_INFO.address}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-inverse-on-surface/55" />
                <span>{FARM_INFO.contactDisplay}</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="h-4 w-4 shrink-0 text-inverse-on-surface/55" />
                <span className="whitespace-pre-line">{FARM_INFO.hours}</span>
              </li>
              <li className="flex items-center gap-2">
                <User className="h-4 w-4 shrink-0 text-inverse-on-surface/55" />
                <span>대표: {FARM_INFO.representative}</span>
              </li>
              <li className="flex items-center gap-2">
                <Hash className="h-4 w-4 shrink-0 text-inverse-on-surface/55" />
                <span>사업자등록번호: {FARM_INFO.businessNumber}</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-headline text-xs font-bold uppercase tracking-[0.2em] text-inverse-on-surface/55">
              입금 계좌
            </h3>
            <div className="rounded-xl bg-inverse-on-surface/10 p-5 text-sm backdrop-blur-sm">
              <p className="font-medium text-inverse-on-surface">농협 123-1234-1234-12</p>
              <p className="mt-1 text-inverse-on-surface/70">
                예금주: {FARM_INFO.representative} ({FARM_INFO.name})
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 text-center text-xs text-inverse-on-surface/45">
          &copy; {new Date().getFullYear()} {FARM_INFO.name}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
