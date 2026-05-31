import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { loginApi } from '../services/api';
import useAuthStore from '../store/authStore';
import { Home, Lock, Mail } from 'lucide-react';
import loginBanner from '../assets/login_banner.png';

const schema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
});

export default function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  const { mutate, isPending } = useMutation({
    mutationFn: (data) => loginApi(data),
    onSuccess: (res) => {
      setAuth(res.data.accessToken, res.data.refreshToken, res.data.user);
      navigate('/dashboard');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Đăng nhập thất bại'),
  });

  return (
    <div className="min-h-screen flex bg-cream-warm w-full">
      {/* Left Column - Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 lg:w-1/2 relative overflow-hidden bg-cream-warm">
        {/* Decorative soft gradient background blobs */}
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-emerald-100/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 right-0 w-96 h-96 rounded-full bg-amber-100/10 blur-3xl pointer-events-none" />
        
        {/* Elegant floating leaf SVG ornament in the background */}
        <div className="absolute top-10 right-10 opacity-[0.05] text-[#2E7D32] pointer-events-none select-none hidden sm:block">
          <svg width="140" height="140" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M2 22c0 0 6-6 10-10C16 8 22 2 22 2" />
            <path d="M12 12c-3 2-6 1-10 10" />
            <path d="M12 12c2-3 1-6 10-10" />
          </svg>
        </div>

        <div className="w-full max-w-md relative z-10 space-y-8">
          {/* Logo & Heading */}
          <div className="text-left space-y-3">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-[#E8F5E9] text-[#2E7D32] rounded-2xl shadow-[0_8px_30px_rgba(46,125,50,0.15)] border border-emerald-100/50">
              <Home size={26} className="text-[#2E7D32]" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Quản Lý Nhà Trọ 🌿</h1>
              <p className="text-slate-400 text-sm mt-1 font-medium">Hệ thống vận hành an lành và cao cấp chuyên nghiệp</p>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-emerald-100/20 shadow-[0_20px_50px_rgba(46,125,50,0.02)] p-8 w-full relative overflow-hidden">
            {/* Elegant leaf SVG corner watermark in form card */}
            <div className="absolute -right-3 -bottom-3 opacity-[0.03] text-[#2E7D32] pointer-events-none select-none">
              <svg width="90" height="90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                <path d="M2 22c0 0 6-6 10-10C16 8 22 2 22 2" />
                <path d="M12 12c-3 2-6 1-10 10" />
                <path d="M12 12c2-3 1-6 10-10" />
              </svg>
            </div>
            <form onSubmit={handleSubmit(mutate)} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Email đăng nhập</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="email"
                    type="email"
                    placeholder="admin@test.com"
                    {...register('email')}
                    data-testid="login-email"
                    className="w-full pl-11 pr-4 py-3 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-50 focus:border-[#2E7D32] transition-all duration-200 outline-none font-medium bg-slate-50/50"
                  />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Mật khẩu</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    {...register('password')}
                    data-testid="login-password"
                    className="w-full pl-11 pr-4 py-3 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-50 focus:border-[#2E7D32] transition-all duration-200 outline-none font-medium bg-slate-50/50"
                  />
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isPending}
                data-testid="login-submit"
                className="w-full bg-[#2E7D32] hover:bg-[#2E7D32]/95 hover:shadow-[0_8px_30px_rgba(46,125,50,0.25)] text-white py-3.5 rounded-xl text-sm font-bold disabled:opacity-60 transition-all duration-300 transform active:scale-[0.98] shadow-md"
              >
                {isPending ? 'Đang xác thực...' : 'Đăng nhập vào hệ thống 🌿'}
              </button>
            </form>

            <div className="mt-8 p-5 bg-[#FCFAF6] border border-emerald-100/20 rounded-2xl">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Tài khoản trải nghiệm</p>
              <div className="space-y-1 text-xs text-slate-600 font-medium">
                <p>Email: <code className="bg-white px-2 py-0.5 rounded border font-mono text-[#2E7D32] border-emerald-100">admin@test.com</code></p>
                <p className="pt-0.5">Mật khẩu: <code className="bg-white px-2 py-0.5 rounded border font-mono text-[#2E7D32] border-emerald-100">password123</code></p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Illustration Banner (Desktop Only) */}
      <div className="hidden lg:block lg:w-1/2 relative bg-[#FCFAF6] overflow-hidden border-l border-emerald-100/30">
        {/* Radial decorative highlights */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-emerald-100/40 via-transparent to-transparent z-0" />
        <div className="absolute top-1/4 -right-20 w-96 h-96 rounded-full bg-emerald-50/10 blur-3xl pointer-events-none" />
        
        {/* High-end decorative grid pattern */}
        <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:24px_24px] z-0" />

        {/* Center illustration container */}
        <div className="absolute inset-0 flex flex-col justify-center items-center p-12 z-10">
          <div className="w-full max-w-lg aspect-video rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(46,125,50,0.06)] border border-emerald-100/30 transform hover:scale-[1.01] hover:-translate-y-0.5 transition-all duration-500 bg-white relative">
            {/* SVG Leaves inside the banner frame for premium ornament feel */}
            <div className="absolute top-3 left-3 text-[#2E7D32]/30 w-8 h-8 pointer-events-none select-none z-10">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2 22C2 22 8 16 12 12C16 8 22 2 22 2" />
                <path d="M12 12Q9 14 6 13T2 22" />
                <path d="M12 12Q14 9 13 6T22 2" />
              </svg>
            </div>
            <img src={loginBanner} alt="Premium Platform Illustration" className="w-full h-full object-cover" />
          </div>
          <div className="mt-8 text-center space-y-2 max-w-md">
            <h2 className="text-xl font-bold text-slate-800">Quản lý trọn vẹn và an tâm 🌿</h2>
            <p className="text-sm text-slate-500 font-medium">
              Vận hành các dịch vụ, theo dõi dòng tiền thanh toán và hóa đơn thông minh VietQR chuẩn Napas 24/7 chỉ trên một nền tảng duy nhất.
            </p>
          </div>
        </div>
      </div>
    </div>

  );
}
