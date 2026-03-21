import { useState, useCallback, useRef } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { uploadImage, type UploadResponse } from '@/api/uploads';
import { cn } from '@/utils/cn';

interface ImageUploadProps {
  images: UploadResponse[];
  onChange: (images: UploadResponse[]) => void;
  maxImages?: number;
  className?: string;
}

export function ImageUpload({
  images,
  onChange,
  maxImages = 10,
  className,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const remaining = maxImages - images.length;
      if (remaining <= 0) {
        toast.error(`최대 ${maxImages}개의 이미지만 업로드할 수 있습니다.`);
        return;
      }

      const filesToUpload = Array.from(files).slice(0, remaining);
      setUploading(true);

      try {
        const results = await Promise.all(
          filesToUpload.map((file) => uploadImage(file)),
        );
        onChange([...images, ...results]);
      } catch {
        toast.error('이미지 업로드에 실패했습니다.');
      } finally {
        setUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    },
    [images, maxImages, onChange],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  const handleRemove = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className={cn('space-y-3', className)}>
      <div
        className={cn(
          'flex min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-6 transition-colors hover:border-primary-400 hover:bg-primary-50/30',
          uploading && 'pointer-events-none opacity-60',
        )}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        {uploading ? (
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        ) : (
          <Upload className="h-8 w-8 text-gray-400" />
        )}
        <p className="mt-2 text-sm text-gray-500">
          {uploading ? '업로드 중...' : '클릭하거나 이미지를 드래그하세요'}
        </p>
        <p className="mt-1 text-xs text-gray-400">
          {images.length}/{maxImages}개 업로드됨
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {images.map((img, idx) => (
            <div key={idx} className="group relative aspect-square overflow-hidden rounded-lg border">
              <img
                src={img.thumbnail_url || img.image_url}
                alt={`업로드 이미지 ${idx + 1}`}
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/80"
                aria-label="이미지 삭제"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
