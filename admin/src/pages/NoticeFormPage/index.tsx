import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  getNotice,
  createNotice,
  updateNotice,
  noticeKeys,
} from '@/api/notices';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { RichTextEditor } from '@/components/ui/RichTextEditor';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';

const noticeSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요'),
  content: z.string().refine(
    (v) => v.replace(/<[^>]*>/g, '').trim().length > 0,
    { message: '내용을 입력해주세요' },
  ),
  is_pinned: z.boolean(),
});

type NoticeFormData = z.infer<typeof noticeSchema>;

export default function NoticeFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<NoticeFormData>({
    resolver: zodResolver(noticeSchema),
    defaultValues: {
      is_pinned: false,
    },
  });

  const { data: existingNotice, isLoading } = useQuery({
    queryKey: noticeKeys.detail(id!),
    queryFn: () => getNotice(id!),
    enabled: isEdit,
  });

  useEffect(() => {
    if (existingNotice) {
      reset({
        title: existingNotice.title,
        content: existingNotice.content,
        is_pinned: existingNotice.is_pinned,
      });
    }
  }, [existingNotice, reset]);

  const createMutation = useMutation({
    mutationFn: createNotice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: noticeKeys.lists() });
      toast.success('공지가 등록되었습니다.');
      navigate('/notices');
    },
    onError: () => {
      toast.error('공지 등록에 실패했습니다.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: NoticeFormData) => updateNotice(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: noticeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: noticeKeys.detail(id!) });
      toast.success('공지가 수정되었습니다.');
      navigate('/notices');
    },
    onError: () => {
      toast.error('공지 수정에 실패했습니다.');
    },
  });

  const onSubmit = (data: NoticeFormData) => {
    if (isEdit) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  if (isEdit && isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-3xl space-y-6">
      <Card>
        <h3 className="mb-4 text-base font-semibold text-gray-900">공지사항 내용</h3>
        <div className="space-y-4">
          <Input
            label="제목"
            placeholder="공지 제목을 입력하세요"
            error={errors.title?.message}
            {...register('title')}
          />
          <Controller
            name="content"
            control={control}
            render={({ field }) => (
              <RichTextEditor
                label="내용"
                value={field.value ?? ''}
                onChange={field.onChange}
                placeholder="공지 내용을 작성해주세요"
                error={errors.content?.message}
              />
            )}
          />
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_pinned"
              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              {...register('is_pinned')}
            />
            <label htmlFor="is_pinned" className="text-sm font-medium text-gray-700">
              상단 고정
            </label>
          </div>
        </div>
      </Card>

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="secondary"
          onClick={() => navigate('/notices')}
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
