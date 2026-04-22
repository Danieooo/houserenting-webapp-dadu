import { useQuery } from '@tanstack/react-query';
import { getDashboardSummaryApi, getUnpaidInvoicesApi, getExpiringTenantsApi, getRevenueChartApi, getOccupancyChartApi } from '../services/api';
import { formatCurrency, formatDate } from '../lib/utils';
import { Link } from 'react-router-dom';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Building2, Users, TrendingUp, AlertCircle, Calendar, ArrowRight } from 'lucide-react';

function StatCard({ title, value, subtitle, icon: Icon, color }) {
  return (
    <div className="bg-white rounded-xl border p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon size={20} className="text-white" />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data: summaryRes } = useQuery({ queryKey: ['dashboard-summary'], queryFn: getDashboardSummaryApi });
  const { data: unpaidRes } = useQuery({ queryKey: ['dashboard-unpaid'], queryFn: getUnpaidInvoicesApi });
  const { data: expiringRes } = useQuery({ queryKey: ['dashboard-expiring'], queryFn: getExpiringTenantsApi });
  const { data: revenueRes } = useQuery({ queryKey: ['dashboard-revenue'], queryFn: getRevenueChartApi });
  const { data: occupancyRes } = useQuery({ queryKey: ['dashboard-occupancy'], queryFn: getOccupancyChartApi });

  const summary = summaryRes?.data?.data || {};
  const unpaid = unpaidRes?.data?.data || [];
  const expiring = expiringRes?.data?.data || [];
  const revenueData = revenueRes?.data?.data || [];
  const occupancyData = occupancyRes?.data?.data || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tổng quan</h1>
        <p className="text-muted-foreground text-sm mt-1">Tháng {summary.month}/{summary.year}</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Doanh thu tháng này"
          value={formatCurrency(summary.revenue || 0)}
          subtitle="Từ hóa đơn đã thu"
          icon={TrendingUp}
          color="bg-green-500"
        />
        <StatCard
          title="Phòng có người"
          value={`${summary.occupied || 0} / ${summary.totalRooms || 0}`}
          subtitle={`${summary.available || 0} phòng trống`}
          icon={Building2}
          color="bg-blue-500"
        />
        <StatCard
          title="Chưa thu tiền"
          value={unpaid.length}
          subtitle="Hóa đơn tháng này"
          icon={AlertCircle}
          color="bg-orange-500"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border p-6 shadow-sm">
          <h2 className="font-semibold mb-4">Doanh thu 6 tháng gần nhất</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={(v) => `${(v/1000000).toFixed(1)}M`} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => formatCurrency(v)} />
              <Bar dataKey="revenue" fill="hsl(221.2 83.2% 53.3%)" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border p-6 shadow-sm">
          <h2 className="font-semibold mb-4">Tỷ lệ lấp đầy 6 tháng gần nhất</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={occupancyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => `${v}%`} />
              <Line type="monotone" dataKey="rate" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Alert lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Unpaid invoices */}
        <div className="bg-white rounded-xl border p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center gap-2">
              <AlertCircle size={16} className="text-orange-500" />
              Chưa thu tiền ({unpaid.length})
            </h2>
            <Link to="/invoices?paid=false" className="text-xs text-primary flex items-center gap-1 hover:underline">
              Xem tất cả <ArrowRight size={12} />
            </Link>
          </div>
          {unpaid.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">✅ Tất cả đã thu tiền!</p>
          ) : (
            <div className="space-y-2">
              {unpaid.slice(0, 5).map((inv) => (
                <Link key={inv.id} to={`/invoices/${inv.id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 border transition-colors">
                  <div>
                    <p className="text-sm font-medium">{inv.room.name}</p>
                    <p className="text-xs text-muted-foreground">{inv.tenant.name}</p>
                  </div>
                  <span className="text-sm font-semibold text-orange-600">{formatCurrency(inv.totalAmount)}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Expiring contracts */}
        <div className="bg-white rounded-xl border p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center gap-2">
              <Calendar size={16} className="text-red-500" />
              Hợp đồng sắp hết ({expiring.length})
            </h2>
          </div>
          {expiring.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">✅ Không có hợp đồng sắp hết!</p>
          ) : (
            <div className="space-y-2">
              {expiring.slice(0, 5).map((tenant) => (
                <Link key={tenant.id} to={`/tenants/${tenant.id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 border transition-colors">
                  <div>
                    <p className="text-sm font-medium">{tenant.name}</p>
                    <p className="text-xs text-muted-foreground">{tenant.room?.name}</p>
                  </div>
                  <span className="text-xs text-red-600 font-medium">Hết hạn {formatDate(tenant.moveOutDate)}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
