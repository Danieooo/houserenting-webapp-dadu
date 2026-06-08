import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getRoomApi } from '../services/api';
import { formatCurrency, formatDate, ROOM_STATUS_LABELS } from '../lib/utils';
import { ArrowLeft, FileText } from 'lucide-react';

import { SkeletonDetail } from '../components/Skeleton';

export default function RoomDetailPage() {
  const { id } = useParams();
  const { data, isLoading } = useQuery({ queryKey: ['room', id], queryFn: () => getRoomApi(id) });
  const room = data?.data?.data;

  if (isLoading) return <SkeletonDetail />;
  if (!room) return <p className="text-muted-foreground">Không tìm thấy phòng.</p>;

  const STATUS_BADGES = {
    AVAILABLE: "inline-block text-xs px-2.5 py-0.5 rounded-full font-semibold bg-emerald-50/80 text-emerald-700 border border-emerald-200/50",
    OCCUPIED: "inline-block text-xs px-2.5 py-0.5 rounded-full font-semibold bg-rose-50/80 text-rose-700 border border-rose-200/50",
    MAINTENANCE: "inline-block text-xs px-2.5 py-0.5 rounded-full font-semibold bg-amber-50/80 text-amber-700 border border-amber-200/50"
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <Link to="/rooms" className="text-slate-400 hover:text-slate-600 active:scale-[0.98] transition-all duration-200"><ArrowLeft size={20} /></Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{room.name}</h1>
            <span className={STATUS_BADGES[room.status] || "inline-block text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 font-semibold"}>
              {ROOM_STATUS_LABELS[room.status]}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Details & Current Tenant */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.01)] space-y-4">
            <h2 className="font-bold text-slate-800 text-base">Thông tin phòng</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Tầng', room.floor || '-'],
                ['Diện tích', room.area ? `${room.area} m²` : '-'],
                ['Giá thuê', formatCurrency(room.baseRent) + '/tháng'],
                ['Giá điện', formatCurrency(room.electricPrice) + '/kWh'],
                ['Giá nước', formatCurrency(room.waterPrice) + '/m³'],
                ['Phí rác', formatCurrency(room.garbageFee) + '/tháng'],
              ].map(([label, value]) => (
                <div key={label} className="bg-slate-50 border border-slate-100/50 rounded-xl p-3 flex flex-col justify-center">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{label}</span>
                  <span className="font-bold text-slate-800 text-sm mt-1">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.01)]">
            <h2 className="font-bold text-slate-800 text-base mb-4">Khách thuê hiện tại</h2>
            {room.tenants?.length === 0 ? (
              <p className="text-sm text-slate-400 bg-slate-50 border border-slate-100/50 rounded-xl p-4 text-center font-medium">Phòng đang trống</p>
            ) : (
              <div className="space-y-2">
                {room.tenants?.map((t) => (
                  <Link key={t.id} to={`/tenants/${t.id}`} className="block p-4 rounded-xl border border-slate-100 hover:border-emerald-100 hover:bg-emerald-50/10 active:scale-[0.98] transition-all duration-200">
                    <p className="font-bold text-slate-800 text-sm">{t.name}</p>
                    <p className="text-xs text-slate-400 mt-1">📞 {t.phone || 'Chưa có số điện thoại'}</p>
                    <p className="text-xs text-slate-400 mt-1">Zalo: {t.zaloContact || 'Chưa có liên hệ Zalo'}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Invoice History */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-100 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.01)]">
          <h2 className="font-bold text-slate-800 text-base mb-4">Lịch sử hóa đơn</h2>
          {room.invoices?.length === 0 ? (
            <p className="text-sm text-slate-400 bg-slate-50 border border-slate-100/50 rounded-xl p-6 text-center font-medium">Chưa có hóa đơn nào được tạo</p>
          ) : (
            <div className="space-y-2.5">
              {room.invoices?.map((inv) => (
                <Link key={inv.id} to={`/invoices/${inv.id}`} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-emerald-100 hover:bg-emerald-50/10 active:scale-[0.98] transition-all duration-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-50 border border-slate-100 rounded-lg text-slate-500">
                      <FileText size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">Tháng {inv.month}/{inv.year}</p>
                      <p className="text-xs text-slate-400 mt-0.5">Ngày tạo: {formatDate(inv.createdAt)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-extrabold text-slate-800">{formatCurrency(inv.totalAmount)}</p>
                    <span className={`inline-block text-[10px] px-2.5 py-0.5 rounded-full font-bold mt-1.5 ${inv.paid ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
                      {inv.paid ? 'Đã thu' : 'Chưa thu'}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
