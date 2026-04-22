import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import { getSettingsApi, updateSettingsApi, exportInvoicesCsvApi } from '../services/api';
import { Save, Download, Settings } from 'lucide-react';

export default function SettingsPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['settings'], queryFn: getSettingsApi });
  const settings = data?.data?.data;
  const [form, setForm] = useState(null);
  const [exportYear, setExportYear] = useState(new Date().getFullYear());

  if (settings && !form) {
    setForm({ shopName: settings.shopName, address: settings.address, phone: settings.phone });
  }

  const { mutate, isPending } = useMutation({
    mutationFn: updateSettingsApi,
    onSuccess: () => { toast.success('Đã lưu cài đặt!'); qc.invalidateQueries(['settings']); },
    onError: (e) => toast.error(e.response?.data?.message || 'Lỗi lưu cài đặt'),
  });

  const handleExport = async () => {
    try {
      const res = await exportInvoicesCsvApi(exportYear);
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hoadon-${exportYear}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Đã xuất CSV!');
    } catch { toast.error('Lỗi xuất dữ liệu'); }
  };

  if (isLoading) return <div className="animate-pulse h-64 bg-gray-100 rounded-xl" />;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Settings size={24} className="text-muted-foreground" />
        <h1 className="text-2xl font-bold">Cài đặt</h1>
      </div>

      {/* Shop info */}
      <div className="bg-white rounded-xl border p-6 shadow-sm">
        <h2 className="font-semibold mb-5">Thông tin nhà trọ</h2>
        <div className="space-y-4">
          {[
            { label: 'Tên nhà trọ', key: 'shopName', placeholder: 'Nhà trọ Hoa Hồng' },
            { label: 'Địa chỉ', key: 'address', placeholder: '123 Đường ABC, Quận 1, TP.HCM' },
            { label: 'Số điện thoại', key: 'phone', placeholder: '0901234567' },
          ].map(({ label, key, placeholder }) => (
            <div key={key}>
              <label className="block text-sm font-medium mb-1">{label}</label>
              <input
                type="text"
                value={form?.[key] || ''}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                placeholder={placeholder}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
          ))}
          <button onClick={() => mutate(form)} disabled={isPending}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-60 shadow-sm">
            <Save size={15} /> {isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </div>

      {/* Export */}
      <div className="bg-white rounded-xl border p-6 shadow-sm">
        <h2 className="font-semibold mb-2">Xuất dữ liệu</h2>
        <p className="text-sm text-muted-foreground mb-4">Tải toàn bộ hóa đơn theo năm ra file CSV để backup hoặc phân tích.</p>
        <div className="flex items-center gap-3">
          <input type="number" value={exportYear} onChange={(e) => setExportYear(Number(e.target.value))}
            className="w-28 px-3 py-2 border rounded-lg text-sm focus:outline-none" />
          <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50">
            <Download size={14} /> Xuất CSV năm {exportYear}
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 text-sm">
        <h3 className="font-semibold text-blue-800 mb-2">💡 Thông tin ứng dụng</h3>
        <p className="text-blue-700">Dữ liệu được lưu trên Neon PostgreSQL và được tự động backup hàng ngày (7 ngày gần nhất).</p>
      </div>
    </div>
  );
}
