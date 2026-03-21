import { Leaf, Droplets, Sun, Sprout, MapPin, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { FARM_INFO } from '@/constants/farm';

export default function AboutPage() {
  return (
    <>
      <HeroSection />
      <StorySection />
      <CropsSection />
      <FarmingSection />
      <LocationSection />
    </>
  );
}

function HeroSection() {
  return (
    <section className="flex flex-col items-center justify-center bg-surface px-4 py-20 text-center md:py-28">
      <span className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-500/10 text-primary-500">
        <Leaf className="h-7 w-7" strokeWidth={2.25} />
      </span>
      <p className="font-headline text-xs font-bold uppercase tracking-[0.2em] text-tertiary">About</p>
      <h1 className="mt-2 font-headline text-4xl font-extrabold text-on-surface md:text-5xl">{FARM_INFO.name} 소개</h1>
      <p className="mt-4 max-w-lg font-body text-lg text-on-surface-variant">
        자연과 함께, 정직한 농사를 짓습니다
      </p>
    </section>
  );
}

function StorySection() {
  return (
    <section className="mx-auto max-w-screen-2xl px-4 py-16 md:px-8 md:py-24">
      <h2 className="font-headline text-3xl font-extrabold text-on-surface">농장 스토리</h2>
      <div className="mt-8 space-y-6 font-body text-lg leading-relaxed text-on-surface-variant">
        <p>
          {FARM_INFO.name}은 {FARM_INFO.region}의 맑은 공기와 깨끗한 물이 흐르는 곳에 자리 잡고 있습니다.
          할머니 대부터 3대에 걸쳐 이어온 농사 철학을 바탕으로, 땅을 건강하게 가꾸고
          자연의 순리에 따라 농산물을 재배하고 있습니다.
        </p>
        <p>
          화학 비료와 농약 사용을 최소화하고, 자연 순환 농법을 지향합니다.
          벌레가 먹은 흔적이 있어도 괜찮습니다. 그게 바로 건강한 농산물의 증거니까요.
        </p>
        <p>
          중간 유통을 거치지 않고 농장에서 소비자 여러분의 식탁까지 직접 전달하기 때문에,
          더 신선하고 합리적인 가격으로 만나보실 수 있습니다.
        </p>
      </div>
    </section>
  );
}

const CROPS = [
  {
    name: '블루베리',
    season: '6~7월',
    icon: Droplets,
    color: 'text-berry-600 bg-berry-100',
    description: '항산화 성분이 풍부한 유기농 블루베리를 직접 재배합니다. 달콤하고 톡톡 터지는 식감이 일품입니다.',
  },
  {
    name: '벼 (쌀)',
    season: '10월',
    icon: Sun,
    color: 'text-persimmon-600 bg-persimmon-100',
    description: '맑은 물과 비옥한 토양에서 자란 청도 쌀입니다. 밥을 지으면 찰지고 구수한 맛이 납니다.',
  },
  {
    name: '콩',
    season: '9~10월',
    icon: Sprout,
    color: 'text-primary-600 bg-primary-100',
    description: '청도군의 비옥한 땅에서 재배한 콩입니다. 두부, 된장, 콩나물 등 다양한 가공용으로 활용됩니다.',
  },
  {
    name: '복숭아',
    season: '7~8월',
    icon: Leaf,
    color: 'text-persimmon-700 bg-persimmon-100',
    description: '당도 높은 청도 복숭아입니다. 신선한 생과와 가공용 모두 선별하여 제공합니다.',
  },
] as const;

function CropsSection() {
  return (
    <section className="bg-surface-container-low px-4 py-16 md:px-8 md:py-24">
      <div className="mx-auto max-w-screen-2xl">
        <p className="text-center font-headline text-xs font-bold uppercase tracking-[0.2em] text-tertiary">
          Crops
        </p>
        <h2 className="mt-2 text-center font-headline text-3xl font-extrabold text-on-surface">재배 작물</h2>
        <p className="mt-3 text-center font-body text-on-surface-variant">
          계절마다 신선한 농산물을 만나보세요
        </p>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {CROPS.map((crop) => (
            <Card key={crop.name} className="overflow-hidden">
              <CardContent className="flex flex-col items-start gap-5 p-6">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${crop.color}`}>
                  <crop.icon className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-headline text-lg font-bold text-on-surface">{crop.name}</h3>
                    <span className="rounded-full bg-tertiary-fixed px-2 py-0.5 font-headline text-[10px] font-bold uppercase tracking-wider text-on-tertiary-fixed">
                      수확 {crop.season}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">{crop.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

const METHODS = [
  '자연 순환 농법으로 토양 건강 유지',
  '화학 비료·농약 사용 최소화',
  '수확 당일 발송으로 최고의 신선도 보장',
  '직거래 방식으로 중간 유통 비용 절감',
  '소량 다품종 재배로 품질 관리 집중',
  '지역 사회와 함께하는 지속 가능한 농업',
] as const;

function FarmingSection() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-16 md:px-8 md:py-24">
      <h2 className="font-headline text-3xl font-extrabold text-on-surface">운영 방식</h2>
      <ul className="mt-8 space-y-4">
        {METHODS.map((method) => (
          <li key={method} className="flex items-start gap-4">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary-500" />
            <span className="font-body text-on-surface-variant">{method}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function LocationSection() {
  return (
    <section className="bg-surface-container-low px-4 py-16 md:px-8 md:py-24">
      <div className="mx-auto max-w-screen-2xl">
        <h2 className="font-headline text-3xl font-extrabold text-on-surface">농장 위치</h2>
        <div className="mt-10 grid gap-10 lg:grid-cols-2">
          <div className="flex items-start gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface-container-lowest text-primary-500 shadow-ambient">
              <MapPin className="h-5 w-5" />
            </span>
            <div>
              <p className="font-medium text-on-surface">{FARM_INFO.address}</p>
              <p className="mt-2 text-sm text-on-surface-variant">방문 전 전화 예약 부탁드립니다.</p>
            </div>
          </div>
          <div className="flex min-h-[12rem] items-center justify-center rounded-xl bg-surface-container-high text-sm text-on-surface-variant">
            지도 영역 (추후 네이버/카카오 지도 연동)
          </div>
        </div>
      </div>
    </section>
  );
}
