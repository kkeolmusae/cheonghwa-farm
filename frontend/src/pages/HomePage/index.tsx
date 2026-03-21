import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import { fetchSiteSettings, siteSettingsKeys } from '@/api/siteSettings';
import { toAbsoluteMediaUrl } from '@/utils/mediaUrl';
import {
  ArrowRight,
  MapPin,
  Phone,
  Clock,
  Pin,
  ShoppingBag,
  Leaf,
  Sprout,
  Package,
} from 'lucide-react';

import { fetchProducts, productKeys } from '@/api/products';
import { fetchJournals, journalKeys } from '@/api/journals';
import { fetchNotices, noticeKeys } from '@/api/notices';
import { Skeleton } from '@/components/ui/Skeleton';
import { ImagePlaceholder } from '@/components/ui/ImagePlaceholder';
import { formatPrice, formatShortDate } from '@/utils/format';
import { getProductStatus } from '@/constants/status';
import { FARM_INFO, FARM_CROPS_LABEL } from '@/constants/farm';
import { STITCH_FARM_STORY_IMAGE, STITCH_HERO_IMAGE } from '@/constants/stitchAssets';

export default function HomePage() {
  const { data: siteImg } = useQuery({
    queryKey: siteSettingsKeys.all,
    queryFn: fetchSiteSettings,
    staleTime: 60_000,
  });

  const heroUrl = siteImg?.home_hero_image_url
    ? toAbsoluteMediaUrl(siteImg.home_hero_image_url)
    : STITCH_HERO_IMAGE;
  const storyUrl = siteImg?.home_story_image_url
    ? toAbsoluteMediaUrl(siteImg.home_story_image_url)
    : STITCH_FARM_STORY_IMAGE;

  return (
    <>
      <HeroSection heroUrl={heroUrl} />
      <AboutPreview storyUrl={storyUrl} />
      <ProductsSection />
      <JournalsSection />
      <TrustSection />
      <NoticesSection />
      <ContactSection />
    </>
  );
}

