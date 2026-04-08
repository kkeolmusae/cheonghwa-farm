import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2, Plus, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiClient } from '@/api/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface AllowedEmail {
  id: number;
  email: string;
  created_at: string;
}

async function fetchAllowedEmails(): Promise<AllowedEmail[]> {
  const res = await apiClient.get('/admin/settings/google-emails');
  return res.data;
}

async function addAllowedEmail(email: string): Promise<AllowedEmail> {
  const res = await apiClient.post('/admin/settings/google-emails', { email });
  return res.data;
}

async function deleteAllowedEmail(email: string): Promise<void> {
  await apiClient.delete(`/admin/settings/google-emails/${encodeURIComponent(email)}`);
}

const QUERY_KEY = ['settings', 'google-emails'] as const;

export default function SettingsPage() {
  const qc = useQueryClient();
  const [newEmail, setNewEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  const { data: emails = [], isLoading } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchAllowedEmails,
  });

  const addMutation = useMutation({
    mutationFn: addAllowedEmail,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      setNewEmail('');
      toast.success('이메일이 추가되었습니다.');
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.detail ?? '추가에 실패했습니다.';
      toast.error(msg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAllowedEmail,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success('이메일이 삭제되었습니다.');
    },
    onError: () => toast.error('삭제에 실패했습니다.'),
  });

  function handleAdd() {
    const trimmed = newEmail.trim();
    if (!trimmed) {
      setEmailError('이메일을 입력해주세요.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setEmailError('올바른 이메일 형식이 아닙니다.');
      return;
    }
    setEmailError('');
    addMutation.mutate(trimmed);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">접근 설정</h1>
        <p className="mt-1 text-sm text-gray-500">Google 로그인이 허용된 계정을 관리합니다.</p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="font-semibold text-gray-800">허용된 Google 계정</h2>
        </div>

        {/* 추가 폼 */}
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="추가할 Google 이메일 주소"
                value={newEmail}
                onChange={(e) => {
                  setNewEmail(e.target.value);
                  setEmailError('');
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                error={emailError}
              />
            </div>
            <Button
              onClick={handleAdd}
              loading={addMutation.isPending}
              className="shrink-0 self-start"
            >
              <Plus className="h-4 w-4" />
              추가
            </Button>
          </div>
        </div>

        {/* 목록 */}
        {isLoading ? (
          <div className="px-6 py-8 text-center text-sm text-gray-400">불러오는 중...</div>
        ) : emails.length === 0 ? (
          <div className="px-6 py-8 text-center text-sm text-gray-400">등록된 계정이 없습니다.</div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {emails.map((item) => (
              <li key={item.id} className="flex items-center justify-between px-6 py-3.5">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100">
                    <Mail className="h-4 w-4 text-primary-600" />
                  </div>
                  <span className="text-sm text-gray-900">{item.email}</span>
                </div>
                <button
                  onClick={() => deleteMutation.mutate(item.email)}
                  disabled={deleteMutation.isPending}
                  className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                  aria-label="삭제"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
