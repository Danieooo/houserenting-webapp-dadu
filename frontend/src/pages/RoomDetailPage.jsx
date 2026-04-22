import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getRoomApi } from '../services/api';
import { formatCurrency, formatDate, ROOM_STATUS_LABELS, ROOM_STATUS_COLORS } from '../lib/utils';
import { ArrowLeft, FileText } from 'lucide-react';

export default function RoomDetailPage() {
  const { id } = useParams();
  const { data, isLoading } = useQuery({ queryKey: ['room', id], queryFn: () => getRoomApi(id) });
  const room = data?.data?.data;

  if (isLoading) return <div className="animate-pulse h-64 bg-gray-100 rounded-xl" />;
  if (!room) return <p className="text-muted-foreground">Không tìm thấy phòng.</p>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link to="/rooms" className="text-muted-foreground hover:text-foreground transition-colors"><ArrowLeft size={20} /></Link>
        <div>
          <h1 className="text-2xl font-bold">{room.name}</h1>
          <span className={`text-xs px-2 py-0.5 rounded-full ${ROOM_STATUS_COLORS[room.status]}`}>{ROOM_STATUS_LABELS[room.status]}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border p-6 shadow-sm space-y-3">
          <h2 className="font-semibold">Thông tin phòng</h2>
          {[
            ['Tầng', room.floor || '-'],
            ['Diện tích', room.area ? `${room.area} m²` : '-'],
            ['Giá thuê', formatCurrency(room.baseRent) + '/tháng'],
            ['Giá điện', formatCurrency(room.electricPrice) + '/kWh'],
            ['Giá nước', formatCurrency(room.waterPrice) + '/m³'],
            ['Phí rác', formatCurrency(room.garbageFee) + '/tháng'],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between text-sm">
              <span className="text-muted-foreground">{label}</span>
              <span className="font-medium">{value}</span>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border p-6 shadow-sm">
          <h2 className="font-semibold mb-3">Khách thuê hiện tại</h2>
          {room.tenants?.length === 0 ? (
            <p className="text-sm text-muted-foreground">Phòng đang trống</p>
          ) : room.tenants?.map((t) => (
            <Link key={t.id} to={`/tenants/${t.id}`} className="block p-3 rounded-lg border hover:bg-gray-50 transition-colors">
              <p className="font-medium text-sm">{t.name}</p>
              <p className="text-xs text-muted-foreground">{t.phone}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Invoice history */}
      <div className="bg-white rounded-xl border p-6 shadow-sm">
        <h2 className="font-semibold mb-4">Lịch sử hóa đơn</h2>
        {room.invoices?.length === 0 ? (
          <p className="text-sm text-muted-foreground">Chưa có hóa đơn</p>
        ) : (
          <div className="space-y-2">
            {room.invoices?.map((inv) => (
              <Link key={inv.id} to={`/invoices/${inv.id}`} className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <FileText size={16} className="text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Tháng {inv.month}/{inv.year}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(inv.createdAt)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{formatCurrency(inv.totalAmount)}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${inv.paid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {inv.paid ? 'Đã thu' : 'Chưa thu'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
