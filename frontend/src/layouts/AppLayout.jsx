import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import useAuthStore from '../store/authStore';
import { logoutApi } from '../services/api';
import WakeUpBanner from '../components/WakeUpBanner';
import {
  LayoutDashboard, Building2, Users, FileText, Settings, LogOut, Menu, X, Home
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Tổng quan' },
  { to: '/rooms', icon: Building2, label: 'Phòng trọ' },
  { to: '/tenants', icon: Users, label: 'Khách thuê' },
  { to: '/invoices', icon: FileText, label: 'Hóa đơn' },
  { to: '/settings', icon: Settings, label: 'Cài đặt' },
];

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout, refreshToken } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try { await logoutApi({ refreshToken }); } catch {}
    logout();
    navigate('/login');
  };

  const NavItems = () => (
    <>
      {navItems.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          onClick={() => setSidebarOpen(false)}
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
              isActive
                ? 'bg-cobalt-royal text-white shadow-[0_8px_20px_rgba(0,82,204,0.15)] scale-[1.02]'
                : 'text-slate-500 hover:bg-[#E8F5E9]/50 hover:text-[#2E7D32] hover:translate-x-0.5'
            }`
          }
        >
          <Icon size={18} />
          {label}
        </NavLink>
      ))}
    </>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <WakeUpBanner />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-[#FCFAF6] border-r border-emerald-100/30 flex flex-col transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-emerald-100/20">
          <div className="bg-[#E8F5E9] text-[#2E7D32] rounded-xl p-2.5 transform hover:rotate-12 hover:scale-105 transition-all duration-300">
            <Home size={18} className="text-[#2E7D32]" />
          </div>
          <div>
            <h1 className="font-bold text-base text-slate-800 leading-tight tracking-wide flex items-center gap-1">
              Quản Lý <span className="text-[#2E7D32] text-xs font-extrabold bg-[#E8F5E9] px-1.5 py-0.5 rounded-md">PRO</span>
            </h1>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Nhà Trọ 🌿</p>
          </div>
          <button className="ml-auto lg:hidden text-slate-400 hover:text-slate-600" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          <NavItems />
        </nav>

        {/* User info */}
        <div className="p-4 border-t border-emerald-100/20 bg-[#F7F5F0]/50">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full px-3 py-2.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100/80 rounded-xl transition-all duration-300 active:scale-[0.98]"
          >
            <LogOut size={14} />
            Đăng xuất hệ thống
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center gap-4 px-4 py-3 border-b bg-card">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu size={22} />
          </button>
          <h1 className="font-semibold">Quản Lý Nhà Trọ</h1>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
