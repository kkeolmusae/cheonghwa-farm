export function toAbsoluteMediaUrl(pathOrUrl: string): string {
  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
    return pathOrUrl;
  }
  const base = import.meta.env.VITE_API_BASE_URL || '';
  if (base) {
    const origin = base.replace(/\/api\/v1\/?$/, '');
    const path = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
    return `${origin}${path}`;
  }
  return pathOrUrl;
}
