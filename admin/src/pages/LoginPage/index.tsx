import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Sprout } from 'lucide-react';
import { login } from '@/api/auth';
import { useAuthStore } from '@/store/authStore';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

const loginSchema = z.object({
  email: z.string().min(1, '이메일을 입력해주세요').email('올바른 이메일 형식이 아닙니다'),
  password: z.string().min(1, '비밀번호를 입력해주세요'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const authLogin = useAuthStore((s) => s.login);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const mutation = useMutation({
    mutationFn: (data: LoginForm) => login(data),
    onSuccess: (tokens) => {
      authLogin(tokens);
      toast.success('로그인되었습니다.');
      navigate('/', { replace: true });
    },
    onError: () => {
      toast.error('이메일 또는 비밀번호가 올바르지 않습니다.');
    },
  });

  const onSubmit = (data: LoginForm) => {
    mutation.mutate(data);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 px-4">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl bg-white p-8 shadow-2xl">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-100">
              <Sprout className="h-8 w-8 text-primary-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">농장 관리자</h1>
            <p className="mt-1 text-sm text-gray-500">관리자 계정으로 로그인해주세요</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="이메일"
              type="email"
              placeholder="admin@farm.com"
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="비밀번호"
              type="password"
              placeholder="비밀번호를 입력하세요"
              error={errors.password?.message}
              {...register('password')}
            />
            <Button
              type="submit"
              className="w-full"
              size="lg"
              loading={mutation.isPending}
            >
              로그인
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
