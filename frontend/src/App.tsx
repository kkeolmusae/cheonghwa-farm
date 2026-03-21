import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { PageSkeleton } from '@/components/ui/PageSkeleton';

const HomePage = lazy(() => import('@/pages/HomePage'));
const AboutPage = lazy(() => import('@/pages/AboutPage'));
const ProductListPage = lazy(() => import('@/pages/ProductListPage'));
const ProductDetailPage = lazy(() => import('@/pages/ProductDetailPage'));
const JournalListPage = lazy(() => import('@/pages/JournalListPage'));
const JournalDetailPage = lazy(() => import('@/pages/JournalDetailPage'));
const NoticeListPage = lazy(() => import('@/pages/NoticeListPage'));
const NoticeDetailPage = lazy(() => import('@/pages/NoticeDetailPage'));

export default function App() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="products" element={<ProductListPage />} />
          <Route path="products/:id" element={<ProductDetailPage />} />
          <Route path="journals" element={<JournalListPage />} />
          <Route path="journals/:id" element={<JournalDetailPage />} />
          <Route path="notices" element={<NoticeListPage />} />
          <Route path="notices/:id" element={<NoticeDetailPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
