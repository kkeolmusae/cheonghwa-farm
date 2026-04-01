import type { Config } from 'tailwindcss';

/**
 * 청화 농원 — 2025-2026 Redesign
 * Design Direction: "Modern Terroir"
 * - 차분하고 깊은 숲의 녹색(Forest) + 따뜻한 점토 크림(Clay Cream)
 * - 포인트: 황금빛 햇살(Harvest Gold) + 테라코타(Terracotta)
 * - 중성: 따뜻한 스톤 계열
 */
const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // ---------- Core Brand ----------
        // Forest Green — 신뢰·자연·프리미엄
        forest: {
          50: '#f0f7f1',
          100: '#d9eedc',
          200: '#b4dcbb',
          300: '#81c28e',
          400: '#4da362',
          500: '#2a8045',  // primary action
          600: '#1e6635',
          700: '#175229',
          800: '#12421f',
          900: '#0c3217',
          950: '#061a0c',
        },
        // Harvest Gold — 강조·CTA·가격
        gold: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',  // highlight
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        // Terracotta — 따뜻한 포인트·뱃지
        terra: {
          50: '#fdf4f0',
          100: '#fbe5db',
          200: '#f7cab7',
          300: '#f1a485',
          400: '#e8744e',
          500: '#d95b30',  // warm accent
          600: '#b8401c',
          700: '#953316',
          800: '#742912',
          900: '#5c2211',
        },
        // Clay Cream — 배경·서피스
        cream: {
          50: '#fdfcf9',
          100: '#faf7f2',
          200: '#f5efe5',
          300: '#ede3d3',
          400: '#e0d0b8',
          500: '#d0ba9a',
          600: '#b89a75',
          700: '#8f7355',
          800: '#695543',
          900: '#4e3f34',
        },
        // Warm Stone — 중성·텍스트·테두리
        stone: {
          50: '#fafaf9',
          100: '#f4f3f1',
          200: '#e8e6e3',
          300: '#d5d1cc',
          400: '#b9b3ac',
          500: '#9b9389',
          600: '#7d7469',
          700: '#5f574e',
          800: '#403c35',
          900: '#2a2620',
          950: '#171411',
        },

        // ---------- Semantic Aliases (Tailwind utility shortcuts) ----------
        background:   '#fdfcf9',   // cream-50
        surface:      '#faf7f2',   // cream-100
        'surface-raised': '#ffffff',
        'surface-muted':  '#f5efe5',   // cream-200
        'surface-dark':   '#0c3217',   // forest-900

        'on-bg':      '#2a2620',   // stone-900
        'on-surface': '#403c35',   // stone-800
        'on-muted':   '#5f574e',   // stone-700
        'on-subtle':  '#7d7469',   // stone-600

        border:       '#e8e6e3',   // stone-200
        'border-muted': '#d5d1cc', // stone-300
        'border-strong': '#9b9389', // stone-500

        // Primary palette shortcuts
        primary:      '#2a8045',   // forest-500
        'primary-light': '#4da362', // forest-400
        'primary-dark':  '#1e6635', // forest-600
        'primary-surface': '#d9eedc', // forest-100
        'on-primary': '#ffffff',

        // Accent
        accent:       '#f59e0b',   // gold-500
        'accent-warm':'#d95b30',   // terra-500
        'on-accent':  '#ffffff',
      },

      fontFamily: {
        // Headline: Gmarket Sans — 한국 사용자에게 친숙하고 임팩트 있는 가독성
        // fallback으로 Pretendard / Manrope 체인
        headline: [
          '"Gmarket Sans"',
          'Pretendard',
          'Manrope',
          '"Apple SD Gothic Neo"',
          'system-ui',
          'sans-serif',
        ],
        // Body: Pretendard — 한글 최적화, 세련된 현대적 산세리프
        body: [
          'Pretendard',
          '"Plus Jakarta Sans"',
          '"Apple SD Gothic Neo"',
          'system-ui',
          'sans-serif',
        ],
        sans: [
          'Pretendard',
          '"Plus Jakarta Sans"',
          '"Apple SD Gothic Neo"',
          'system-ui',
          'sans-serif',
        ],
        // Display: 히어로용 초대형 텍스트
        display: [
          '"Gmarket Sans"',
          'Pretendard',
          '"Apple SD Gothic Neo"',
          'system-ui',
          'sans-serif',
        ],
      },

      fontSize: {
        // Display scale (히어로/랜딩 전용)
        'display-2xl': ['clamp(3.5rem, 8vw, 7rem)',    { lineHeight: '1.05', letterSpacing: '-0.03em', fontWeight: '800' }],
        'display-xl':  ['clamp(2.75rem, 6vw, 5.5rem)', { lineHeight: '1.08', letterSpacing: '-0.025em', fontWeight: '800' }],
        'display-lg':  ['clamp(2.25rem, 4.5vw, 4rem)', { lineHeight: '1.1',  letterSpacing: '-0.02em',  fontWeight: '700' }],
        // Heading scale
        'h1': ['clamp(2rem, 3.5vw, 3rem)',    { lineHeight: '1.15', letterSpacing: '-0.02em', fontWeight: '700' }],
        'h2': ['clamp(1.5rem, 2.5vw, 2.25rem)',{ lineHeight: '1.2',  letterSpacing: '-0.015em',fontWeight: '700' }],
        'h3': ['clamp(1.25rem, 2vw, 1.75rem)',{ lineHeight: '1.3',  letterSpacing: '-0.01em', fontWeight: '600' }],
        'h4': ['1.25rem',                      { lineHeight: '1.4',  letterSpacing: '-0.005em',fontWeight: '600' }],
        // Body scale
        'body-lg':  ['1.125rem', { lineHeight: '1.75' }],
        'body-md':  ['1rem',     { lineHeight: '1.7'  }],
        'body-sm':  ['0.9375rem',{ lineHeight: '1.65' }],
        'caption':  ['0.8125rem',{ lineHeight: '1.5'  }],
        'label':    ['0.75rem',  { lineHeight: '1.4', letterSpacing: '0.06em', fontWeight: '700' }],
      },

      spacing: {
        // 4px 기반 + 추가 유틸
        '18': '4.5rem',
        '22': '5.5rem',
        '26': '6.5rem',
        '30': '7.5rem',
        '34': '8.5rem',
        '88': '22rem',
        '100': '25rem',
        '112': '28rem',
        '128': '32rem',
      },

      borderRadius: {
        'xs':  '0.25rem',
        DEFAULT:'0.5rem',
        'md':  '0.625rem',
        'lg':  '0.875rem',
        'xl':  '1.25rem',
        '2xl': '1.75rem',
        '3xl': '2.5rem',
        '4xl': '3.5rem',
      },

      boxShadow: {
        // 자연스러운 따뜻한 그림자 (neutral warm tones)
        'xs':   '0 1px 2px 0 rgba(42,38,32,0.05)',
        'sm':   '0 2px 6px 0 rgba(42,38,32,0.07), 0 1px 2px -1px rgba(42,38,32,0.04)',
        DEFAULT:'0 4px 12px 0 rgba(42,38,32,0.08), 0 2px 4px -2px rgba(42,38,32,0.04)',
        'md':   '0 8px 24px 0 rgba(42,38,32,0.10), 0 4px 8px -4px rgba(42,38,32,0.06)',
        'lg':   '0 16px 40px 0 rgba(42,38,32,0.12), 0 8px 16px -8px rgba(42,38,32,0.06)',
        'xl':   '0 24px 60px 0 rgba(42,38,32,0.14), 0 12px 24px -12px rgba(42,38,32,0.08)',
        '2xl':  '0 32px 80px 0 rgba(42,38,32,0.18)',
        // 특수 효과
        'glow-green': '0 0 0 3px rgba(42,128,69,0.25)',
        'glow-gold':  '0 0 0 3px rgba(245,158,11,0.30)',
        'inset-top':  'inset 0 1px 0 rgba(255,255,255,0.15)',
        'card':       '0 2px 8px 0 rgba(42,38,32,0.06), 0 8px 32px 0 rgba(42,38,32,0.08)',
        'card-hover': '0 8px 24px 0 rgba(42,38,32,0.12), 0 16px 48px 0 rgba(42,38,32,0.10)',
        'none': 'none',
      },

      backgroundImage: {
        // 브랜드 그라데이션
        'gradient-brand':    'linear-gradient(135deg, #175229 0%, #2a8045 50%, #4da362 100%)',
        'gradient-hero':     'linear-gradient(160deg, rgba(12,50,23,0.75) 0%, rgba(12,50,23,0.20) 60%, transparent 100%)',
        'gradient-gold':     'linear-gradient(135deg, #d97706 0%, #f59e0b 60%, #fcd34d 100%)',
        'gradient-warm':     'linear-gradient(180deg, #fdfcf9 0%, #faf7f2 100%)',
        'gradient-section':  'linear-gradient(180deg, #faf7f2 0%, #f5efe5 100%)',
        'gradient-dark':     'linear-gradient(180deg, #175229 0%, #0c3217 100%)',
        // 텍스처 힌트 (CSS로 별도 구현)
        'noise-overlay':     "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")",
      },

      transitionTimingFunction: {
        'spring':     'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        'smooth':     'cubic-bezier(0.4, 0, 0.2, 1)',
        'enter':      'cubic-bezier(0, 0, 0.2, 1)',
        'exit':       'cubic-bezier(0.4, 0, 1, 1)',
        'bounce-soft':'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },

      transitionDuration: {
        '250': '250ms',
        '350': '350ms',
        '450': '450ms',
        '600': '600ms',
        '800': '800ms',
      },

      animation: {
        'fade-up':    'fadeUp 0.6s cubic-bezier(0,0,0.2,1) both',
        'fade-in':    'fadeIn 0.4s cubic-bezier(0,0,0.2,1) both',
        'slide-right':'slideRight 0.5s cubic-bezier(0,0,0.2,1) both',
        'scale-in':   'scaleIn 0.3s cubic-bezier(0.34,1.56,0.64,1) both',
        'shimmer':    'shimmer 1.8s linear infinite',
        'pulse-soft': 'pulseSoft 2.5s ease-in-out infinite',
      },

      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        slideRight: {
          from: { opacity: '0', transform: 'translateX(-16px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.92)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.6' },
        },
      },

      maxWidth: {
        '8xl':  '88rem',
        '9xl':  '96rem',
        '10xl': '104rem',
      },

      aspectRatio: {
        'product': '3 / 4',
        'hero':    '16 / 9',
        'story':   '4 / 5',
        'square':  '1 / 1',
      },

      screens: {
        'xs': '375px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
        '3xl': '1920px',
      },
    },
  },
  plugins: [],
};

export default config;
