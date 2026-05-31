import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import { getSettingsApi, updateSettingsApi, exportInvoicesCsvApi } from '../services/api';
import { Save, Download, Settings } from 'lucide-react';
import { SkeletonDetail } from '../components/Skeleton';

export default function SettingsPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['settings'], queryFn: getSettingsApi });
  const settings = data?.data?.data;
  const [form, setForm] = useState(null);
  const [exportYear, setExportYear] = useState(new Date().getFullYear());

  if (settings && !form) {
    setForm({
      shopName: settings.shopName,
      address: settings.address,
      phone: settings.phone,
      paymentInfo: settings.paymentInfo || '',
      webhookUrl: settings.webhookUrl || '',
    });
  }

  const { mutate, isPending } = useMutation({
    mutationFn: updateSettingsApi,
    onSuccess: () => { toast.success('Đã lưu cài đặt!'); qc.invalidateQueries({ queryKey: ['settings'] }); },
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

  if (isLoading) return <SkeletonDetail />;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Settings size={24} className="text-[#2E7D32]" />
        <h1 className="text-2xl font-bold text-slate-900">Cài đặt</h1>
      </div>

      {/* Shop info */}
      <div className="bg-white rounded-[24px] border border-slate-100 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.01)] relative overflow-hidden group">
        {/* Elegant botanical watermark ornament */}
        <div className="absolute -right-4 -bottom-4 opacity-[0.015] text-[#2E7D32] pointer-events-none group-hover:scale-105 transition-transform duration-500 select-none">
          <svg width="110" height="110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M2 22c0 0 6-6 10-10C16 8 22 2 22 2" />
            <path d="M12 12c-3 2-6 1-10 10" />
            <path d="M12 12c2-3 1-6 10-10" />
          </svg>
        </div>
        <h2 className="font-bold text-slate-800 text-base mb-5">Thông tin nhà trọ</h2>
        <div className="space-y-4">
          {[
            { label: 'Tên nhà trọ', key: 'shopName', placeholder: 'Nhà trọ Hoa Hồng' },
            { label: 'Địa chỉ', key: 'address', placeholder: '123 Đường ABC, Quận 1, TP.HCM' },
            { label: 'Số điện thoại', key: 'phone', placeholder: '0901234567' },
          ].map(({ label, key, placeholder }) => (
            <div key={key}>
              <label className="block text-sm font-semibold text-slate-600 mb-1.5">{label}</label>
              <input
                type="text"
                value={form?.[key] || ''}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                placeholder={placeholder}
                data-testid={`settings-${key}`}
                className="w-full px-4 py-2.5 border border-slate-100 bg-slate-50/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-50 focus:border-[#2E7D32] transition-all duration-200 outline-none font-medium text-slate-700"
              />
            </div>
          ))}

          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1.5">Thông tin thanh toán / QR code</label>
            <textarea
              value={form?.paymentInfo || ''}
              onChange={(e) => setForm({ ...form, paymentInfo: e.target.value })}
              placeholder="Ví dụ: MB Bank 123456789 - Tên CK: Nguyen Van A\nHoặc nội dung QR MoMo/ZaloPay..."
              rows={4}
              data-testid="settings-paymentInfo"
              className="w-full px-4 py-2.5 border border-slate-100 bg-slate-50/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-50 focus:border-[#2E7D32] transition-all duration-200 outline-none font-medium text-slate-700"
            />
            <p className="text-xs text-slate-400 font-semibold mt-2">Nội dung này sẽ được in trên hóa đơn và mã QR sẽ được tạo tự động nếu có.</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1.5">Webhook URL (Thông báo hóa đơn)</label>
            <input
              type="text"
              value={form?.webhookUrl || ''}
              onChange={(e) => setForm({ ...form, webhookUrl: e.target.value })}
              placeholder="https://discord.com/api/webhooks/... hoặc endpoint tự động hóa"
              data-testid="settings-webhookUrl"
              className="w-full px-4 py-2.5 border border-slate-100 bg-slate-50/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-50 focus:border-[#2E7D32] transition-all duration-200 outline-none font-medium text-slate-700"
            />
            <p className="text-xs text-slate-400 font-semibold mt-2">Đường dẫn nhận dữ liệu hóa đơn tự động sang các kênh Discord/n8n/Make khi nhấn nút gửi thông báo.</p>
          </div>
          <button onClick={() => mutate(form)} disabled={isPending} data-testid="settings-save-btn"
            className="flex items-center gap-2 px-5 py-2.5 bg-[#2E7D32] hover:bg-[#2E7D32]/95 hover:shadow-[0_8px_20px_rgba(46,125,50,0.15)] text-white rounded-xl text-sm font-bold disabled:opacity-60 shadow-md active:scale-[0.98] transition-all duration-200">
            <Save size={15} /> {isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </div>

      {/* Export */}
      <div className="bg-white rounded-[24px] border border-slate-100 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.01)]">
        <h2 className="font-bold text-slate-800 text-base mb-2">Xuất dữ liệu</h2>
        <p className="text-sm text-slate-400 font-semibold mb-4">Tải toàn bộ hóa đơn theo năm ra file CSV để backup hoặc phân tích.</p>
        <div className="flex items-center gap-3">
          <input type="number" value={exportYear} onChange={(e) => setExportYear(Number(e.target.value))}
            className="w-28 px-4 py-2.5 border border-slate-100 bg-slate-50/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-50 focus:border-[#2E7D32] transition-all duration-200 outline-none font-bold text-slate-700" />
          <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2.5 border border-emerald-100 hover:border-emerald-300 hover:bg-[#E8F5E9]/30 hover:text-[#2E7D32] rounded-xl text-sm font-bold text-slate-600 active:scale-[0.98] transition-all duration-200">
            <Download size={14} /> Xuất CSV năm {exportYear}
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="bg-[#E8F5E9]/50 border border-emerald-100 rounded-[20px] p-5 text-sm">
        <h3 className="font-bold text-[#2E7D32] mb-2">💡 Thông tin ứng dụng</h3>
        <p className="text-slate-600 font-medium">Dữ liệu được lưu trên Neon PostgreSQL và được tự động backup hàng ngày (7 ngày gần nhất).</p>
      </div>
    </div>
  );
}
