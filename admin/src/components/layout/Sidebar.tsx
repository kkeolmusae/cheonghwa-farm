import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  BookOpen,
  Megaphone,
  LogOut,
  X,
  Sprout,
  ImageIcon,
  Package,
  Settings,
  Tag,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/utils/cn';

const navItems = [
  { to: '/', label: '대시보드', icon: LayoutDashboard, end: true },
  { to: '/products', label: '상품 관리', icon: ShoppingBag, end: false },
  { to: '/categories', label: '카테고리 관리', icon: Tag, end: false },
  { to: '/orders', label: '주문 관리', icon: Package, end: false },
  { to: '/journals', label: '농장일지', icon: BookOpen, end: false },
  { to: '/notices', label: '공지사항', icon: Megaphone, end: false },
  { to: '/site-images', label: '메인 이미지', icon: ImageIcon, end: false },
  { to: '/settings', label: '접근 설정', icon: Settings, end: false },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-gray-900 transition-transform duration-200 lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <Sprout className="h-7 w-7 text-primary-400" />
            <span className="text-lg font-bold text-white">농장 관리자</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:text-white lg:hidden"
            aria-label="메뉴 닫기"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4 scrollbar-thin">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary-600/20 text-primary-400'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white',
                )
              }
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-gray-800 p-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-800 hover:text-white"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            로그아웃
          </button>
        </div>
      </aside>
    </>
  );
}
