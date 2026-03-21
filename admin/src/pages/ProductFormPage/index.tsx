import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  getProduct,
  createProduct,
  updateProduct,
  productKeys,
} from '@/api/products';
import { fetchCategories, categoryKeys } from '@/api/categories';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/utils/cn';
import type { UploadResponse } from '@/api/uploads';

const MAX_SUB_IMAGES = 20;

const optionSchema = z.object({
  name: z.string().min(1, '옵션명을 입력해주세요'),
  price: z.coerce.number().min(0, '가격은 0 이상이어야 합니다'),
  stock_quantity: z.coerce.number().int().min(0, '재고는 0 이상이어야 합니다'),
  sort_order: z.coerce.number().int().min(0),
});

const productSchema = z.object({
  name: z.string().min(1, '상품명을 입력해주세요'),
  description: z.string().min(1, '설명을 입력해주세요'),
  category_id: z.coerce.number().min(1, '카테고리를 선택해주세요'),
  status: z.string(),
  harvest_start: z.string().optional().transform(v => v || null),
  harvest_end: z.string().optional().transform(v => v || null),
  sale_start: z.string().optional().transform(v => v || null),
  sale_end: z.string().optional().transform(v => v || null),
  options: z.array(optionSchema).min(1, '최소 1개의 옵션이 필요합니다'),
});

type ProductFormData = z.infer<typeof productSchema>;

const statusOptions = [
  { value: '판매 예정', label: '판매 예정' },
  { value: '판매 중', label: '판매 중' },
  { value: '품절', label: '품절' },
  { value: '판매 종료', label: '판매 종료' },
];

