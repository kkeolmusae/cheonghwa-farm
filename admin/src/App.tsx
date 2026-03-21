import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { AuthGuard } from '@/components/layout/AuthGuard';

const LoginPage = lazy(() => import('@/pages/LoginPage'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const ProductListPage = lazy(() => import('@/pages/ProductListPage'));
const ProductFormPage = lazy(() => import('@/pages/ProductFormPage'));
const JournalListPage = lazy(() => import('@/pages/JournalListPage'));
const JournalFormPage = lazy(() => import('@/pages/JournalFormPage'));
const NoticeListPage = lazy(() => import('@/pages/NoticeListPage'));
const NoticeFormPage = lazy(() => import('@/pages/NoticeFormPage'));
const SiteImagesPage = lazy(() => import('@/pages/SiteImagesPage'));

function PageLoader() {
  return (
    <div className="flex h-64 items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
    </div>
  );
}

export function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<AuthGuard />}>
          <Route element={<AdminLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="products" element={<ProductListPage />} />
            <Route path="products/new" element={<ProductFormPage />} />
            <Route path="products/:id/edit" element={<ProductFormPage />} />
            <Route path="journals" element={<JournalListPage />} />
            <Route path="journals/new" element={<JournalFormPage />} />
            <Route path="journals/:id/edit" element={<JournalFormPage />} />
            <Route path="notices" element={<NoticeListPage />} />
            <Route path="notices/new" element={<NoticeFormPage />} />
            <Route path="notices/:id/edit" element={<NoticeFormPage />} />
            <Route path="site-images" element={<SiteImagesPage />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}
