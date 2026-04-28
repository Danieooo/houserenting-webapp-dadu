import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { getTenantsApi, createTenantApi, updateTenantApi, deleteTenantApi, getRoomsApi } from '../services/api';
import { formatDate, formatCurrency } from '../lib/utils';
import { Plus, Eye, UserX, Users, Edit2, Phone, Calendar } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1, 'Tên không được để trống'),
  phone: z.string().min(9, 'Số điện thoại không hợp lệ'),
  idCard: z.string().optional(),
  roomId: z.string().min(1, 'Vui lòng chọn phòng'),
  moveInDate: z.string().min(1, 'Vui lòng chọn ngày vào ở'),
  moveOutDate: z.string().optional(),
  deposit: z.string().optional(),
});

function TenantForm({ onClose, initialData }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: initialData ? {
      name: initialData.name,
      phone: initialData.phone,
      idCard: initialData.idCard || '',
      roomId: initialData.roomId?.toString(),
      moveInDate: initialData.moveInDate ? initialData.moveInDate.split('T')[0] : '',
      moveOutDate: initialData.moveOutDate ? initialData.moveOutDate.split('T')[0] : '',
      deposit: initialData.deposit?.toString() || '',
    } : {}
  });
  const qc = useQueryClient();
  const { data: roomsRes } = useQuery({ queryKey: ['rooms'], queryFn: getRoomsApi });
  const availableRooms = (roomsRes?.data?.data || []).filter(r => r.status === 'AVAILABLE' || (initialData && r.id === initialData.roomId));

  const { mutate, isPending } = useMutation({
    mutationFn: (data) => initialData ? updateTenantApi(initialData.id, data) : createTenantApi(data),
    onSuccess: () => { 
      toast.success(initialData ? 'Cập nhật khách thuê thành công!' : 'Thêm khách thuê thành công!'); 
      qc.invalidateQueries(['tenants']); 
      qc.invalidateQueries(['rooms']); 
      onClose(); 
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Lỗi lưu khách'),
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b"><h2 className="text-lg font-semibold">{initialData ? 'Cập nhật khách thuê' : 'Thêm khách thuê'}</h2></div>
        <form onSubmit={handleSubmit((d) => mutate({ 
          ...d, 
          roomId: Number(d.roomId), 
          deposit: d.deposit ? Number(d.deposit) : 0,
          moveOutDate: d.moveOutDate || null 
        }))} className="p-6 space-y-4">
          {[
            { label: 'Họ tên *', name: 'name', placeholder: 'Nguyễn Văn A' },
            { label: 'Số điện thoại *', name: 'phone', placeholder: '0901234567' },
            { label: 'CCCD/CMND', name: 'idCard', placeholder: '012345678901' },
          ].map(({ label, name, placeholder }) => (
            <div key={name}>
              <label className="block text-sm font-medium mb-1">{label}</label>
              <input {...register(name)} placeholder={placeholder} className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name].message}</p>}
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium mb-1">Phòng *</label>
            <select {...register('roomId')} className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
              <option value="">-- Chọn phòng --</option>
              {availableRooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
            {errors.roomId && <p className="text-red-500 text-xs mt-1">{errors.roomId.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Ngày vào ở *</label>
              <input type="date" {...register('moveInDate')} className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              {errors.moveInDate && <p className="text-red-500 text-xs mt-1">{errors.moveInDate.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ngày kết thúc</label>
              <input type="date" {...register('moveOutDate')} className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tiền cọc (đ)</label>
            <input type="number" {...register('deposit')} placeholder="0" className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">Hủy</button>
            <button type="submit" disabled={isPending} className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-60">
              {isPending ? 'Đang lưu...' : (initialData ? 'Cập nhật' : 'Thêm khách')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function TenantsPage() {
  const [editingTenant, setEditingTenant] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('true');
  const { data, isLoading } = useQuery({ queryKey: ['tenants', filter], queryFn: () => getTenantsApi({ active: filter }) });
  const qc = useQueryClient();
  const { mutate: moveOut } = useMutation({
    mutationFn: deleteTenantApi,
    onSuccess: () => { toast.success('Khách đã được chuyển sang phần đã rời đi'); qc.invalidateQueries(['tenants']); qc.invalidateQueries(['rooms']); },
    onError: (e) => toast.error(e.response?.data?.message || 'Lỗi chuyển khách ra'),
  });
  const tenants = data?.data?.data || [];

  const handleEdit = (tenant) => {
    setEditingTenant(tenant);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setEditingTenant(null);
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Khách thuê</h1>
          <p className="text-sm text-muted-foreground mt-1">{tenants.length} khách</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="px-3 py-2 border rounded-lg text-sm focus:outline-none">
            <option value="true">Đang thuê</option>
            <option value="false">Đã rời đi</option>
          </select>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 shadow-sm">
            <Plus size={16} /> Thêm khách
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-40 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : tenants.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Users size={48} className="mx-auto mb-4 opacity-30" />
          <p>Không có khách thuê nào</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tenants.map((t) => (
            <div key={t.id} className="bg-white rounded-xl border shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                    {t.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-base leading-tight">{t.name}</h3>
                    <Link to={`/rooms/${t.room?.id}`} className="text-xs text-primary hover:underline">
                      {t.room?.name}
                    </Link>
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${t.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {t.active ? 'Đang thuê' : 'Đã rời đi'}
                </span>
              </div>
              
              <div className="flex-1 space-y-2 text-sm mt-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone size={14} />
                  <span>{t.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar size={14} />
                  <span>Vào ở: {formatDate(t.moveInDate)}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t mt-3">
                  <span className="text-muted-foreground text-xs">Tiền cọc</span>
                  <span className="font-medium">{formatCurrency(t.deposit)}</span>
                </div>
              </div>

              <div className="flex gap-2 mt-4 pt-4 border-t">
                <Link to={`/tenants/${t.id}`} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors">
                  <Eye size={13} /> Chi tiết
                </Link>
                <button onClick={() => handleEdit(t)}
                  className="px-3 py-2 border rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                  <Edit2 size={13} />
                </button>
                {t.active && (
                  <button onClick={() => { if (confirm(`Xác nhận chuyển ${t.name} rời khỏi phòng ${t.room?.name || ''}?`)) moveOut(t.id); }}
                    className="px-3 py-2 border border-red-200 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 transition-colors">
                    <UserX size={13} />
                    <span className="ml-1">Chuyển ra</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && <TenantForm initialData={editingTenant} onClose={handleCloseForm} />}
    </div>
  );
}
