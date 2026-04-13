export function formatPrice(price: number): string {
  return new Intl.NumberFormat('ko-KR').format(price) + '원';
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

/** 입금 기한까지 남은 시간 문자열 반환. 만료되면 null */
export function formatExpiresIn(isoString: string): { text: string; urgent: boolean } | null {
  const diff = new Date(isoString).getTime() - Date.now();
  if (diff <= 0) return null;
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  const urgent = h < 3;
  const text = h > 0 ? `${h}시간 ${m}분 남음` : `${m}분 남음`;
  return { text, urgent };
}

export function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}
