import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Image as ImageIcon, Loader2, Upload } from 'lucide-react';
import toast from 'react-hot-toast';

import { getSiteSettings, patchSiteSettings } from '@/api/siteSettings';
import { uploadImage } from '@/api/uploads';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { toAbsoluteMediaUrl } from '@/utils/mediaUrl';

export default function SiteImagesPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['admin-site-settings'],
    queryFn: getSiteSettings,
  });

  const [homeHero, setHomeHero] = useState('');
  const [homeStory, setHomeStory] = useState('');
  const [shopHero, setShopHero] = useState('');
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);

  useEffect(() => {
    if (!data) return;
    setHomeHero(data.home_hero_image_url ?? '');
    setHomeStory(data.home_story_image_url ?? '');
    setShopHero(data.shop_hero_texture_url ?? '');
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: () =>
      patchSiteSettings({
        home_hero_image_url: homeHero.trim() || null,
        home_story_image_url: homeStory.trim() || null,
        shop_hero_texture_url: shopHero.trim() || null,
      }),
    onSuccess: () => {
      toast.success('저장했습니다.');
      queryClient.invalidateQueries({ queryKey: ['admin-site-settings'] });
    },
    onError: () => toast.error('저장에 실패했습니다.'),
  });

  const handleUpload = async (
    key: 'home_hero_image_url' | 'home_story_image_url' | 'shop_hero_texture_url',
    file: File | null,
  ) => {
    if (!file) return;
    setUploadingKey(key);
    try {
      const res = await uploadImage(file);
      const url = res.image_url;
      if (key === 'home_hero_image_url') setHomeHero(url);
      if (key === 'home_story_image_url') setHomeStory(url);
      if (key === 'shop_hero_texture_url') setShopHero(url);
      toast.success('업로드되었습니다. 저장을 눌러 반영하세요.');
    } catch {
      toast.error('업로드에 실패했습니다.');
    } finally {
      setUploadingKey(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">메인 화면 이미지</h1>
        <p className="mt-1 text-sm text-gray-500">
          공개 홈 히어로, 농장 소개, 상품 목록 상단 배경 이미지를 설정합니다. 비우면 기본 시안 이미지가
          사용됩니다.
        </p>
      </div>

      <div className="space-y-6">
        <ImageFieldCard
          title="홈 히어로 (전체 너비 배경)"
          description="메인 첫 화면 큰 이미지"
          value={homeHero}
          onChange={setHomeHero}
          uploading={uploadingKey === 'home_hero_image_url'}
          onPickFile={(f) => handleUpload('home_hero_image_url', f)}
        />
        <ImageFieldCard
          title="홈 농장 소개"
          description="‘Our Philosophy’ 옆 큰 세로 이미지"
          value={homeStory}
          onChange={setHomeStory}
          uploading={uploadingKey === 'home_story_image_url'}
          onPickFile={(f) => handleUpload('home_story_image_url', f)}
        />
        <ImageFieldCard
          title="상품 목록 히어로 텍스처"
          description="둥근 카드 배경에 깔리는 패턴 이미지"
          value={shopHero}
          onChange={setShopHero}
          uploading={uploadingKey === 'shop_hero_texture_url'}
          onPickFile={(f) => handleUpload('shop_hero_texture_url', f)}
        />
      </div>

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            if (!data) return;
            setHomeHero(data.home_hero_image_url ?? '');
            setHomeStory(data.home_story_image_url ?? '');
            setShopHero(data.shop_hero_texture_url ?? '');
          }}
        >
          되돌리기
        </Button>
        <Button type="button" loading={saveMutation.isPending} onClick={() => saveMutation.mutate()}>
          저장
        </Button>
      </div>
    </div>
  );
}

function ImageFieldCard({
  title,
  description,
  value,
  onChange,
  uploading,
  onPickFile,
}: {
  title: string;
  description: string;
  value: string;
  onChange: (v: string) => void;
  uploading: boolean;
  onPickFile: (file: File | null) => void;
}) {
  const preview = value.trim() ? toAbsoluteMediaUrl(value.trim()) : null;

  return (
    <Card className="space-y-4">
      <div>
        <div className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5 text-primary-600" />
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        </div>
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      </div>
      <div className="space-y-4">
        {preview && (
          <div className="overflow-hidden rounded-lg border bg-gray-50">
            <img src={preview} alt="" className="max-h-48 w-full object-cover object-center" />
          </div>
        )}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1">
            <label className="mb-1 block text-xs font-medium text-gray-600">이미지 URL</label>
            <Input
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="https://... 또는 /uploads/... (업로드 시 자동 입력)"
            />
          </div>
          <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            파일 업로드
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={uploading}
              onChange={(e) => {
                onPickFile(e.target.files?.[0] ?? null);
                e.target.value = '';
              }}
            />
          </label>
        </div>
      </div>
    </Card>
  );
}
