import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { getRoomsApi, createRoomApi, updateRoomApi, deleteRoomApi } from '../services/api';
import { formatCurrency, ROOM_STATUS_LABELS, ROOM_STATUS_COLORS } from '../lib/utils';
import { Plus, Trash2, Eye, Building2, Edit2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1, 'Tên phòng không được để trống'),
  floor: z.string().optional(),
  area: z.string().optional(),
  baseRent: z.string().min(1, 'Vui lòng nhập giá thuê'),
  electricPrice: z.string().optional(),
  waterPrice: z.string().optional(),
  garbageFee: z.string().optional(),
});

function RoomForm({ onClose, onSuccess, initialData }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: initialData ? {
      name: initialData.name,
      floor: initialData.floor?.toString() || '',
      area: initialData.area?.toString() || '',
      baseRent: initialData.baseRent?.toString(),
      electricPrice: initialData.electricPrice?.toString() || '3500',
      waterPrice: initialData.waterPrice?.toString() || '15000',
      garbageFee: initialData.garbageFee?.toString() || '20000',
    } : {
      electricPrice: '3500',
      waterPrice: '15000',
      garbageFee: '20000',
    }
  });
  
  const qc = useQueryClient();
  const { mutate, isPending } = useMutation({
    mutationFn: (data) => initialData ? updateRoomApi(initialData.id, data) : createRoomApi(data),
    onSuccess: () => {
      toast.success(initialData ? 'Cập nhật phòng thành công!' : 'Thêm phòng thành công!');
      qc.invalidateQueries({ queryKey: ['rooms'] });
      qc.refetchQueries({ queryKey: ['rooms'] });
      onSuccess?.();
    },
    onError: (e) => {
      console.error('Mutate room error:', e.response?.data || e);
      toast.error(e.response?.data?.message || 'Lỗi lưu phòng');
    },
  });

  const onSubmit = (data) => mutate({
    name: data.name,
    floor: data.floor ? Number(data.floor) : undefined,
    area: data.area ? Number(data.area) : undefined,
    baseRent: Number(data.baseRent),
    electricPrice: data.electricPrice ? Number(data.electricPrice) : undefined,
    waterPrice: data.waterPrice ? Number(data.waterPrice) : undefined,
    garbageFee: data.garbageFee ? Number(data.garbageFee) : undefined,
  });

  const Field = ({ label, name, placeholder, type = 'text', testId }) => (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input type={type} placeholder={placeholder} {...register(name)} data-testid={testId}
        className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 outline-none" />
      {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name].message}</p>}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">{initialData ? 'Cập nhật phòng' : 'Thêm phòng mới'}</h2>
        </div>
        <form onSubmit={handleSubmit(onSubmit, (err) => console.log('Room Form Validation Errors:', err))} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><Field label="Tên phòng *" name="name" placeholder="Phòng 101" testId="room-form-name" /></div>
            <Field label="Tầng" name="floor" placeholder="1" type="number" testId="room-form-floor" />
            <Field label="Diện tích (m²)" name="area" placeholder="20" type="number" testId="room-form-area" />
            <div className="col-span-2"><Field label="Giá thuê (đ/tháng) *" name="baseRent" placeholder="2500000" type="number" testId="room-form-baseRent" /></div>
            <Field label="Giá điện (đ/kWh)" name="electricPrice" placeholder="3500" type="number" testId="room-form-electricPrice" />
            <Field label="Giá nước (đ/m³)" name="waterPrice" placeholder="15000" type="number" testId="room-form-waterPrice" />
            <div className="col-span-2"><Field label="Phí rác (đ/tháng)" name="garbageFee" placeholder="20000" type="number" testId="room-form-garbageFee" /></div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">Hủy</button>
            <button type="submit" disabled={isPending} data-testid="room-form-submit" className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-60">
              {isPending ? 'Đang lưu...' : (initialData ? 'Cập nhật' : 'Thêm phòng')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import { SkeletonCard } from '../components/Skeleton';

export default function RoomsPage() {
  const [editingRoom, setEditingRoom] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const { data, isLoading, refetch } = useQuery({ queryKey: ['rooms'], queryFn: getRoomsApi });
  const qc = useQueryClient();
  const { mutate: deleteRoom } = useMutation({
    mutationFn: deleteRoomApi,
    onSuccess: () => { toast.success('Đã xóa phòng'); qc.invalidateQueries({ queryKey: ['rooms'] }); },
    onError: (e) => toast.error(e.response?.data?.message || 'Không thể xóa phòng'),
  });
  const rooms = data?.data?.data || [];

  const handleEdit = (room) => {
    setEditingRoom(room);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setEditingRoom(null);
    setShowForm(false);
  };

  const STATUS_BADGES = {
    AVAILABLE: "bg-emerald-50/80 text-emerald-700 border border-emerald-200/50 px-2.5 py-1 rounded-full text-xs font-semibold",
    OCCUPIED: "bg-rose-50/80 text-rose-700 border border-rose-200/50 px-2.5 py-1 rounded-full text-xs font-semibold",
    MAINTENANCE: "bg-amber-50/80 text-amber-700 border border-amber-200/50 px-2.5 py-1 rounded-full text-xs font-semibold"
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Phòng trọ</h1>
          <p className="text-sm text-slate-500 mt-1">{rooms.length} phòng hoạt động</p>
        </div>
        <button onClick={() => setShowForm(true)} data-testid="add-room-btn" className="flex items-center gap-2 bg-cobalt-royal text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 shadow-[0_4px_12px_rgba(0,82,204,0.15)]">
          <Plus size={16} /> Thêm phòng
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : rooms.length === 0 ? (
        <div className="text-center py-20 text-slate-400 bg-white rounded-2xl border border-slate-100 p-8">
          <Building2 size={48} className="mx-auto mb-4 opacity-30 text-cobalt-royal" />
          <p className="font-medium text-sm">Chưa có phòng nào. Hãy thêm phòng đầu tiên!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {rooms.map((room) => (
            <div key={room.id} data-testid={`room-card-${room.name.replace(/\s+/g, '-')}`} className="bg-white rounded-2xl border border-slate-100 hover:border-blue-100 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.03)] active:scale-[0.99] transition-all duration-300 ease-in-out p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">{room.name}</h3>
                    {room.floor && <p className="text-xs text-slate-400 mt-0.5">Tầng {room.floor} {room.area && `· ${room.area} m²`}</p>}
                  </div>
                  <span className={STATUS_BADGES[room.status] || "bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded-full font-semibold"}>
                    {ROOM_STATUS_LABELS[room.status]}
                  </span>
                </div>
                <div className="mt-2">
                  <span className="text-xs text-slate-400 block">Giá thuê cơ bản</span>
                  <p className="text-xl font-extrabold text-cobalt-royal mt-0.5">{formatCurrency(room.baseRent)}<span className="text-xs text-slate-400 font-normal">/tháng</span></p>
                </div>
                {room.tenants && room.tenants.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                    <span className="text-xs font-semibold px-2 py-0.5 bg-slate-50 text-slate-600 rounded-md border border-slate-100">👤 Khách</span>
                    <span className="text-xs font-medium text-slate-600 truncate max-w-[180px]">
                      {room.tenants.map(t => t.name).join(', ')}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex gap-2 mt-6">
                <Link to={`/rooms/${room.id}`} data-testid={`room-view-detail-${room.id}`} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border border-slate-100 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-800 active:scale-[0.98] transition-all duration-200">
                  <Eye size={13} /> Chi tiết
                </Link>
                <button onClick={() => handleEdit(room)}
                  className="px-3 py-2 border border-slate-100 rounded-xl text-xs font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-700 active:scale-[0.98] transition-all duration-200">
                  <Edit2 size={13} />
                </button>
                <button onClick={() => { if (confirm(`Xóa ${room.name}?`)) deleteRoom(room.id); }}
                  className="px-3 py-2 border border-red-100 rounded-xl text-xs font-medium text-red-600 hover:bg-red-50/50 active:scale-[0.98] transition-all duration-200">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && <RoomForm initialData={editingRoom} onClose={handleCloseForm} onSuccess={handleCloseForm} />}
    </div>
  );
}
