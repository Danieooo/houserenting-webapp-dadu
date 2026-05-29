import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { loginApi } from '../services/api';
import useAuthStore from '../store/authStore';
import { Home, Lock, Mail } from 'lucide-react';

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
    <div className="min-h-screen flex items-center justify-center bg-slate-50/50 relative overflow-hidden p-4">
      {/* Soft atmospheric gradient blobs */}
      <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/10 blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-violet-400/10 blur-3xl animate-pulse" style={{ animationDuration: '12s' }} />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-tr from-primary to-indigo-600 rounded-2xl mb-4 shadow-lg shadow-primary/20">
            <Home size={30} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Quản Lý Nhà Trọ</h1>
          <p className="text-gray-500 mt-2 text-sm">Hệ thống quản lý vận hành chuyên nghiệp</p>
        </div>

        {/* Card */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-white/60 shadow-xl shadow-slate-200/50 p-8">
          <form onSubmit={handleSubmit(mutate)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  placeholder="admin@test.com"
                  {...register('email')}
                  data-testid="login-email"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 outline-none"
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Mật khẩu</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...register('password')}
                  data-testid="login-password"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 outline-none"
                />
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isPending}
              data-testid="login-submit"
              className="w-full bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/95 hover:to-indigo-600/95 shadow-md shadow-primary/10 text-white py-2.5 rounded-lg text-sm font-medium disabled:opacity-60 transition-all duration-300 transform active:scale-[0.98]"
            >
              {isPending ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>

          <div className="mt-6 p-4 bg-gray-50/80 rounded-lg text-xs text-gray-500 border border-gray-100">
            <p className="font-semibold mb-1 text-gray-700">Tài khoản demo:</p>
            <p>Email: <code className="bg-gray-200/50 px-1.5 py-0.5 rounded font-mono text-gray-800">admin@test.com</code></p>
            <p className="mt-1">Mật khẩu: <code className="bg-gray-200/50 px-1.5 py-0.5 rounded font-mono text-gray-800">password123</code></p>
          </div>
        </div>
      </div>
    </div>
  );
}
