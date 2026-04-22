import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { getTenantApi, uploadTenantFileApi, deleteTenantFileApi } from '../services/api';
import { formatDate, formatCurrency } from '../lib/utils';
import { ArrowLeft, Upload, Trash2, FileText, Image, ExternalLink } from 'lucide-react';

export default function TenantDetailPage() {
  const { id } = useParams();
  const qc = useQueryClient();
  const [label, setLabel] = useState('');
  const fileRef = useRef();

  const { data, isLoading } = useQuery({ queryKey: ['tenant', id], queryFn: () => getTenantApi(id) });
  const tenant = data?.data?.data;

  const { mutate: uploadFile, isPending: uploading } = useMutation({
    mutationFn: ({ formData }) => uploadTenantFileApi(id, formData),
    onSuccess: () => { toast.success('Upload thành công!'); qc.invalidateQueries(['tenant', id]); setLabel(''); },
    onError: (e) => toast.error(e.response?.data?.message || 'Lỗi upload'),
  });

  const { mutate: deleteFile } = useMutation({
    mutationFn: (fileId) => deleteTenantFileApi(id, fileId),
    onSuccess: () => { toast.success('Đã xóa file'); qc.invalidateQueries(['tenant', id]); },
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

  if (isLoading) return <div className="animate-pulse h-64 bg-gray-100 rounded-xl" />;
  if (!tenant) return <p className="text-muted-foreground">Không tìm thấy khách thuê.</p>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link to="/tenants" className="text-muted-foreground hover:text-foreground"><ArrowLeft size={20} /></Link>
        <div>
          <h1 className="text-2xl font-bold">{tenant.name}</h1>
          <p className="text-sm text-muted-foreground">Phòng: <Link to={`/rooms/${tenant.room?.id}`} className="text-primary hover:underline">{tenant.room?.name}</Link></p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border p-6 shadow-sm space-y-3">
          <h2 className="font-semibold">Thông tin cá nhân</h2>
          {[
            ['Số điện thoại', tenant.phone],
            ['CCCD/CMND', tenant.idCard || '-'],
            ['Ngày vào ở', formatDate(tenant.moveInDate)],
            ['Ngày kết thúc', tenant.moveOutDate ? formatDate(tenant.moveOutDate) : 'Chưa xác định'],
            ['Tiền cọc', formatCurrency(tenant.deposit)],
            ['Trạng thái', tenant.active ? '🟢 Đang thuê' : '🔴 Đã rời đi'],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between text-sm">
              <span className="text-muted-foreground">{label}</span>
              <span className="font-medium">{value}</span>
            </div>
          ))}
        </div>

        {/* File upload */}
        <div className="bg-white rounded-xl border p-6 shadow-sm">
          <h2 className="font-semibold mb-4">Tài liệu đính kèm</h2>

          <div className="space-y-2 mb-4">
            <input
              type="text" value={label} onChange={(e) => setLabel(e.target.value)}
              placeholder="Nhãn (VD: CCCD mặt trước)"
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <input ref={fileRef} type="file" accept="image/*,application/pdf" onChange={handleFileSelect} className="hidden" />
            <button onClick={() => fileRef.current.click()} disabled={uploading}
              className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-lg py-3 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors disabled:opacity-60">
              <Upload size={16} />
              {uploading ? 'Đang upload...' : 'Chọn file (ảnh hoặc PDF, max 5MB)'}
            </button>
          </div>

          {tenant.files?.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center">Chưa có tài liệu</p>
          ) : (
            <div className="space-y-2">
              {tenant.files?.map((f) => (
                <div key={f.id} className="flex items-center justify-between p-2 rounded-lg border text-sm">
                  <a href={f.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline flex-1 min-w-0">
                    {f.url.includes('.pdf') ? <FileText size={14} /> : <Image size={14} />}
                    <span className="truncate">{f.label}</span>
                    <ExternalLink size={11} />
                  </a>
                  <button onClick={() => deleteFile(f.id)} className="ml-2 text-red-500 hover:text-red-700">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Invoice history */}
      <div className="bg-white rounded-xl border p-6 shadow-sm">
        <h2 className="font-semibold mb-4">Lịch sử hóa đơn</h2>
        {tenant.invoices?.length === 0 ? (
          <p className="text-sm text-muted-foreground">Chưa có hóa đơn</p>
        ) : (
          <div className="space-y-2">
            {tenant.invoices?.map((inv) => (
              <Link key={inv.id} to={`/invoices/${inv.id}`} className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50">
                <span className="text-sm font-medium">Tháng {inv.month}/{inv.year}</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold">{formatCurrency(inv.totalAmount)}</span>
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
