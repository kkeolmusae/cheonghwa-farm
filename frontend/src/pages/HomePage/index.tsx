import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, MapPin, Phone, Clock, Pin, ShoppingBag, Leaf, Sprout, Package } from 'lucide-react';
import { fetchSiteSettings, siteSettingsKeys } from '@/api/siteSettings';
import { toAbsoluteMediaUrl } from '@/utils/mediaUrl';
import { fetchProducts, productKeys } from '@/api/products';
import { fetchJournals, journalKeys } from '@/api/journals';
import { fetchNotices, noticeKeys } from '@/api/notices';
import { Skeleton } from '@/components/ui/Skeleton';
import { ImagePlaceholder } from '@/components/ui/ImagePlaceholder';
import { formatPrice, formatShortDate } from '@/utils/format';
import { getProductStatus } from '@/constants/status';
import { FARM_INFO } from '@/constants/farm';
import { STITCH_FARM_STORY_IMAGE, STITCH_HERO_IMAGE } from '@/constants/stitchAssets';
import KakaoMap from '@/components/common/KakaoMap';

export default function HomePage() {
  const { data: siteImg } = useQuery({
    queryKey: siteSettingsKeys.all,
    queryFn: fetchSiteSettings,
    staleTime: 60_000,
  });
  const heroUrl = siteImg?.home_hero_image_url ? toAbsoluteMediaUrl(siteImg.home_hero_image_url) : STITCH_HERO_IMAGE;
  const storyUrl = siteImg?.home_story_image_url ? toAbsoluteMediaUrl(siteImg.home_story_image_url) : STITCH_FARM_STORY_IMAGE;
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

function HeroSection({ heroUrl }: { heroUrl: string }) {
  return (
    <section className="relative flex min-h-[80vh] items-center overflow-hidden md:h-[920px] md:min-h-0">
      <div className="absolute inset-0 z-0">
        <img src={heroUrl} alt="" className="h-full w-full object-cover" />
        <div className="hero-overlay-left absolute inset-0" />
      </div>
      <div className="relative z-10 container-site py-20">
        <div className="max-w-2xl text-white">
          <span className="eyebrow-light mb-6">
            직접 재배 · 직접 판매
          </span>
          <h1 className="mt-4 font-display text-display-xl font-black text-white text-balance">
            자연 그대로 키운
            <br />
            <span className="text-gold-300">{FARM_INFO.name}</span>
          </h1>
          <p className="mt-6 font-body text-xl leading-relaxed text-white/85 md:text-2xl text-pretty">
            직접 재배하고 직접 판매합니다.
            <br />
            땅의 정직함이 전하는 가장 신선한 이야기.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link to="/products" className="group btn btn-primary btn-xl">
              상품 보러가기
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link to="/about" className="btn btn-outline-dark btn-xl">
              농장 이야기 보기
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function AboutPreview({ storyUrl }: { storyUrl: string }) {
  return (
    <section className="bg-surface section-py">
      <div className="container-site">
        <div className="grid grid-cols-1 items-center gap-14 md:grid-cols-2 lg:gap-20">
          <div className="relative">
            <div className="absolute -left-4 -top-4 h-28 w-28 rounded-full bg-forest-100 opacity-60" />
            <img
              src={storyUrl}
              alt=""
              className="relative aspect-[4/5] w-full rounded-3xl object-cover shadow-xl"
            />
            <div className="absolute -bottom-5 -right-4 hidden max-w-xs rounded-2xl bg-surface-raised p-6 shadow-lg lg:block">
              <p className="font-body text-sm italic font-medium leading-relaxed text-on-muted">
                &ldquo;{FARM_INFO.region}의 맑은 공기와 땅을 믿습니다.&rdquo;
              </p>
              <p className="mt-3 font-headline text-sm font-bold text-on-bg">{FARM_INFO.representative} 대표</p>
            </div>
          </div>
          <div className="space-y-7">
            <div className="heading-group">
              <span className="eyebrow">Our Philosophy</span>
              <h2 className="text-h1 font-headline font-black text-on-bg text-balance">
                느리지만 바르게,
                <br />
                흙에서 식탁까지의 여정
              </h2>
            </div>
            <p className="text-body-lg text-on-muted text-pretty">
              {FARM_INFO.name}은(는) 할머니 대부터 이어온 재배 방식과 오늘의 품질 관리를 함께합니다.
              제초제 없는 건강한 땅에서 자란 작물은 농부가 직접 확인하고, 당일 포장해 식탁까지 전합니다.
            </p>
            <Link
              to="/about"
              className="inline-flex items-center gap-2 font-headline text-base font-bold text-primary transition-colors hover:text-primary-dark"
            >
              상세한 재배 방식 읽어보기
              <ArrowRight className="h-4 w-4" />
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
    <section className="bg-surface-muted section-py">
      <div className="container-site">
        <div className="mb-14 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div className="heading-group">
            <span className="eyebrow">Best Selection</span>
            <h2 className="text-h2 font-headline font-bold text-on-bg">지금 가장 맛있는 상품</h2>
          </div>
          <Link
            to="/products"
            className="hidden items-center gap-1 font-headline text-sm font-bold text-on-subtle transition-colors hover:text-primary sm:inline-flex"
          >
            전체보기 <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-96 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {data?.items.map((product) => {
              const status = getProductStatus(product.status);
              const minPrice = product.options.length
                ? Math.min(...product.options.map((o) => o.price))
                : null;
              return (
                <Link key={product.id} to={`/products/${product.id}`} className="group">
                  <div className="card-hover">
                    <div className="card-image relative aspect-[3/4] overflow-hidden bg-surface-muted">
                      {product.primary_image ? (
                        <img
                          src={product.primary_image.thumbnail_url ?? product.primary_image.image_url}
                          alt={product.name}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                          loading="lazy"
                        />
                      ) : (
                        <ImagePlaceholder className="h-full w-full" />
                      )}
                      <span className="absolute left-3 top-3 badge badge-green">{status.label}</span>
                    </div>
                    <div className="card-body p-5">
                      <p className="text-caption text-on-subtle uppercase tracking-wide">{product.category.name}</p>
                      <h3 className="mt-1 font-headline text-base font-bold text-on-bg">{product.name}</h3>
                      <div className="mt-3 flex items-center justify-between">
                        {minPrice != null && (
                          <span className="font-headline text-lg font-black text-primary">
                            {formatPrice(minPrice)}~
                          </span>
                        )}
                        <span
                          className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-muted text-on-muted transition-colors group-hover:bg-primary group-hover:text-white"
                          aria-hidden
                        >
                          <ShoppingBag className="h-4 w-4" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        <div className="mt-10 text-center sm:hidden">
          <Link to="/products" className="btn btn-secondary btn-md">
            전체보기 <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function JournalsSection() {
  const { data, isLoading } = useQuery({
    queryKey: journalKeys.list({ limit: 3, offset: 0 }),
    queryFn: () => fetchJournals({ limit: 3, offset: 0 }),
  });

  if (!isLoading && (!data?.items.length || data.items.length === 0)) return null;

  return (
    <section className="bg-surface section-py overflow-hidden">
      <div className="container-site">
        <div className="mb-14 text-center heading-group">
          <span className="eyebrow justify-center before:hidden after:content-[''] after:block after:h-px after:w-6 after:bg-primary">The Journal</span>
          <h2 className="text-h2 font-headline font-bold text-on-bg">농장의 사계절 기록</h2>
        </div>

        {isLoading ? (
          <div className="grid gap-8 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-[28rem] rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {data?.items.map((journal) => (
              <Link key={journal.id} to={`/journals/${journal.id}`} className="group block">
                <div className="overflow-hidden rounded-2xl mb-5">
                  {journal.primary_image ? (
                    <img
                      src={journal.primary_image.thumbnail_url ?? journal.primary_image.image_url}
                      alt={journal.title}
                      className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <ImagePlaceholder className="aspect-[16/10] w-full rounded-2xl" />
                  )}
                </div>
                <time className="text-caption font-bold uppercase tracking-[0.1em] text-primary">
                  {formatShortDate(journal.created_at)}
                </time>
                <h3 className="mt-2 font-headline text-xl font-bold text-on-bg transition-colors group-hover:text-primary line-clamp-2">
                  {journal.title}
                </h3>
              </Link>
            ))}
          </div>
        )}

        <p className="mt-12 text-center">
          <Link to="/journals" className="btn btn-ghost btn-md">
            농장일지 전체보기 <ArrowRight className="h-4 w-4" />
          </Link>
        </p>
      </div>
    </section>
  );
}

function TrustSection() {
  const items = [
    { icon: Leaf, title: '친환경 재배', body: '화학 약품을 최소화하고 자연의 순리대로 키워 더 안전합니다.' },
    { icon: Sprout, title: '직접 수확', body: '농부가 직접 고르고 수확하여 품질의 편차가 없습니다.' },
    { icon: Package, title: '당일 발송', body: '수확 후 빠르게 발송하여 밭의 신선함을 그대로 유지합니다.' },
  ] as const;

  return (
    <section className="border-y border-border/40 bg-forest-50 section-py-sm">
      <div className="container-site">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {items.map(({ icon: Icon, title, body }) => (
            <div key={title} className="trust-item">
              <div className="trust-icon-wrap">
                <Icon className="h-6 w-6" strokeWidth={1.75} />
              </div>
              <div className="space-y-2">
                <h4 className="font-headline text-base font-bold text-on-bg">{title}</h4>
                <p className="text-body-sm text-on-muted text-pretty">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function NoticesSection() {
  const { data, isLoading } = useQuery({
    queryKey: noticeKeys.list({ limit: 5, offset: 0 }),
    queryFn: () => fetchNotices({ limit: 5, offset: 0 }),
  });

  if (!isLoading && (!data?.items.length || data.items.length === 0)) return null;

  return (
    <section className="bg-surface-muted section-py-sm">
      <div className="container-site">
        {isLoading ? (
          <Skeleton className="h-40 w-full rounded-2xl" />
        ) : (
          <div className="flex flex-col gap-8 md:flex-row md:gap-12">
            <div className="shrink-0 md:w-48">
              <h3 className="font-headline text-xl font-black text-on-bg">Farm Notice</h3>
              <Link
                to="/notices"
                className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-on-subtle hover:text-primary transition-colors"
              >
                전체보기 <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="flex-1 min-w-0 divide-y divide-border/60">
              {data?.items.map((notice) => (
                <Link
                  key={notice.id}
                  to={`/notices/${notice.id}`}
                  className="group flex items-center justify-between gap-4 py-3.5 hover:text-primary transition-colors"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    {notice.is_pinned && <Pin className="h-3.5 w-3.5 shrink-0 text-accent-warm" />}
                    <span className="truncate text-sm font-medium text-on-surface group-hover:text-primary">{notice.title}</span>
                  </span>
                  <time className="shrink-0 text-xs text-on-subtle">
                    {formatShortDate(notice.created_at)}
                  </time>
                </Link>
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
    <section className="bg-surface section-py">
      <div className="container-site">
        <div className="heading-group mb-12">
          <span className="eyebrow">Visit</span>
          <h2 className="text-h2 font-headline font-bold text-on-bg">연락처 / 오시는 길</h2>
        </div>
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="space-y-7">
            {[
              { icon: MapPin, label: '주소', value: FARM_INFO.address },
              { icon: Phone, label: '연락처', value: FARM_INFO.contactDisplay },
              { icon: Clock, label: '운영 시간', value: FARM_INFO.hours },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-forest-50 text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-headline text-sm font-bold text-on-bg">{label}</p>
                  <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-on-muted">{value}</p>
                </div>
              </div>
            ))}
          </div>
          <KakaoMap
            address={FARM_INFO.address}
            title={FARM_INFO.name}
            className="min-h-[14rem]"
          />
        </div>
      </div>
    </section>
  );
}
