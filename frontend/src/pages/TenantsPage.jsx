import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import {
  getTenantsApi,
  createTenantApi,
  updateTenantApi,
  deleteTenantApi,
  moveOutTenantApi,
  getRoomsApi,
} from '../services/api';
import { formatDate, formatCurrency } from '../lib/utils';
import { Plus, Eye, UserX, Users, Edit2, Phone, Calendar, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SkeletonCard } from '../components/Skeleton';

const PHONE_ALLOWED_PATTERN = /^[+\d\s().-]+$/;

const looksLikePhoneNumber = (value) => {
  const trimmed = value.trim();
  if (trimmed === '') return true;
  if (!PHONE_ALLOWED_PATTERN.test(trimmed)) return false;

  const digitCount = trimmed.replace(/\D/g, '').length;
  return digitCount >= 9 && digitCount <= 15;
};

const schema = z.object({
  name: z.string().min(1, 'Tên không được để trống'),
  phone: z.string().trim().refine(looksLikePhoneNumber, 'Số điện thoại không hợp lệ'),
  zaloContact: z.string().trim().max(120, 'Thông tin Zalo quá dài').optional(),
  idCard: z.string().optional(),
  roomId: z.string().min(1, 'Vui lòng chọn phòng'),
  moveInDate: z.string().min(1, 'Vui lòng chọn ngày vào ở'),
  moveOutDate: z.string().optional(),
  deposit: z.string().optional(),
});

