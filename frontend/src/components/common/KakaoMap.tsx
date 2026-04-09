import { useEffect, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';

/* eslint-disable @typescript-eslint/no-explicit-any */
const w = window as any;

interface KakaoMapProps {
  address: string;
  title: string;
  className?: string;
}

type Status = 'loading' | 'ready' | 'error' | 'no-key';

let scriptLoadPromise: Promise<void> | null = null;

function loadKakaoScript(appKey: string): Promise<void> {
  if (scriptLoadPromise) return scriptLoadPromise;
  if (w.kakao?.maps) {
    scriptLoadPromise = Promise.resolve();
    return scriptLoadPromise;
  }
  scriptLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&libraries=services&autoload=false`;
    script.async = true;
    script.onload = () => w.kakao.maps.load(() => resolve());
    script.onerror = () => {
      scriptLoadPromise = null;
      reject(new Error('카카오맵 SDK 로드 실패'));
    };
    document.head.appendChild(script);
  });
  return scriptLoadPromise;
}

export default function KakaoMap({ address, title, className = '' }: KakaoMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<Status>('loading');

  useEffect(() => {
    const appKey = import.meta.env.VITE_KAKAO_MAP_KEY as string | undefined;
    if (!appKey) {
      setStatus('no-key');
      return;
    }

    let cancelled = false;

    loadKakaoScript(appKey)
      .then(() => {
        if (cancelled || !mapRef.current) return;

        const geocoder = new w.kakao.maps.services.Geocoder();
        geocoder.addressSearch(address, (result: any[], status: string) => {
          if (cancelled || !mapRef.current) return;

          if (status !== w.kakao.maps.services.Status.OK) {
            setStatus('error');
            return;
          }

          const coords = new w.kakao.maps.LatLng(
            Number(result[0].y),
            Number(result[0].x),
          );

          const map = new w.kakao.maps.Map(mapRef.current, {
            center: coords,
            level: 4,
          });

          const marker = new w.kakao.maps.Marker({ position: coords });
          marker.setMap(map);

          const infowindow = new w.kakao.maps.InfoWindow({
            content: `<div style="padding:6px 12px;font-size:13px;font-weight:600;white-space:nowrap">${title}</div>`,
          });
          infowindow.open(map, marker);

          setStatus('ready');
        });
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [address, title]);

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-stone-200 shadow-sm ${className}`}>
      {/* 지도 컨테이너 — 항상 DOM에 존재하고 visible 해야 Kakao Maps가 크기를 올바르게 인식 */}
      <div ref={mapRef} className="h-full w-full" />

      {/* 로딩/에러/키 없음 상태는 지도 위에 오버레이로 표시 */}
      {status !== 'ready' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-stone-100 text-sm text-on-subtle">
          {status === 'loading' && <span>지도를 불러오는 중...</span>}

          {status === 'error' && (
            <>
              <MapPin className="h-6 w-6 text-stone-400" />
              <span>지도를 불러올 수 없습니다</span>
              <span className="text-xs text-stone-400">{address}</span>
            </>
          )}

          {status === 'no-key' && (
            <>
              <MapPin className="h-6 w-6 text-stone-400" />
              <span className="font-medium text-on-bg">{address}</span>
              <span className="text-xs text-stone-400">
                VITE_KAKAO_MAP_KEY 설정 후 지도가 표시됩니다
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
