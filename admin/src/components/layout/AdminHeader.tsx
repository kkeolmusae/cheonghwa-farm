import { Menu } from 'lucide-react';

interface AdminHeaderProps {
  onMenuToggle: () => void;
  title: string;
}

export function AdminHeader({ onMenuToggle, title }: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-gray-200 bg-white px-4 lg:px-6">
      <button
        onClick={onMenuToggle}
        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
        aria-label="메뉴 열기"
      >
        <Menu className="h-5 w-5" />
      </button>

      <h1 className="text-lg font-semibold text-gray-900">{title}</h1>

      <div className="ml-auto flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700">
          A
        </div>
        <span className="hidden text-sm font-medium text-gray-700 sm:block">
          관리자
        </span>
      </div>
    </header>
  );
}