function TenantForm({ onClose, initialData }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          phone: initialData.phone || '',
          zaloContact: initialData.zaloContact || '',
          idCard: initialData.idCard || '',
          roomId: initialData.roomId?.toString(),
          moveInDate: initialData.moveInDate ? initialData.moveInDate.split('T')[0] : '',
          moveOutDate: initialData.moveOutDate ? initialData.moveOutDate.split('T')[0] : '',
          deposit: initialData.deposit?.toString() || '',
        }
      : {
          name: '',
          phone: '',
          zaloContact: '',
          idCard: '',
          roomId: '',
          moveInDate: '',
          moveOutDate: '',
          deposit: '',
        },
  });

  const qc = useQueryClient();
  const { data: roomsRes } = useQuery({ queryKey: ['rooms'], queryFn: getRoomsApi });
  const availableRooms = (roomsRes?.data?.data || []).filter(
    (room) => room.status === 'AVAILABLE' || room.status === 'OCCUPIED' || (initialData && room.id === initialData.roomId)
  );

  const { mutate, isPending } = useMutation({
    mutationFn: (data) => (initialData ? updateTenantApi(initialData.id, data) : createTenantApi(data)),
    onSuccess: async () => {
      toast.success(initialData ? 'Cập nhật khách thuê thành công!' : 'Thêm khách thuê thành công!');
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['tenants'] }),
        qc.invalidateQueries({ queryKey: ['rooms'] }),
      ]);
      onClose();
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Lỗi lưu khách'),
  });

  const contactFields = [
    { label: 'Họ tên *', name: 'name', placeholder: 'Nguyễn Văn A' },
    { label: 'Số điện thoại', name: 'phone', placeholder: '0901234567' },
    {
      label: 'Liên hệ Zalo',
      name: 'zaloContact',
      placeholder: 'Số Zalo, username, link profile hoặc ghi chú',
    },
    { label: 'CCCD/CMND', name: 'idCard', placeholder: '012345678901' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-xl">
        <div className="border-b p-6">
          <h2 className="text-lg font-semibold">{initialData ? 'Cập nhật khách thuê' : 'Thêm khách thuê'}</h2>
        </div>
        <form
          onSubmit={handleSubmit((data) =>
            mutate({
              ...data,
              roomId: Number(data.roomId),
              deposit: data.deposit ? Number(data.deposit) : 0,
              moveOutDate: data.moveOutDate || null,
            })
          )}
          className="space-y-4 p-6"
        >
          {contactFields.map(({ label, name, placeholder }) => (
            <div key={name}>
              <label className="mb-1.5 block text-sm font-semibold text-slate-600">{label}</label>
              <input
                {...register(name)}
                placeholder={placeholder}
                data-testid={`tenant-form-${name}`}
                className="w-full rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-2.5 text-sm font-medium text-slate-700 outline-none transition-all duration-200 focus:border-[#2E7D32] focus:ring-2 focus:ring-emerald-50"
              />
              {errors[name] && <p className="mt-1 text-xs text-red-500">{errors[name].message}</p>}
            </div>
          ))}

          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 px-4 py-3">
            <p className="text-sm font-semibold text-emerald-900">Không có số điện thoại?</p>
            <p className="mt-1 text-xs leading-relaxed text-emerald-800">
              Không có số điện thoại? Hãy lưu tài khoản hoặc ghi chú Zalo ở ô bên dưới để còn tìm đúng khách khi gửi hóa đơn.
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-600">Phòng *</label>
            <select
              {...register('roomId')}
              data-testid="tenant-form-roomId"
              className="w-full rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-2.5 text-sm font-medium text-slate-700 outline-none transition-all duration-200 focus:border-[#2E7D32] focus:ring-2 focus:ring-emerald-50"
            >
              <option value="">-- Chọn phòng --</option>
              {availableRooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name} {room.status === 'OCCUPIED' ? '(Đang ở - Ghép phòng)' : '(Trống)'}
                </option>
              ))}
            </select>
            {errors.roomId && <p className="mt-1 text-xs text-red-500">{errors.roomId.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-600">Ngày vào ở *</label>
              <input
                type="date"
                {...register('moveInDate')}
                data-testid="tenant-form-moveInDate"
                className="w-full rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-2.5 text-sm font-medium text-slate-700 outline-none transition-all duration-200 focus:border-[#2E7D32] focus:ring-2 focus:ring-emerald-50"
              />
              {errors.moveInDate && <p className="mt-1 text-xs text-red-500">{errors.moveInDate.message}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-600">Ngày kết thúc</label>
              <input
                type="date"
                {...register('moveOutDate')}
                data-testid="tenant-form-moveOutDate"
                className="w-full rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-2.5 text-sm font-medium text-slate-700 outline-none transition-all duration-200 focus:border-[#2E7D32] focus:ring-2 focus:ring-emerald-50"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-600">Tiền cọc (đ)</label>
            <input
              type="number"
              {...register('deposit')}
              data-testid="tenant-form-deposit"
              placeholder="0"
              className="w-full rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-2.5 text-sm font-medium text-slate-700 outline-none transition-all duration-200 focus:border-[#2E7D32] focus:ring-2 focus:ring-emerald-50"
            />
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
              data-testid="tenant-form-submit"
              className="flex-1 rounded-xl bg-[#2E7D32] px-4 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:bg-[#2E7D32]/95 hover:shadow-[0_8px_20px_rgba(46,125,50,0.15)] disabled:opacity-60 active:scale-[0.98]"
            >
              {isPending ? 'Đang lưu...' : initialData ? 'Cập nhật' : 'Thêm khách'}
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
  const { data, isLoading } = useQuery({
    queryKey: ['tenants', filter],
    queryFn: () => getTenantsApi({ active: filter }),
  });
  const qc = useQueryClient();
  const { mutate: moveOut } = useMutation({
    mutationFn: (id) => moveOutTenantApi(id),
    onSuccess: async () => {
      toast.success('Khách đã được chuyển sang phần đã rời đi');
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['tenants'] }),
        qc.invalidateQueries({ queryKey: ['rooms'] }),
      ]);
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Lỗi chuyển khách ra'),
  });
  const { mutate: deleteTenant } = useMutation({
    mutationFn: (id) => deleteTenantApi(id),
    onSuccess: async () => {
      toast.success('Khách đã được xóa hoàn toàn');
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['tenants'] }),
        qc.invalidateQueries({ queryKey: ['rooms'] }),
      ]);
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Lỗi xóa khách'),
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
          <h1 className="text-2xl font-bold text-slate-900">Khách thuê</h1>
          <p className="mt-1 text-sm text-slate-500">{tenants.length} khách thuê</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-xl border border-slate-100 bg-white px-3.5 py-2 text-sm font-semibold focus:border-[#2E7D32] focus:outline-none focus:ring-2 focus:ring-emerald-100"
          >
            <option value="true">Đang thuê</option>
            <option value="false">Đã rời đi</option>
          </select>
          <button
            onClick={() => setShowForm(true)}
            data-testid="add-tenant-btn"
            className="flex items-center gap-2 rounded-xl bg-[#2E7D32] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(46,125,50,0.15)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#2E7D32]/95 active:scale-[0.98]"
          >
            <Plus size={16} /> Thêm khách
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : tenants.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[24px] border border-emerald-100/20 bg-white p-8 py-20 text-center shadow-[0_8px_30px_rgba(0,0,0,0.01)]">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-emerald-100/50 bg-[#E8F5E9] text-[#2E7D32]">
            <Users size={32} />
          </div>
          <p className="text-base font-bold leading-tight text-slate-800">Chưa có khách thuê nào</p>
          <p className="mt-1.5 max-w-xs text-center text-xs font-semibold leading-relaxed text-slate-400">
            Hãy bấm nút "Thêm khách" ở góc trên để tạo mới hồ sơ khách thuê và gán phòng.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {tenants.map((tenant) => (
            <div
              key={tenant.id}
              data-testid={`tenant-card-${tenant.id}`}
              className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-white p-6 transition-all duration-300 ease-in-out hover:-translate-y-1 hover:border-emerald-200/50 hover:shadow-[0_12px_40px_rgba(46,125,50,0.03)] active:scale-[0.99]"
            >
              <div>
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-emerald-100/50 bg-[#E8F5E9] text-base font-bold text-[#2E7D32]">
                      {tenant.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-base font-bold leading-tight text-slate-800">{tenant.name}</h3>
                      <Link to={`/rooms/${tenant.room?.id}`} className="mt-1 inline-block text-xs font-semibold text-[#2E7D32] hover:underline">
                        {tenant.room?.name}
                      </Link>
                    </div>
                  </div>
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${
                      tenant.active ? 'border-emerald-100 bg-emerald-50 text-emerald-700' : 'border-slate-100 bg-slate-50 text-slate-500'
                    }`}
                  >
                        {tenant.active ? 'Đang thuê' : 'Đã rời đi'}
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex items-center gap-2 font-medium text-slate-500">
                    <Phone size={14} className="text-slate-400" />
                    <span>{tenant.phone || 'Chưa lưu số điện thoại'}</span>
                  </div>
                  <div className="flex items-start gap-2 font-medium text-slate-500">
                    <Users size={14} className="mt-0.5 text-slate-400" />
                    <span>{tenant.zaloContact || 'Chưa lưu liên hệ Zalo'}</span>
                  </div>
                  <div className="flex items-center gap-2 font-medium text-slate-500">
                    <Calendar size={14} className="text-slate-400" />
                    <span>Vào ở: {formatDate(tenant.moveInDate)}</span>
                  </div>
                  <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-100/50 bg-slate-50 p-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Tiền cọc</span>
                    <span className="text-sm font-extrabold text-[#2E7D32]">{formatCurrency(tenant.deposit)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                <Link
                  to={`/tenants/${tenant.id}`}
                  data-testid={`tenant-view-detail-${tenant.id}`}
                  className="flex-1 rounded-xl border border-slate-100 px-3 py-2 text-center text-xs font-bold text-slate-600 transition-all duration-200 hover:bg-slate-50 hover:text-slate-800 active:scale-[0.98]"
                >
                  <span className="flex items-center justify-center gap-1.5">
                      <Eye size={13} /> Chi tiết
                  </span>
                </Link>
                <button
                  onClick={() => handleEdit(tenant)}
                  className="rounded-xl border border-slate-100 px-3 py-2 text-xs font-medium text-slate-500 transition-all duration-200 hover:bg-slate-50 hover:text-slate-700 active:scale-[0.98]"
                >
                  <Edit2 size={13} />
                </button>
                {tenant.active && (
                  <button
                    onClick={() => {
                      if (confirm(`Xác nhận chuyển ${tenant.name} rời khỏi phòng ${tenant.room?.name || ''}?`)) moveOut(tenant.id);
                    }}
                    data-testid={`tenant-checkout-${tenant.id}`}
                    className="flex items-center gap-1 rounded-xl border border-orange-100 px-3 py-2 text-xs font-medium text-orange-600 transition-all duration-200 hover:bg-orange-50/50 active:scale-[0.98]"
                  >
                    <UserX size={13} />
                    <span>Chuyển ra</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    if (confirm(`Xác nhận xóa hoàn toàn khách ${tenant.name}?`)) deleteTenant(tenant.id);
                  }}
                  data-testid={`tenant-delete-${tenant.id}`}
                  className="flex items-center gap-1 rounded-xl border border-red-100 px-3 py-2 text-xs font-medium text-red-600 transition-all duration-200 hover:bg-red-50/50 active:scale-[0.98]"
                >
                  <Trash2 size={13} />
                  <span>Xóa</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && <TenantForm initialData={editingTenant} onClose={handleCloseForm} />}
    </div>
  );
}
