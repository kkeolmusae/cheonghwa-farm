import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  getJournal,
  createJournal,
  updateJournal,
  journalKeys,
} from '@/api/journals';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { RichTextEditor } from '@/components/ui/RichTextEditor';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';

const journalSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요'),
  content: z.string().refine(
    (v) => v.replace(/<[^>]*>/g, '').trim().length > 0,
    { message: '내용을 입력해주세요' },
  ),
  created_at: z.string().optional(),
});

type JournalFormData = z.infer<typeof journalSchema>;

function todayLocalISO(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export default function JournalFormPage() {
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
  } = useForm<JournalFormData>({
    resolver: zodResolver(journalSchema),
  });

  const { data: existingJournal, isLoading } = useQuery({
    queryKey: journalKeys.detail(id!),
    queryFn: () => getJournal(id!),
    enabled: isEdit,
  });

  useEffect(() => {
    if (existingJournal) {
      reset({
        title: existingJournal.title,
        content: existingJournal.content,
        created_at: existingJournal.created_at.slice(0, 10),
      });
    }
  }, [existingJournal, reset]);

  const buildPayload = (data: JournalFormData) => ({
    title: data.title,
    content: data.content,
    ...(data.created_at ? { created_at: new Date(data.created_at + 'T00:00:00').toISOString() } : {}),
  });

  const createMutation = useMutation({
    mutationFn: (data: JournalFormData) => createJournal(buildPayload(data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: journalKeys.lists() });
      toast.success('일지가 등록되었습니다.');
      navigate('/journals');
    },
    onError: () => {
      toast.error('일지 등록에 실패했습니다.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: JournalFormData) => updateJournal(id!, buildPayload(data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: journalKeys.lists() });
      queryClient.invalidateQueries({ queryKey: journalKeys.detail(id!) });
      toast.success('일지가 수정되었습니다.');
      navigate('/journals');
    },
    onError: () => {
      toast.error('일지 수정에 실패했습니다.');
    },
  });

  const onSubmit = (data: JournalFormData) => {
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
        <h3 className="mb-4 text-base font-semibold text-gray-900">일지 내용</h3>
        <div className="space-y-4">
          <Input
            label="제목"
            placeholder="일지 제목을 입력하세요"
            error={errors.title?.message}
            {...register('title')}
          />
          <div>
            <label className="label">작성일자</label>
            <input
              type="date"
              className="input"
              max={todayLocalISO()}
              {...register('created_at')}
            />
            <p className="mt-1 text-xs text-gray-400">비워두면 오늘 날짜로 자동 등록됩니다.</p>
          </div>
          <Controller
            name="content"
            control={control}
            render={({ field }) => (
              <RichTextEditor
                label="내용"
                value={field.value ?? ''}
                onChange={field.onChange}
                placeholder="농장일지 내용을 작성해주세요"
                error={errors.content?.message}
              />
            )}
          />
        </div>
      </Card>

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="secondary"
          onClick={() => navigate('/journals')}
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