/** 시안 Section 1: Hero — 고정 높이, 좌→우 그라데이션, primary CTA는 녹색 솔리드 */
function HeroSection({ heroUrl }: { heroUrl: string }) {
  return (
    <section className="relative flex min-h-[70vh] items-center overflow-hidden md:h-[921px] md:min-h-0">
      <div className="absolute inset-0 z-0">
        <img src={heroUrl} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
      </div>
      <div className="relative z-10 mx-auto w-full max-w-screen-2xl px-4 py-20 md:px-8">
        <div className="max-w-2xl text-white">
          <span className="mb-6 inline-block rounded-full bg-primary-container px-4 py-1.5 font-headline text-xs font-bold uppercase tracking-[0.2em] text-on-primary-container">
            Premium Editorial Farm
          </span>
          <h1 className="font-headline text-5xl font-black leading-[1.1] tracking-tighter md:text-7xl lg:text-8xl">
            자연 그대로 키운
            <br />
            <span className="text-primary-fixed">{FARM_INFO.name}</span>
          </h1>
          <p className="mt-6 font-body text-xl leading-relaxed text-white/90 md:text-2xl">
            직접 재배하고 직접 판매합니다.
            <br />
            땅의 정직함이 전하는 가장 신선한 이야기.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link to="/products" className="group inline-flex">
              <span className="inline-flex items-center gap-2 rounded-xl bg-primary px-10 py-5 font-headline text-lg font-bold text-on-primary transition-all hover:bg-primary-container hover:text-on-primary-container">
                상품 보러가기
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
            <Link to="/about">
              <span className="inline-flex items-center rounded-xl border border-white/20 bg-white/10 px-10 py-5 font-headline text-lg font-bold text-white backdrop-blur-md transition-all hover:bg-white/20">
                농장 이야기 보기
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/** 시안 Section 2: Farm Story — 시안 이미지 + 플로팅 인용 카드 */
function AboutPreview({ storyUrl }: { storyUrl: string }) {
  return (
    <section className="bg-surface px-4 py-24 md:px-8 md:py-32">
      <div className="mx-auto grid max-w-screen-2xl grid-cols-1 items-center gap-16 md:grid-cols-2">
        <div className="relative group">
          <div className="absolute -left-6 -top-6 -z-10 h-32 w-32 rounded-full bg-tertiary-fixed opacity-50" />
          <img
            src={storyUrl}
            alt=""
            className="aspect-[4/5] w-full rounded-xl object-cover shadow-xl"
          />
          <div className="absolute -bottom-4 -right-4 hidden max-w-xs rounded-xl bg-surface-container-lowest p-8 shadow-lg lg:block">
            <p className="font-body text-base italic font-medium leading-relaxed text-secondary">
              &ldquo;{FARM_INFO.region}의 맑은 공기와 땅을 믿습니다. 그것이 가장 맛있는 농산물을 만드는
              길입니다.&rdquo;
            </p>
            <p className="mt-4 font-headline font-bold text-on-surface">{FARM_INFO.representative} 대표</p>
          </div>
        </div>
        <div className="space-y-8">
          <div className="space-y-4">
            <h2 className="font-headline text-sm font-bold uppercase tracking-[0.2em] text-tertiary">
              Our Philosophy
            </h2>
            <h3 className="font-headline text-4xl font-extrabold leading-tight text-on-surface md:text-5xl">
              느리지만 바르게,
              <br />
              흙에서 식탁까지의 여정
            </h3>
          </div>
          <p className="font-body text-lg leading-relaxed text-on-surface-variant">
            {FARM_INFO.name}은(는) 할머니 대부터 이어온 재배 방식과 오늘의 품질 관리를 함께합니다. 제초제 없는
            건강한 땅에서 자란 {FARM_CROPS_LABEL} 등 작물은 농부가 직접 확인하고, 당일 포장해 식탁까지
            전합니다.
          </p>
          <div className="pt-2">
            <Link
              to="/about"
              className="inline-flex items-center gap-2 font-headline text-lg font-bold text-primary-500 transition-colors hover:text-primary-600"
            >
              상세한 재배 방식 읽어보기
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProductsSection() {
  const { data, isLoading } = useQuery({
    queryKey: productKeys.list({ limit: 4, offset: 0 }),
    queryFn: () => fetchProducts({ limit: 4, offset: 0 }),
  });

  return (
    <section className="bg-surface-container-low px-4 py-24 md:px-8">
      <div className="mx-auto max-w-screen-2xl">
        <div className="mb-16 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <h2 className="mb-4 font-headline text-sm font-bold uppercase tracking-[0.2em] text-tertiary">
              Best Selection
            </h2>
            <h3 className="font-headline text-4xl font-extrabold text-on-surface">지금 가장 맛있는 상품</h3>
          </div>
          <Link
            to="/products"
            className="hidden font-headline font-bold text-on-surface-variant transition-colors hover:text-primary-500 sm:inline"
          >
            전체보기 +
          </Link>
        </div>

        {isLoading ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-96 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {data?.items.map((product) => {
              const status = getProductStatus(product.status);
              const minPrice = product.options.length
                ? Math.min(...product.options.map((o) => o.price))
                : null;

              return (
                <Link key={product.id} to={`/products/${product.id}`}>
                  <div className="group overflow-hidden rounded-xl bg-surface-container-lowest shadow-ambient transition-all duration-500 hover:-translate-y-2 hover:shadow-ambient-md">
                    <div className="relative aspect-square overflow-hidden">
                      {product.primary_image ? (
                        <img
                          src={product.primary_image.thumbnail_url ?? product.primary_image.image_url}
                          alt={product.name}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                          loading="lazy"
                        />
                      ) : (
                        <ImagePlaceholder className="h-full w-full" />
                      )}
                      <span className="absolute left-4 top-4 rounded-full bg-primary px-3 py-1 font-headline text-xs font-bold uppercase tracking-tighter text-on-primary">
                        {status.label}
                      </span>
                    </div>
                    <div className="p-6">
                      <h4 className="mb-1 font-headline text-lg font-bold text-on-surface">{product.name}</h4>
                      <p className="text-xs text-on-surface-variant">{product.category.name}</p>
                      <div className="mt-4 flex items-center justify-between">
                        {minPrice != null && (
                          <span className="font-headline text-xl font-black text-on-surface">
                            {formatPrice(minPrice)}~
                          </span>
                        )}
                        <span
                          className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-high text-on-surface transition-colors group-hover:bg-primary group-hover:text-on-primary"
                          aria-hidden
                        >
                          <ShoppingBag className="h-5 w-5" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        <Link
          to="/products"
          className="mt-12 flex justify-center font-headline font-bold text-on-surface-variant hover:text-primary-500 sm:hidden"
        >
          전체보기 +
        </Link>
      </div>
    </section>
  );
}

function JournalsSection() {
  const { data, isLoading } = useQuery({
    queryKey: journalKeys.list({ limit: 3, offset: 0 }),
    queryFn: () => fetchJournals({ limit: 3, offset: 0 }),
  });

  if (!isLoading && (!data?.items.length || data.items.length === 0)) {
    return null;
  }

  return (
    <section className="overflow-hidden bg-surface px-4 py-24 md:px-8">
      <div className="mx-auto max-w-screen-2xl">
        <div className="mb-20 text-center">
          <h2 className="mb-4 font-headline text-sm font-bold uppercase tracking-[0.2em] text-tertiary">
            The Journal
          </h2>
          <h3 className="font-headline text-4xl font-black text-on-surface md:text-5xl">농장의 사계절 기록</h3>
        </div>

        {isLoading ? (
          <div className="grid gap-12 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-[28rem] rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
            {data?.items.map((journal) => (
              <Link key={journal.id} to={`/journals/${journal.id}`} className="group block cursor-pointer">
                <div className="mb-6 overflow-hidden rounded-xl">
                  {journal.primary_image ? (
                    <img
                      src={journal.primary_image.thumbnail_url ?? journal.primary_image.image_url}
                      alt={journal.title}
                      className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <ImagePlaceholder className="aspect-[16/10] w-full rounded-xl" />
                  )}
                </div>
                <span className="font-headline text-sm font-bold uppercase tracking-[0.2em] text-primary-500">
                  {formatShortDate(journal.created_at)}
                </span>
                <h4 className="mb-4 mt-3 font-headline text-2xl font-extrabold text-on-surface transition-colors group-hover:text-primary-500">
                  {journal.title}
                </h4>
              </Link>
            ))}
          </div>
        )}

        <p className="mt-14 text-center">
          <Link
            to="/journals"
            className="font-headline text-sm font-bold text-on-surface-variant underline-offset-4 hover:text-primary-500"
          >
            농장일지 전체보기
          </Link>
        </p>
      </div>
    </section>
  );
}

/** 시안 Section 5: Trust — tertiary 배경 + 3열 아이콘 */
function TrustSection() {
  const items = [
    {
      icon: Leaf,
      title: '친환경 재배',
      body: '화학 약품을 최소화하고 자연의 순리대로 키워 더 안전합니다.',
    },
    {
      icon: Sprout,
      title: '직접 수확',
      body: '농부가 직접 고르고 수확하여 품질의 편차가 없습니다.',
    },
    {
      icon: Package,
      title: '당일 발송',
      body: '수확 후 빠르게 발송하여 밭의 신선함을 그대로 유지합니다.',
    },
  ] as const;

  return (
    <section className="border-y border-outline-variant/10 bg-tertiary-fixed/30 px-4 py-20 md:px-8">
      <div className="mx-auto grid max-w-screen-xl grid-cols-1 gap-12 md:grid-cols-3">
        {items.map(({ icon: Icon, title, body }) => (
          <div key={title} className="flex flex-col items-center space-y-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-container-lowest text-primary-500 shadow-sm">
              <Icon className="h-8 w-8" strokeWidth={1.75} />
            </div>
            <h5 className="font-headline text-xl font-bold text-on-surface">{title}</h5>
            <p className="text-on-surface-variant">{body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/** 시안 Section 6: Notice — 좌측 primary 보더 + Farm Notice */
function NoticesSection() {
  const { data, isLoading } = useQuery({
    queryKey: noticeKeys.list({ limit: 5, offset: 0 }),
    queryFn: () => fetchNotices({ limit: 5, offset: 0 }),
  });

  if (!isLoading && (!data?.items.length || data.items.length === 0)) {
    return null;
  }

  return (
    <section className="bg-surface-container-lowest px-4 py-16 md:px-8">
      <div className="mx-auto max-w-screen-2xl">
        {isLoading ? (
          <Skeleton className="h-40 w-full rounded-xl" />
        ) : (
          <div className="flex flex-col items-stretch gap-10 border-l-4 border-primary pl-8 md:flex-row md:items-center md:gap-12 md:pl-10">
            <div className="shrink-0">
              <h3 className="font-headline text-2xl font-black uppercase tracking-tight text-on-surface">
                Farm Notice
              </h3>
              <Link
                to="/notices"
                className="mt-2 inline-block font-headline text-sm font-bold text-on-surface-variant hover:text-primary-500"
              >
                전체보기
              </Link>
            </div>
            <div className="min-w-0 flex-1 space-y-4">
              {data?.items.map((notice, idx) => (
                <div key={notice.id}>
                  <Link
                    to={`/notices/${notice.id}`}
                    className="group flex flex-col justify-between gap-1 py-1 sm:flex-row sm:items-center"
                  >
                    <span className="flex min-w-0 items-center gap-2 font-medium text-on-surface group-hover:text-primary-500">
                      {notice.is_pinned && <Pin className="h-3.5 w-3.5 shrink-0 text-persimmon-500" />}
                      <span className="truncate">{notice.title}</span>
                    </span>
                    <time className="shrink-0 text-sm text-on-surface-variant">
                      {formatShortDate(notice.created_at)}
                    </time>
                  </Link>
                  {idx < (data?.items.length ?? 0) - 1 && (
                    <div className="mt-4 h-px w-full bg-outline-variant/20" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function ContactSection() {
  return (
    <section className="bg-surface px-4 py-24 md:px-8 md:py-28">
      <div className="mx-auto max-w-screen-2xl">
        <p className="font-headline text-xs font-bold uppercase tracking-[0.2em] text-tertiary">Visit</p>
        <h2 className="mt-2 font-headline text-3xl font-extrabold text-on-surface md:text-4xl">
          연락처 / 오시는 길
        </h2>
        <div className="mt-12 grid gap-10 lg:grid-cols-2">
          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface-container-high text-primary-500">
                <MapPin className="h-5 w-5" />
              </span>
              <div>
                <p className="font-headline font-bold text-on-surface">주소</p>
                <p className="mt-1 text-sm leading-relaxed text-on-surface-variant">{FARM_INFO.address}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface-container-high text-primary-500">
                <Phone className="h-5 w-5" />
              </span>
              <div>
                <p className="font-headline font-bold text-on-surface">연락처</p>
                <p className="mt-1 text-sm text-on-surface-variant">{FARM_INFO.contactDisplay}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface-container-high text-primary-500">
                <Clock className="h-5 w-5" />
              </span>
              <div>
                <p className="font-headline font-bold text-on-surface">운영 시간</p>
                <p className="mt-1 whitespace-pre-line text-sm text-on-surface-variant">{FARM_INFO.hours}</p>
              </div>
            </div>
          </div>

          <div className="flex min-h-[14rem] items-center justify-center rounded-xl bg-surface-container-high text-center text-sm text-on-surface-variant">
            지도 영역 (추후 네이버/카카오 지도 연동)
          </div>
        </div>
      </div>
    </section>
  );
}
