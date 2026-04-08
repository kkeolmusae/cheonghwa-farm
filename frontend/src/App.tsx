import { lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';

const HomePage = lazy(() => import('@/pages/HomePage'));
const AboutPage = lazy(() => import('@/pages/AboutPage'));
const ProductListPage = lazy(() => import('@/pages/ProductListPage'));
const ProductDetailPage = lazy(() => import('@/pages/ProductDetailPage'));
const JournalListPage = lazy(() => import('@/pages/JournalListPage'));
const JournalDetailPage = lazy(() => import('@/pages/JournalDetailPage'));
const NoticeListPage = lazy(() => import('@/pages/NoticeListPage'));
const NoticeDetailPage = lazy(() => import('@/pages/NoticeDetailPage'));
const OrderStatusPage = lazy(() => import('@/pages/OrderStatusPage'));

export default function App() {
  return (
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
        <Route path="order/status" element={<OrderStatusPage />} />
      </Route>
    </Routes>
  );
}
