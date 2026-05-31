import { useQuery } from '@tanstack/react-query';
import { getDashboardSummaryApi, getUnpaidInvoicesApi, getExpiringTenantsApi, getRevenueChartApi, getOccupancyChartApi } from '../services/api';
import { formatCurrency, formatDate } from '../lib/utils';
import { Link } from 'react-router-dom';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Building2, Users, TrendingUp, AlertCircle, Calendar, ArrowRight } from 'lucide-react';
import { SkeletonDashboard } from '../components/Skeleton';
import floriaBanner from '../assets/floria_banner.png';

function StatCard({ title, value, subtitle, icon: Icon, bgLight, iconColor, accentColor, hoverShadowClass }) {
  return (
    <div className={`bg-white rounded-[24px] border border-emerald-100/30 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.015)] ${hoverShadowClass} hover:-translate-y-1 hover:border-emerald-200/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer ease-out flex flex-col justify-between h-full min-h-[140px] relative overflow-hidden group`}>
      {/* Decorative leaf watermarks inside the card background */}
      <div className="absolute -right-4 -bottom-4 opacity-[0.02] text-slate-800 pointer-events-none group-hover:scale-110 transition-transform duration-500 select-none">
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
          <path d="M12 2C6.5 2 2 6.5 2 12c0 2.8 1.1 5.3 3 7.1V22l3-2.2c1.2.6 2.5 1 4 1 5.5 0 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8z" />
          <path d="M12 6c-3.3 0-6 2.7-6 6h12c0-3.3-2.7-6-6-6z" />
        </svg>
      </div>

      <div className="flex items-start justify-between relative z-10">
        <div className="space-y-1">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-extrabold mt-1 tracking-tight text-slate-800">{value}</p>
        </div>
        <div className={`p-3.5 rounded-2xl bg-gradient-to-br ${bgLight} shadow-sm border border-white/50 text-slate-800`}>
          <Icon size={20} className={`${iconColor}`} />
        </div>
      </div>
      
      {subtitle && (
        <div className="mt-4 pt-3 border-t border-slate-50 flex items-center gap-1.5 relative z-10">
          <span className={`w-1.5 h-1.5 rounded-full ${accentColor}`} />
          <p className="text-xs text-slate-500 font-semibold">{subtitle}</p>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { data: summaryRes, isLoading: loadingSummary } = useQuery({ queryKey: ['dashboard-summary'], queryFn: getDashboardSummaryApi });
  const { data: unpaidRes, isLoading: loadingUnpaid } = useQuery({ queryKey: ['dashboard-unpaid'], queryFn: getUnpaidInvoicesApi });
  const { data: expiringRes, isLoading: loadingExpiring } = useQuery({ queryKey: ['dashboard-expiring'], queryFn: getExpiringTenantsApi });
  const { data: revenueRes, isLoading: loadingRevenue } = useQuery({ queryKey: ['dashboard-revenue'], queryFn: getRevenueChartApi });
  const { data: occupancyRes, isLoading: loadingOccupancy } = useQuery({ queryKey: ['dashboard-occupancy'], queryFn: getOccupancyChartApi });

  const summary = summaryRes?.data?.data || {};
  const unpaid = unpaidRes?.data?.data || [];
  const expiring = expiringRes?.data?.data || [];
  const revenueData = revenueRes?.data?.data || [];
  const occupancyData = occupancyRes?.data?.data || [];

  const isLoading = loadingSummary || loadingUnpaid || loadingExpiring || loadingRevenue || loadingOccupancy;

  if (isLoading) return <SkeletonDashboard />;

  return (
    <div className="space-y-6">
      {/* Botanic Welcome Hero Card */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#FDFBF7] via-[#F5F2EB] to-[#E8F5E9]/50 border border-emerald-100/50 p-8 sm:p-10 shadow-[0_15px_45px_rgba(46,125,50,0.04)] hover:shadow-[0_20px_50px_rgba(46,125,50,0.1)] transition-all duration-500 group min-h-[300px] flex items-center">
        {/* The premium background image with horizontal/vertical fading gradient overlay */}
        <div className="absolute right-0 top-0 bottom-0 w-full sm:w-1/2 md:w-3/5 opacity-40 sm:opacity-75 pointer-events-none z-0 overflow-hidden select-none">
          <img src={floriaBanner} alt="Botanic Atmosphere" className="w-full h-full object-cover object-right transform group-hover:scale-105 transition-transform ease-out" style={{ transitionDuration: '2000ms' }} />
          {/* High-quality warm cream gradients to blend the image seamlessly into the light background */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#FDFBF7] via-[#FDFBF7]/85 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#F5F2EB] via-transparent to-transparent" />
        </div>

        <div className="relative z-10 space-y-6 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#E8F5E9] text-[#2E7D32] rounded-full text-[10px] font-extrabold uppercase tracking-widest border border-emerald-200/50 backdrop-blur-sm">
            <span className="animate-pulse">🌿</span> Studio & Platform
          </div>
          
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light text-slate-800 tracking-tight leading-none">
              Botanic <br />
              <span className="italic font-serif font-semibold bg-gradient-to-r from-[#2E7D32] to-[#1B5E20] bg-clip-text text-transparent">Management.</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed max-w-md pt-2">
              Hệ thống vận hành an lành và trọn vẹn. Chúc bạn có một ngày làm việc tràn đầy năng lượng tích cực, quản lý trọ suôn sẻ và gặt hái nhiều kết quả tốt đẹp.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link to="/rooms" className="px-6 py-3 bg-[#2E7D32] text-white hover:bg-[#1B5E20] hover:shadow-[0_8px_20px_rgba(46,125,50,0.15)] active:scale-[0.97] transition-all duration-300 rounded-full text-xs font-bold tracking-wider uppercase">
              Quản lý phòng trọ
            </Link>
            <Link to="/invoices" className="px-6 py-3 border border-[#2E7D32]/30 hover:border-[#2E7D32] text-[#2E7D32] hover:bg-[#E8F5E9]/20 active:scale-[0.97] transition-all duration-300 rounded-full text-xs font-bold tracking-wider uppercase">
              Hóa đơn tháng này
            </Link>
          </div>
          
          <div className="pt-2 flex items-center gap-3 text-[10px] font-extrabold uppercase tracking-widest text-[#2E7D32]/80">
            <span>Tháng {summary.month} / {summary.year}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32]" />
            <span>Trực quan & Đáng tin cậy</span>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Doanh thu tháng này"
          value={formatCurrency(summary.revenue || 0)}
          subtitle="Từ hóa đơn đã thu"
          icon={TrendingUp}
          bgLight="from-[#E8F5E9] to-[#C8E6C9]"
          iconColor="text-[#2E7D32]"
          accentColor="bg-[#2E7D32]"
          hoverShadowClass="hover:shadow-[0_15px_40px_rgba(46,125,50,0.08)] hover:shadow-emerald-100"
        />
        <StatCard
          title="Phòng có người"
          value={`${summary.occupied || 0} / ${summary.totalRooms || 0}`}
          subtitle={`${summary.available || 0} phòng trống`}
          icon={Building2}
          bgLight="from-[#E3F2FD] to-[#BBDEFB]"
          iconColor="text-cobalt-royal"
          accentColor="bg-cobalt-royal"
          hoverShadowClass="hover:shadow-[0_15px_40px_rgba(0,82,204,0.08)] hover:shadow-blue-100"
        />
        <StatCard
          title="Chưa thu tiền"
          value={unpaid.length}
          subtitle="Hóa đơn tháng này"
          icon={AlertCircle}
          bgLight="from-[#FFF3E0] to-[#FFE0B2]"
          iconColor="text-[#E65100]"
          accentColor="bg-[#E65100]"
          hoverShadowClass="hover:shadow-[0_15px_40px_rgba(230,81,0,0.08)] hover:shadow-orange-100"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl border border-emerald-100/20 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.015)] hover:shadow-[0_15px_40px_rgba(0,82,204,0.03)] hover:border-emerald-100/50 hover:scale-[1.002] transition-all duration-300">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-50 pb-3">
            <span className="w-2 h-2 rounded-full bg-cobalt-royal" />
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Doanh thu 6 tháng gần nhất</h2>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={revenueData} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 4" stroke="#F1F3F5" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94A3B8', fontWeight: 600 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => `${(v/1000000).toFixed(1)}M`} tick={{ fontSize: 10, fill: '#94A3B8', fontWeight: 600 }} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '16px', border: '1px solid rgba(0, 82, 204, 0.1)', boxShadow: '0 10px 30px rgba(0,0,0,0.04)' }}
                formatter={(v) => [formatCurrency(v), "Doanh thu"]} 
              />
              <Bar dataKey="revenue" fill="#0052CC" radius={[6,6,0,0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-3xl border border-emerald-100/20 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.015)] hover:shadow-[0_15px_40px_rgba(46,125,50,0.03)] hover:border-emerald-100/50 hover:scale-[1.002] transition-all duration-300">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-50 pb-3">
            <span className="w-2 h-2 rounded-full bg-[#2E7D32]" />
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Tỷ lệ lấp đầy 6 tháng gần nhất</h2>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={occupancyData} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 4" stroke="#F1F3F5" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94A3B8', fontWeight: 600 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 10, fill: '#94A3B8', fontWeight: 600 }} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '16px', border: '1px solid rgba(46, 125, 50, 0.1)', boxShadow: '0 10px 30px rgba(0,0,0,0.04)' }}
                formatter={(v) => [`${v}%`, "Tỷ lệ"]} 
              />
              <Line type="monotone" dataKey="rate" stroke="#2E7D32" strokeWidth={3} dot={{ fill: '#2E7D32', stroke: '#FFFFFF', strokeWidth: 2, r: 5 }} activeDot={{ r: 7 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Alert lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Unpaid invoices */}
        <div className="bg-white rounded-3xl border border-emerald-100/20 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.015)] hover:border-emerald-100/50 hover:shadow-[0_15px_40px_rgba(230,81,0,0.02)] transition-all duration-300">
          <div className="flex items-center justify-between mb-5 border-b border-slate-50 pb-3">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <AlertCircle size={16} className="text-[#E65100]" />
              Chưa thu tiền ({unpaid.length})
            </h2>
            <Link to="/invoices?paid=false" className="text-xs font-bold text-cobalt-royal flex items-center gap-1 hover:text-cobalt-royal/80 hover:underline">
              Xem tất cả <ArrowRight size={12} />
            </Link>
          </div>
          {unpaid.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-emerald-600 bg-emerald-50/30 rounded-2xl border border-emerald-100/50">
              <span className="text-2xl mb-1">🌿</span>
              <p className="text-xs font-bold uppercase tracking-wider">Tất cả đã thu tiền!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {unpaid.slice(0, 5).map((inv) => (
                <Link key={inv.id} to={`/invoices/${inv.id}`} className="flex items-center justify-between p-3.5 rounded-2xl bg-white hover:bg-emerald-50/10 border border-slate-100 hover:border-emerald-100/30 transition-all duration-200 active:scale-[0.99] group">
                  <div>
                    <p className="text-sm font-bold text-slate-700 group-hover:text-[#2E7D32] transition-colors">{inv.room.name}</p>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">{inv.tenant.name}</p>
                  </div>
                  <span className="text-sm font-extrabold text-[#E65100] bg-[#FFF3E0] px-3 py-1 rounded-xl">{formatCurrency(inv.totalAmount)}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Expiring contracts */}
        <div className="bg-white rounded-3xl border border-emerald-100/20 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.015)] hover:border-emerald-100/50 hover:shadow-[0_15px_40px_rgba(46,125,50,0.02)] transition-all duration-300">
          <div className="flex items-center justify-between mb-5 border-b border-slate-50 pb-3">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Calendar size={16} className="text-[#2E7D32]" />
              Hợp đồng sắp hết ({expiring.length})
            </h2>
          </div>
          {expiring.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-[#2E7D32] bg-[#E8F5E9]/20 rounded-2xl border border-emerald-100/40">
              <span className="text-2xl mb-1">🌿</span>
              <p className="text-xs font-bold uppercase tracking-wider">Không có hợp đồng sắp hết!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {expiring.slice(0, 5).map((tenant) => (
                <Link key={tenant.id} to={`/tenants/${tenant.id}`} className="flex items-center justify-between p-3.5 rounded-2xl bg-white hover:bg-emerald-50/10 border border-slate-100 hover:border-emerald-100/30 transition-all duration-200 active:scale-[0.99] group">
                  <div>
                    <p className="text-sm font-bold text-slate-700 group-hover:text-[#2E7D32] transition-colors">{tenant.name}</p>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">{tenant.room?.name}</p>
                  </div>
                  <span className="text-xs text-[#E65100] font-bold bg-[#FFF3E0] px-3 py-1 rounded-xl">Hết hạn {formatDate(tenant.moveOutDate)}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