function SortableSubImageItem({
  id,
  image,
  onRemove,
}: {
  id: string;
  image: UploadResponse;
  onRemove: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-3 rounded-lg border bg-white p-2',
        isDragging && 'z-10 opacity-90 shadow-md',
      )}
    >
      <button
        type="button"
        className="cursor-grab touch-none rounded p-1 text-gray-400 hover:text-gray-600 active:cursor-grabbing"
        aria-label="순서 변경"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <div className="h-14 w-14 shrink-0 overflow-hidden rounded border">
        <img
          src={image.thumbnail_url || image.image_url}
          alt="상세 이미지"
          className="h-full w-full object-cover"
        />
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="ml-auto rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
        aria-label="이미지 삭제"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function ProductFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      status: '판매 예정',
      options: [{ name: '', price: 0, stock_quantity: 0, sort_order: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'options',
  });

  const [mainImage, setMainImage] = useState<UploadResponse | null>(null);
  const [subImages, setSubImages] = useState<UploadResponse[]>([]);

  const { data: categories } = useQuery({
    queryKey: categoryKeys.all,
    queryFn: fetchCategories,
  });

  const { data: existingProduct, isLoading: isLoadingProduct } = useQuery({
    queryKey: productKeys.detail(id!),
    queryFn: () => getProduct(id!),
    enabled: isEdit,
  });

  useEffect(() => {
    if (existingProduct) {
      reset({
        name: existingProduct.name,
        description: existingProduct.description,
        category_id: existingProduct.category_id,
        status: existingProduct.status,
        harvest_start: existingProduct.harvest_start ?? '',
        harvest_end: existingProduct.harvest_end ?? '',
        sale_start: existingProduct.sale_start ?? '',
        sale_end: existingProduct.sale_end ?? '',
        options: existingProduct.options.map((o) => ({
          name: o.name,
          price: o.price,
          stock_quantity: o.stock_quantity,
          sort_order: o.sort_order,
        })),
      });
      const sorted = [...existingProduct.images].sort((a, b) => a.sort_order - b.sort_order);
      const primaryIdx = sorted.findIndex((img) => img.is_primary);
      const mainIdx = primaryIdx >= 0 ? primaryIdx : 0;
      const primary = sorted[mainIdx];
      const rest = sorted.filter((_, i) => i !== mainIdx);
      setMainImage(
        primary
          ? { image_url: primary.image_url, thumbnail_url: primary.thumbnail_url }
          : null,
      );
      setSubImages(
        rest.map((img) => ({
          image_url: img.image_url,
          thumbnail_url: img.thumbnail_url,
        })),
      );
    }
  }, [existingProduct, reset]);

  const combinedImages = useMemo(() => {
    if (mainImage) return [mainImage, ...subImages];
    return subImages;
  }, [mainImage, subImages]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buildPayload = (data: ProductFormData): any => ({
    ...data,
    images: combinedImages.map((img, idx) => ({
      image_url: img.image_url,
      thumbnail_url: img.thumbnail_url,
      sort_order: idx,
    })),
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleSubImagesDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over == null || active.id === over.id) return;
    const oldIndex = subImages.findIndex((_, i) => String(i) === active.id);
    const newIndex = subImages.findIndex((_, i) => String(i) === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    setSubImages(arrayMove(subImages, oldIndex, newIndex));
  };

  const createMutation = useMutation({
    mutationFn: (data: ProductFormData) => createProduct(buildPayload(data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      toast.success('상품이 등록되었습니다.');
      navigate('/products');
    },
    onError: () => {
      toast.error('상품 등록에 실패했습니다.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: ProductFormData) => updateProduct(id!, buildPayload(data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productKeys.detail(id!) });
      toast.success('상품이 수정되었습니다.');
      navigate('/products');
    },
    onError: () => {
      toast.error('상품 수정에 실패했습니다.');
    },
  });

  const onSubmit = (data: ProductFormData) => {
    if (!mainImage) {
      toast.error('대표 이미지를 1장 등록해 주세요.');
      return;
    }
    if (isEdit) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const categoryOptions = categories?.map((c) => ({ value: String(c.id), label: c.name })) ?? [];

  if (isEdit && isLoadingProduct) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-3xl space-y-6">
      <Card>
        <h3 className="mb-4 text-base font-semibold text-gray-900">기본 정보</h3>
        <div className="space-y-4">
          <Input
            label="상품명"
            placeholder="상품명을 입력하세요"
            error={errors.name?.message}
            {...register('name')}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select
              label="카테고리"
              options={categoryOptions}
              placeholder="카테고리 선택"
              error={errors.category_id?.message}
              {...register('category_id')}
            />
            <Select
              label="판매 상태"
              options={statusOptions}
              error={errors.status?.message}
              {...register('status')}
            />
          </div>
          <Textarea
            label="설명"
            placeholder="상품 설명을 입력하세요"
            rows={5}
            error={errors.description?.message}
            {...register('description')}
          />
        </div>
      </Card>

      <Card>
        <h3 className="mb-4 text-base font-semibold text-gray-900">기간 설정</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="수확 시작일"
            type="date"
            {...register('harvest_start')}
          />
          <Input
            label="수확 종료일"
            type="date"
            {...register('harvest_end')}
          />
          <Input
            label="판매 시작일"
            type="date"
            {...register('sale_start')}
          />
          <Input
            label="판매 종료일"
            type="date"
            {...register('sale_end')}
          />
        </div>
      </Card>

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900">옵션</h3>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() =>
              append({ name: '', price: 0, stock_quantity: 0, sort_order: fields.length })
            }
          >
            <Plus className="h-4 w-4" />
            옵션 추가
          </Button>
        </div>

        {errors.options?.root && (
          <p className="mb-3 text-sm text-red-600">{errors.options.root.message}</p>
        )}

        <div className="space-y-3">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4 sm:flex-row sm:items-start"
            >
              <div className="flex-1">
                <Input
                  label="옵션명"
                  placeholder="예: 3kg"
                  error={errors.options?.[index]?.name?.message}
                  {...register(`options.${index}.name`)}
                />
              </div>
              <div className="w-full sm:w-32">
                <Input
                  label="가격"
                  type="number"
                  placeholder="0"
                  error={errors.options?.[index]?.price?.message}
                  {...register(`options.${index}.price`)}
                />
              </div>
              <div className="w-full sm:w-24">
                <Input
                  label="재고"
                  type="number"
                  placeholder="0"
                  error={errors.options?.[index]?.stock_quantity?.message}
                  {...register(`options.${index}.stock_quantity`)}
                />
              </div>
              <div className="w-full sm:w-20">
                <Input
                  label="순서"
                  type="number"
                  placeholder="0"
                  {...register(`options.${index}.sort_order`)}
                />
              </div>
              <div className="flex items-end pt-6">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(index)}
                  disabled={fields.length === 1}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="mb-4 text-base font-semibold text-gray-900">대표 이미지 (메인)</h3>
        <p className="mb-3 text-sm text-gray-500">
          상품 상단에 노출되는 대표 이미지 1장을 등록하세요.
        </p>
        <ImageUpload
          images={mainImage ? [mainImage] : []}
          onChange={(imgs) => setMainImage(imgs[0] ?? null)}
          maxImages={1}
        />
      </Card>

      <Card>
        <h3 className="mb-4 text-base font-semibold text-gray-900">상세 이미지 (서브)</h3>
        <p className="mb-3 text-sm text-gray-500">
          상세 설명 아래에 순서대로 세로로 노출됩니다. 드래그하여 순서를 변경할 수 있습니다. (최대 20장)
        </p>
        <ImageUpload
          images={subImages}
          onChange={setSubImages}
          maxImages={MAX_SUB_IMAGES}
        />
        {subImages.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-xs text-gray-500">드래그하여 순서 변경</p>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleSubImagesDragEnd}
            >
              <SortableContext
                items={subImages.map((_, i) => String(i))}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {subImages.map((img, idx) => (
                    <SortableSubImageItem
                      key={`${img.image_url}-${idx}`}
                      id={String(idx)}
                      image={img}
                      onRemove={() => setSubImages(subImages.filter((_, i) => i !== idx))}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        )}
      </Card>

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="secondary"
          onClick={() => navigate('/products')}
        >
          취소
        </Button>
        <Button type="submit" loading={isSubmitting}>
          {isEdit ? '수정하기' : '등록하기'}
        </Button>
      </div>
    </form>
  );
}
