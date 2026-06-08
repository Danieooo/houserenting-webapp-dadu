import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { getRoomsApi, createRoomApi, updateRoomApi, deleteRoomApi } from '../services/api';
import { formatCurrency, ROOM_STATUS_LABELS } from '../lib/utils';
import { Plus, Trash2, Eye, Edit2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SkeletonCard } from '../components/Skeleton';

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
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          floor: initialData.floor?.toString() || '',
          area: initialData.area?.toString() || '',
          baseRent: initialData.baseRent?.toString(),
          electricPrice: initialData.electricPrice?.toString() || '3500',
          waterPrice: initialData.waterPrice?.toString() || '15000',
          garbageFee: initialData.garbageFee?.toString() || '20000',
        }
      : {
          electricPrice: '3500',
          waterPrice: '15000',
          garbageFee: '20000',
        },
  });

  const qc = useQueryClient();
  const { mutate, isPending } = useMutation({
    mutationFn: (data) => (initialData ? updateRoomApi(initialData.id, data) : createRoomApi(data)),
    onSuccess: async () => {
      toast.success(initialData ? 'Cập nhật phòng thành công!' : 'Thêm phòng thành công!');
      await qc.invalidateQueries({ queryKey: ['rooms'] });
      onSuccess?.();
    },
    onError: (e) => {
      console.error('Mutate room error:', e.response?.data || e);
      toast.error(e.response?.data?.message || 'Lỗi lưu phòng');
    },
  });

  const onSubmit = (data) =>
    mutate({
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
      <label className="mb-1.5 block text-sm font-semibold text-slate-600">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        {...register(name)}
        data-testid={testId}
        className="w-full rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-2.5 text-sm font-medium text-slate-700 outline-none transition-all duration-200 focus:border-[#2E7D32] focus:ring-2 focus:ring-emerald-50"
      />
      {errors[name] && <p className="mt-1 text-xs text-red-500">{errors[name].message}</p>}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
        <div className="border-b p-6">
          <h2 className="text-lg font-semibold">{initialData ? 'Cập nhật phòng' : 'Thêm phòng mới'}</h2>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Field label="Tên phòng *" name="name" placeholder="Phòng 101" testId="room-form-name" />
            </div>
            <Field label="Tầng" name="floor" placeholder="1" type="number" testId="room-form-floor" />
            <Field label="Diện tích (m²)" name="area" placeholder="20" type="number" testId="room-form-area" />
            <div className="col-span-2">
              <Field label="Giá thuê (đ/tháng) *" name="baseRent" placeholder="2500000" type="number" testId="room-form-baseRent" />
            </div>
            <Field label="Giá điện (đ/kWh)" name="electricPrice" placeholder="3500" type="number" testId="room-form-electricPrice" />
            <Field label="Giá nước (đ/m³)" name="waterPrice" placeholder="15000" type="number" testId="room-form-waterPrice" />
            <div className="col-span-2">
              <Field label="Phí rác (đ/tháng)" name="garbageFee" placeholder="20000" type="number" testId="room-form-garbageFee" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="flex-1 rounded-xl border border-slate-100 px-4 py-2.5 text-sm font-bold text-slate-500 transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.98]"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isPending}
              data-testid="room-form-submit"
              className="flex-1 rounded-xl bg-[#2E7D32] px-4 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:bg-[#2E7D32]/95 hover:shadow-[0_8px_20px_rgba(46,125,50,0.15)] disabled:opacity-60 active:scale-[0.98]"
            >
              {isPending ? 'Đang lưu...' : initialData ? 'Cập nhật' : 'Thêm phòng'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function RoomsPage() {
  const [editingRoom, setEditingRoom] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [deletingRoomId, setDeletingRoomId] = useState(null);
  const { data, isLoading } = useQuery({ queryKey: ['rooms'], queryFn: getRoomsApi });
  const qc = useQueryClient();
  const { mutate: deleteRoom } = useMutation({
    mutationFn: deleteRoomApi,
    onMutate: (roomId) => {
      setDeletingRoomId(roomId);
    },
    onSuccess: async () => {
      toast.success('Đã xóa phòng');
      await qc.invalidateQueries({ queryKey: ['rooms'] });
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Không thể xóa phòng'),
    onSettled: () => {
      setDeletingRoomId(null);
    },
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
    AVAILABLE: 'rounded-full border border-emerald-200/50 bg-emerald-50/80 px-2.5 py-1 text-xs font-semibold text-emerald-700',
    OCCUPIED: 'rounded-full border border-rose-200/50 bg-rose-50/80 px-2.5 py-1 text-xs font-semibold text-rose-700',
    MAINTENANCE: 'rounded-full border border-amber-200/50 bg-amber-50/80 px-2.5 py-1 text-xs font-semibold text-amber-700',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Phòng trọ</h1>
          <p className="mt-1 text-sm text-slate-500">{rooms.length} phòng hoạt động</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          data-testid="add-room-btn"
          className="flex items-center gap-2 rounded-xl bg-[#2E7D32] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(46,125,50,0.15)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#2E7D32]/95 active:scale-[0.98]"
        >
          <Plus size={16} /> Thêm phòng
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : rooms.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[24px] border border-emerald-100/20 bg-white p-8 py-20 text-center shadow-[0_8px_30px_rgba(0,0,0,0.01)]">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-emerald-100/50 bg-[#E8F5E9] text-[#2E7D32] transition-all duration-300 hover:rotate-12">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-8 w-8 text-[#2E7D32]">
              <path d="M12 2C6.5 2 2 6.5 2 12c0 2.8 1.1 5.3 3 7.1V22l3-2.2c1.2.6 2.5 1 4 1 5.5 0 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8z" />
              <path d="M12 6c-3.3 0-6 2.7-6 6h12c0-3.3-2.7-6-6-6z" />
            </svg>
          </div>
          <p className="text-base font-bold leading-tight text-slate-800">Chưa có phòng trọ nào</p>
          <p className="mt-1.5 max-w-xs text-center text-xs font-semibold leading-relaxed text-slate-400">
            Hãy bấm nút "Thêm phòng" ở góc trên để khởi tạo phòng trọ đầu tiên và thiết lập đơn giá vận hành.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room) => {
            const isDeleting = deletingRoomId === room.id;

            return (
              <div
                key={room.id}
                data-testid={`room-card-${room.name.replace(/\s+/g, '-')}`}
                className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-white p-6 transition-all duration-300 ease-in-out hover:-translate-y-1 hover:border-emerald-200/50 hover:shadow-[0_12px_40px_rgba(46,125,50,0.03)] active:scale-[0.99]"
              >
                <div>
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">{room.name}</h3>
                      {room.floor && <p className="mt-0.5 text-xs text-slate-400">Tầng {room.floor} {room.area && `· ${room.area} m²`}</p>}
                    </div>
                    <span className={STATUS_BADGES[room.status] || 'rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700'}>
                      {ROOM_STATUS_LABELS[room.status]}
                    </span>
                  </div>
                  <div className="mt-2">
                    <span className="block text-xs text-slate-400">Giá thuê cơ bản</span>
                    <p className="mt-0.5 text-xl font-extrabold text-[#2E7D32]">
                      {formatCurrency(room.baseRent)}
                      <span className="text-xs font-normal text-slate-400">/tháng</span>
                    </p>
                  </div>
                  {room.tenants && room.tenants.length > 0 && (
                    <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3">
                      <span className="rounded-md border border-slate-100 bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-600">Khách</span>
                      <span className="max-w-[180px] truncate text-xs font-medium text-slate-600">
                        {room.tenants.map((tenant) => tenant.name).join(', ')}
                      </span>
                    </div>
                  )}
                </div>
                <div className="mt-6 flex gap-2">
                  <Link
                    to={`/rooms/${room.id}`}
                    data-testid={`room-view-detail-${room.id}`}
                    className="flex-1 rounded-xl border border-slate-100 px-3 py-2 text-center text-xs font-bold text-slate-600 transition-all duration-200 hover:bg-slate-50 hover:text-slate-800 active:scale-[0.98]"
                  >
                    <span className="flex items-center justify-center gap-1.5">
                      <Eye size={13} /> Chi tiết
                    </span>
                  </Link>
                  <button
                    onClick={() => handleEdit(room)}
                    disabled={isDeleting}
                    className="rounded-xl border border-slate-100 px-3 py-2 text-xs font-medium text-slate-500 transition-all duration-200 hover:bg-slate-50 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={() => {
                      if (isDeleting) return;
                      if (confirm(`Xóa ${room.name}?`)) deleteRoom(room.id);
                    }}
                    disabled={isDeleting}
                    className="rounded-xl border border-red-100 px-3 py-2 text-xs font-medium text-red-600 transition-all duration-200 hover:bg-red-50/50 disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && <RoomForm initialData={editingRoom} onClose={handleCloseForm} onSuccess={handleCloseForm} />}
    </div>
  );
}
