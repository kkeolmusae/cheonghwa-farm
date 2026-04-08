import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Sprout } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { login, googleLogin } from '@/api/auth';
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

  const googleMutation = useMutation({
    mutationFn: (credential: string) => googleLogin(credential),
    onSuccess: (tokens) => {
      authLogin(tokens);
      toast.success('Google 계정으로 로그인되었습니다.');
      navigate('/', { replace: true });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.detail ?? '접근이 허용되지 않은 Google 계정입니다.';
      toast.error(msg);
    },
  });

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: (response) => {
      // implicit flow: access_token 반환 → 백엔드에서 userinfo로 검증
      // credential flow(one-tap)와 달리 access_token 사용
      googleMutation.mutate(response.access_token);
    },
    onError: () => {
      toast.error('Google 로그인에 실패했습니다.');
    },
    flow: 'implicit',
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

          {/* Google 로그인 */}
          <button
            type="button"
            onClick={() => handleGoogleLogin()}
            disabled={googleMutation.isPending}
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {googleMutation.isPending ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
            Google 계정으로 로그인
          </button>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-2 text-gray-400">또는</span>
            </div>
          </div>

          {/* 이메일/비밀번호 로그인 */}
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
