import { Suspense, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { AdminHeader } from './AdminHeader';

const pageTitles: Record<string, string> = {
  '/': '대시보드',
  '/products': '상품 관리',
  '/categories': '카테고리 관리',
  '/products/new': '상품 등록',
  '/orders': '주문 관리',
  '/journals': '농장일지',
  '/journals/new': '일지 작성',
  '/notices': '공지사항',
  '/notices/new': '공지 작성',
};

function getPageTitle(pathname: string): string {
  if (pageTitles[pathname]) return pageTitles[pathname];
  if (/\/products\/[^/]+\/edit/.test(pathname)) return '상품 수정';
  if (/\/journals\/[^/]+\/edit/.test(pathname)) return '일지 수정';
  if (/\/notices\/[^/]+\/edit/.test(pathname)) return '공지 수정';
  if (/\/orders\/[^/]+/.test(pathname)) return '주문 상세';
  return '관리자';
}

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const title = getPageTitle(location.pathname);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:pl-64">
        <AdminHeader
          onMenuToggle={() => setSidebarOpen(true)}
          title={title}
        />
        <main className="p-4 lg:p-6">
          <Suspense fallback={
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
            </div>
          }>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
