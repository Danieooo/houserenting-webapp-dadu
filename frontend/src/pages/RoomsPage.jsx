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
      qc.invalidateQueries(['rooms']);
      onSuccess?.();
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Lỗi lưu phòng'),
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

  const Field = ({ label, name, placeholder, type = 'text' }) => (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input type={type} placeholder={placeholder} {...register(name)}
        className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
      {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name].message}</p>}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">{initialData ? 'Cập nhật phòng' : 'Thêm phòng mới'}</h2>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><Field label="Tên phòng *" name="name" placeholder="Phòng 101" /></div>
            <Field label="Tầng" name="floor" placeholder="1" type="number" />
            <Field label="Diện tích (m²)" name="area" placeholder="20" type="number" />
            <div className="col-span-2"><Field label="Giá thuê (đ/tháng) *" name="baseRent" placeholder="2500000" type="number" /></div>
            <Field label="Giá điện (đ/kWh)" name="electricPrice" placeholder="3500" type="number" />
            <Field label="Giá nước (đ/m³)" name="waterPrice" placeholder="15000" type="number" />
            <div className="col-span-2"><Field label="Phí rác (đ/tháng)" name="garbageFee" placeholder="20000" type="number" /></div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">Hủy</button>
            <button type="submit" disabled={isPending} className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-60">
              {isPending ? 'Đang lưu...' : (initialData ? 'Cập nhật' : 'Thêm phòng')}
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
  const { data, isLoading } = useQuery({ queryKey: ['rooms'], queryFn: getRoomsApi });
  const qc = useQueryClient();
  const { mutate: deleteRoom } = useMutation({
    mutationFn: deleteRoomApi,
    onSuccess: () => { toast.success('Đã xóa phòng'); qc.invalidateQueries(['rooms']); },
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Phòng trọ</h1>
          <p className="text-sm text-muted-foreground mt-1">{rooms.length} phòng</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 shadow-sm">
          <Plus size={16} /> Thêm phòng
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-40 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : rooms.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Building2 size={48} className="mx-auto mb-4 opacity-30" />
          <p>Chưa có phòng nào. Hãy thêm phòng đầu tiên!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map((room) => (
            <div key={room.id} className="bg-white rounded-xl border shadow-sm hover:shadow-md transition-shadow p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-base">{room.name}</h3>
                  {room.floor && <p className="text-xs text-muted-foreground">Tầng {room.floor} {room.area && `· ${room.area}m²`}</p>}
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${ROOM_STATUS_COLORS[room.status]}`}>
                  {ROOM_STATUS_LABELS[room.status]}
                </span>
              </div>
              <p className="text-lg font-bold text-primary">{formatCurrency(room.baseRent)}<span className="text-xs text-muted-foreground font-normal">/tháng</span></p>
              {room.tenants?.[0] && (
                <p className="text-xs text-muted-foreground mt-1">👤 {room.tenants[0].name}</p>
              )}
              <div className="flex gap-2 mt-4">
                <Link to={`/rooms/${room.id}`} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors">
                  <Eye size={13} /> Chi tiết
                </Link>
                <button onClick={() => handleEdit(room)}
                  className="px-3 py-2 border rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                  <Edit2 size={13} />
                </button>
                <button onClick={() => { if (confirm(`Xóa ${room.name}?`)) deleteRoom(room.id); }}
                  className="px-3 py-2 border border-red-200 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 transition-colors">
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
