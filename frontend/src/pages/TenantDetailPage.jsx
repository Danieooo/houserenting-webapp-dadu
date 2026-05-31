import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { getTenantApi, uploadTenantFileApi, deleteTenantFileApi, deleteTenantApi, moveOutTenantApi } from '../services/api';
import { formatDate, formatCurrency } from '../lib/utils';
import { ArrowLeft, Upload, Trash2, FileText, Image, ExternalLink, UserX } from 'lucide-react';

export default function TenantDetailPage() {
  const { id } = useParams();
  const qc = useQueryClient();
  const [label, setLabel] = useState('');
  const fileRef = useRef();

  const { data, isLoading } = useQuery({ queryKey: ['tenant', id], queryFn: () => getTenantApi(id) });
  const tenant = data?.data?.data;

  const { mutate: moveOutTenant, isLoading: movingOut } = useMutation({
    mutationFn: () => moveOutTenantApi(id),
    onSuccess: () => {
      toast.success('Khách đã được chuyển sang phần đã rời đi');
      qc.invalidateQueries({ queryKey: ['tenant', id] });
      qc.invalidateQueries({ queryKey: ['tenants'] });
      qc.invalidateQueries({ queryKey: ['rooms'] });
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Lỗi chuyển khách ra'),
  });

  const { mutate: deleteTenant, isLoading: deletingTenant } = useMutation({
    mutationFn: () => deleteTenantApi(id),
    onSuccess: () => {
      toast.success('Khách đã được xóa hoàn toàn');
      qc.invalidateQueries({ queryKey: ['tenant', id] });
      qc.invalidateQueries({ queryKey: ['tenants'] });
      qc.invalidateQueries({ queryKey: ['rooms'] });
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Lỗi xóa khách'),
  });

  const { mutate: uploadFile, isPending: uploading } = useMutation({
    mutationFn: ({ formData }) => uploadTenantFileApi(id, formData),
    onSuccess: () => { toast.success('Upload thành công!'); qc.invalidateQueries({ queryKey: ['tenant', id] }); setLabel(''); },
    onError: (e) => toast.error(e.response?.data?.message || 'Lỗi upload'),
  });

  const { mutate: deleteFile } = useMutation({
    mutationFn: (fileId) => deleteTenantFileApi(id, fileId),
    onSuccess: () => { toast.success('Đã xóa file'); qc.invalidateQueries({ queryKey: ['tenant', id] }); },
  });

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('label', label || file.name);
    uploadFile({ formData });
    fileRef.current.value = '';
  };

  const handleMoveOut = () => {
    if (!tenant?.room?.name) return;
    if (confirm(`Xác nhận chuyển ${tenant.name} rời khỏi phòng ${tenant.room.name}?`)) {
      moveOutTenant(tenant.id);
    }
  };

  if (isLoading) return <div className="animate-pulse h-64 bg-slate-100 rounded-2xl border border-slate-100" />;
  if (!tenant) return <p className="text-slate-400">Không tìm thấy khách thuê.</p>;

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <Link to="/tenants" className="text-slate-400 hover:text-slate-600 active:scale-[0.98] transition-all duration-200"><ArrowLeft size={20} /></Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{tenant.name}</h1>
            <p className="text-sm text-slate-500 mt-1">Phòng đang ở: <Link to={`/rooms/${tenant.room?.id}`} className="text-cobalt-royal hover:underline font-bold">{tenant.room?.name}</Link></p>
          </div>
        </div>
      </div>

      {tenant.room && (
        <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-6 shadow-[0_4px_12px_rgba(0,82,204,0.02)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-cobalt-royal font-bold mb-1">Trạng thái phòng</p>
              <p className="text-2xl font-black text-slate-800 leading-tight">Phòng {tenant.room.name}</p>
              <p className="text-xs text-slate-500 mt-2">Bắt đầu thuê: <span className="font-semibold">{formatDate(tenant.moveInDate)}</span></p>
              <p className="text-xs text-slate-500">Trạng thái: <span className={`font-semibold ${tenant.active ? 'text-emerald-600' : 'text-slate-400'}`}>{tenant.active ? 'Đang thuê hoạt động' : 'Đã rời đi'}</span></p>
            </div>
            <div className="flex flex-wrap gap-2">
              {tenant.active && (
                <button type="button" onClick={handleMoveOut} disabled={movingOut || deletingTenant}
                  className="inline-flex items-center justify-center rounded-xl bg-orange-50 border border-orange-100 px-5 py-2.5 text-xs font-bold text-orange-600 hover:bg-orange-100/50 active:scale-[0.98] transition-all duration-200">
                  {movingOut ? 'Đang chuyển...' : 'Chuyển ra'}
                </button>
              )}
              <button type="button" onClick={() => { if (confirm(`Xác nhận xóa hoàn toàn khách ${tenant.name}?`)) deleteTenant(); }} disabled={movingOut || deletingTenant}
                className="inline-flex items-center justify-center rounded-xl border border-red-100 bg-red-50/50 px-5 py-2.5 text-xs font-bold text-red-600 hover:bg-red-100 active:scale-[0.98] transition-all duration-200">
                {deletingTenant ? 'Đang xóa...' : 'Xóa hoàn toàn'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Personal Info Bento */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-100 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.01)] space-y-4">
          <h2 className="font-bold text-slate-800 text-base">Thông tin cá nhân</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              ['Số điện thoại', tenant.phone],
              ['CCCD/CMND', tenant.idCard || '-'],
              ['Ngày vào ở', formatDate(tenant.moveInDate)],
              ['Ngày kết thúc', tenant.moveOutDate ? formatDate(tenant.moveOutDate) : 'Chưa xác định'],
              ['Tiền cọc', formatCurrency(tenant.deposit)],
              ['Trạng thái', tenant.active ? '🟢 Đang thuê' : '🔴 Đã rời đi'],
            ].map(([label, value]) => (
              <div key={label} className="bg-slate-50 border border-slate-100/50 rounded-xl p-3 flex flex-col justify-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{label}</span>
                <span className="font-bold text-slate-800 text-sm mt-1">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Attachments Dropzone */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-100 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.01)]">
          <h2 className="font-bold text-slate-800 text-base mb-4">Tài liệu đính kèm</h2>

          <div className="space-y-3 mb-4">
            <input
              type="text" value={label} onChange={(e) => setLabel(e.target.value)}
              placeholder="Nhãn (VD: CCCD mặt trước)"
              className="w-full px-3.5 py-2.5 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 outline-none transition-all"
            />
            <input ref={fileRef} type="file" accept="image/*,application/pdf" onChange={handleFileSelect} className="hidden" />
            <button onClick={() => fileRef.current.click()} disabled={uploading}
              className="w-full flex flex-col items-center justify-center gap-2 border-2 border-dashed border-blue-200/60 rounded-xl py-5 text-xs text-slate-400 hover:border-blue-400 hover:text-cobalt-royal hover:bg-blue-50/10 active:scale-[0.99] transition-all duration-200 cursor-pointer">
              <Upload size={20} className="text-slate-400 animate-bounce" />
              <span className="font-bold">{uploading ? 'Đang tải lên...' : 'Chọn file (ảnh hoặc PDF, tối đa 5MB)'}</span>
            </button>
          </div>

          {tenant.files?.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-4 bg-slate-50 rounded-xl border border-slate-100/50">Chưa có tài liệu đính kèm</p>
          ) : (
            <div className="space-y-2">
              {tenant.files?.map((f) => (
                <div key={f.id} className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 text-sm hover:border-blue-100 hover:bg-blue-50/5 transition-all">
                  <a href={f.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-cobalt-royal font-bold hover:underline flex-1 min-w-0">
                    {f.url.includes('.pdf') ? <FileText size={15} /> : <Image size={15} />}
                    <span className="truncate">{f.label}</span>
                    <ExternalLink size={12} />
                  </a>
                  <button onClick={() => deleteFile(f.id)} className="ml-2 text-rose-500 hover:text-rose-700 p-1 hover:bg-rose-50 rounded-lg transition-colors">
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Invoice history */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.01)]">
        <h2 className="font-bold text-slate-800 text-base mb-4">Lịch sử hóa đơn</h2>
        {tenant.invoices?.length === 0 ? (
          <p className="text-sm text-slate-400 bg-slate-50 border border-slate-100/50 rounded-xl p-6 text-center font-medium">Chưa có hóa đơn nào được tạo</p>
        ) : (
          <div className="space-y-2">
            {tenant.invoices?.map((inv) => (
              <Link key={inv.id} to={`/invoices/${inv.id}`} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-blue-100 hover:bg-blue-50/10 active:scale-[0.98] transition-all duration-200">
                <span className="text-sm font-bold text-slate-800">Tháng {inv.month}/{inv.year}</span>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-extrabold text-slate-800">{formatCurrency(inv.totalAmount)}</span>
                  <span className={`inline-block text-[10px] px-2.5 py-0.5 rounded-full font-bold ${inv.paid ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
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
