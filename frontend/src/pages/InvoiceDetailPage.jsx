import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import { getInvoiceApi, updateInvoiceApi, markInvoicePaidApi, getInvoicePdfApi } from '../services/api';
import { formatCurrency, formatDate } from '../lib/utils';
import { ArrowLeft, Download, CheckCircle2, Edit2, Save, X } from 'lucide-react';

export default function InvoiceDetailPage() {
  const { id } = useParams();
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});

  const { data, isLoading } = useQuery({
    queryKey: ['invoice', id],
    queryFn: () => getInvoiceApi(id),
    onSuccess: (res) => {
      const inv = res.data.data;
      setForm({ electricityNow: inv.electricityNow, waterNow: inv.waterNow, otherFees: inv.otherFees, otherNote: inv.otherNote || '', note: inv.note || '' });
    }
  });

  const invoice = data?.data?.data;

  const { mutate: updateInv, isPending: updating } = useMutation({
    mutationFn: (d) => updateInvoiceApi(id, d),
    onSuccess: () => { toast.success('Cập nhật thành công!'); qc.invalidateQueries(['invoice', id]); setEditing(false); },
    onError: (e) => toast.error(e.response?.data?.message || 'Lỗi cập nhật'),
  });

  const { mutate: markPaid, isPending: paying } = useMutation({
    mutationFn: (d) => markInvoicePaidApi(id, d),
    onSuccess: () => { toast.success('Đã đánh dấu thu tiền!'); qc.invalidateQueries(['invoice', id]); },
    onError: (e) => toast.error(e.response?.data?.message || 'Lỗi'),
  });

  const downloadPdf = async () => {
    try {
      const res = await getInvoicePdfApi(id);
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hoadon-${invoice?.room?.name}-${invoice?.month}-${invoice?.year}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch { toast.error('Lỗi tải PDF'); }
  };

  if (isLoading) return <div className="animate-pulse h-64 bg-gray-100 rounded-xl" />;
  if (!invoice) return <p className="text-muted-foreground">Không tìm thấy hóa đơn.</p>;

  const elecUsed = invoice.electricityNow - invoice.electricityPrev;
  const waterUsed = invoice.waterNow - invoice.waterPrev;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link to="/invoices" className="text-muted-foreground hover:text-foreground"><ArrowLeft size={20} /></Link>
        <div>
          <h1 className="text-2xl font-bold">Hóa đơn tháng {invoice.month}/{invoice.year}</h1>
          <p className="text-sm text-muted-foreground">{invoice.room?.name} · {invoice.tenant?.name}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="p-6 border-b flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Kỳ tính: {formatDate(invoice.periodStart)} – {formatDate(invoice.periodEnd)}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={downloadPdf} className="flex items-center gap-1.5 px-3 py-2 border rounded-lg text-xs font-medium hover:bg-gray-50">
              <Download size={13} /> PDF
            </button>
            {!invoice.paid && (
              <>
                <button onClick={() => setEditing(!editing)} className="flex items-center gap-1.5 px-3 py-2 border rounded-lg text-xs font-medium hover:bg-gray-50">
                  {editing ? <><X size={13} /> Hủy</> : <><Edit2 size={13} /> Sửa</>}
                </button>
                <button onClick={() => { if (confirm('Đánh dấu đã thu tiền?')) markPaid({ paidAmount: invoice.totalAmount }); }}
                  disabled={paying} className="flex items-center gap-1.5 px-3 py-2 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 disabled:opacity-60">
                  <CheckCircle2 size={13} /> Thu tiền
                </button>
              </>
            )}
          </div>
        </div>

        <div className="p-6 space-y-3">
          {[
            ['Tiền phòng', formatCurrency(invoice.baseRent)],
            [`Điện: ${invoice.electricityPrev} → ${editing ? '?' : invoice.electricityNow} (${elecUsed} kWh × ${formatCurrency(invoice.electricityPrice)})`, formatCurrency(elecUsed * invoice.electricityPrice)],
            [`Nước: ${invoice.waterPrev} → ${editing ? '?' : invoice.waterNow} (${waterUsed} m³ × ${formatCurrency(invoice.waterPrice)})`, formatCurrency(waterUsed * invoice.waterPrice)],
            ['Rác', formatCurrency(invoice.garbageFee)],
            [`Phí khác${invoice.otherNote ? ' (' + invoice.otherNote + ')' : ''}`, formatCurrency(invoice.otherFees)],
          ].map(([label, value], i) => (
            <div key={i} className="flex justify-between text-sm py-2 border-b last:border-0">
              <span className="text-muted-foreground">{label}</span>
              <span className="font-medium">{value}</span>
            </div>
          ))}

          <div className="flex justify-between text-base font-bold pt-2">
            <span>Tổng cộng</span>
            <span className="text-primary">{formatCurrency(invoice.totalAmount)}</span>
          </div>

          <div className="pt-2">
            <span className={`inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full font-medium ${invoice.paid ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
              {invoice.paid ? <><CheckCircle2 size={14} /> Đã thu {formatCurrency(invoice.paidAmount)} ({formatDate(invoice.paidDate)})</> : '⏳ Chưa thu tiền'}
            </span>
          </div>
        </div>

        {editing && (
          <div className="p-6 border-t bg-gray-50">
            <h3 className="font-semibold text-sm mb-4">Cập nhật chỉ số</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: `Chỉ số điện hiện tại (kỳ trước: ${invoice.electricityPrev})`, key: 'electricityNow', type: 'number' },
                { label: `Chỉ số nước hiện tại (kỳ trước: ${invoice.waterPrev})`, key: 'waterNow', type: 'number' },
                { label: 'Phí khác (đ)', key: 'otherFees', type: 'number' },
                { label: 'Ghi chú phí khác', key: 'otherNote', type: 'text' },
              ].map(({ label, key, type }) => (
                <div key={key} className={key === 'otherNote' ? 'col-span-2' : ''}>
                  <label className="block text-xs font-medium mb-1 text-muted-foreground">{label}</label>
                  <input type={type} value={form[key] || ''} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              ))}
            </div>
            <button onClick={() => updateInv(form)} disabled={updating}
              className="mt-4 flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-60">
              <Save size={14} /> {updating ? 'Đang lưu...' : 'Lưu cập nhật'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
