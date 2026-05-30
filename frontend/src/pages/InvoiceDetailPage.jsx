import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import { getInvoiceApi, updateInvoiceApi, markInvoicePaidApi, getInvoicePdfApi, getSettingsApi, notifyInvoiceApi } from '../services/api';
import { formatCurrency, formatDate } from '../lib/utils';
import { ArrowLeft, Download, CheckCircle2, Edit2, Save, X, Send, MessageSquare, Share2, Copy, Check, Bell } from 'lucide-react';
import { SkeletonDetail } from '../components/Skeleton';

export default function InvoiceDetailPage() {
  const { id } = useParams();
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const { data: settingsData } = useQuery({
    queryKey: ['settings'],
    queryFn: getSettingsApi,
  });
  const settings = settingsData?.data?.data;

  const { mutate: triggerWebhook, isPending: notifying } = useMutation({
    mutationFn: () => notifyInvoiceApi(id),
    onSuccess: () => toast.success('Đã gửi thông báo qua Webhook!'),
    onError: (e) => toast.error(e.response?.data?.message || 'Lỗi gửi webhook'),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['invoice', id],
    queryFn: () => getInvoiceApi(id),
    onSuccess: (res) => {
      const inv = res.data.data;
      setForm({ electricityNow: inv.electricityNow, waterNow: inv.waterNow, otherFees: inv.otherFees, otherNote: inv.otherNote || '', note: inv.note || '' });
    }
  });

  const invoice = data?.data?.data;

  const buildMessageText = () => {
    if (!invoice) return '';
    const elecUsed = invoice.electricityNow - invoice.electricityPrev;
    const waterUsed = invoice.waterNow - invoice.waterPrev;
    const shopName = settings?.shopName || 'Nhà trọ';
    const paymentInfo = settings?.paymentInfo || 'Thông tin ngân hàng cấu hình trong Cài đặt';
    const invoiceUrl = `${window.location.origin}/invoices/${invoice.id}`;

    return `🔔 *THÔNG BÁO TIỀN PHÒNG - ${invoice.room?.name?.toUpperCase()}* 🔔

Kính gửi anh/chị *${invoice.tenant?.name}*,
Nhà trọ *${shopName}* xin thông báo tiền phòng tháng ${invoice.month}/${invoice.year} như sau:

- *Tiền phòng cơ bản:* ${formatCurrency(invoice.baseRent)}
- *Tiền điện:* ${elecUsed} kWh (${invoice.electricityPrev} → ${invoice.electricityNow}) × ${formatCurrency(invoice.electricityPrice)} = ${formatCurrency(elecUsed * invoice.electricityPrice)}
- *Tiền nước:* ${waterUsed} m³ (${invoice.waterPrev} → ${invoice.waterNow}) × ${formatCurrency(invoice.waterPrice)} = ${formatCurrency(waterUsed * invoice.waterPrice)}
- *Phí vệ sinh/rác:* ${formatCurrency(invoice.garbageFee)}
${invoice.otherFees > 0 ? `- *Phí khác (${invoice.otherNote || 'Không có'}):* ${formatCurrency(invoice.otherFees)}\n` : ''}----------------------------------
💰 *TỔNG CỘNG:* *${formatCurrency(invoice.totalAmount)}*

*Quý khách vui lòng thanh toán bằng cách quét mã QR trên hóa đơn hoặc chuyển khoản theo thông tin:*
🏦 ${paymentInfo}

👉 *Xem hóa đơn chi tiết tại:* ${invoiceUrl}`;
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(buildMessageText());
      setCopied(true);
      toast.success('Đã sao chép nội dung tin nhắn!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Lỗi sao chép');
    }
  };

  const handleSendZalo = async () => {
    await navigator.clipboard.writeText(buildMessageText());
    toast.success('Đã sao chép! Đang mở Zalo...');
    window.open(`https://zalo.me/${invoice?.tenant?.phone}`, '_blank');
  };

  const handleSendSMS = () => {
    const text = buildMessageText().replace(/\*/g, '');
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const smsUrl = `sms:${invoice?.tenant?.phone}${isIOS ? '&' : '?'}body=${encodeURIComponent(text)}`;
    window.open(smsUrl, '_blank');
  };

  const handleWebShare = async () => {
    const text = buildMessageText();
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Hóa đơn phòng ${invoice?.room?.name}`,
          text: text,
        });
        toast.success('Đã chia sẻ thành công!');
      } catch (err) {
        if (err.name !== 'AbortError') {
          toast.error('Lỗi chia sẻ');
        }
      }
    } else {
      handleCopyText();
    }
  };

  const { mutate: updateInv, isPending: updating } = useMutation({
    mutationFn: (d) => updateInvoiceApi(id, d),
    onSuccess: () => { toast.success('Cập nhật thành công!'); qc.invalidateQueries({ queryKey: ['invoice', id] }); setEditing(false); },
    onError: (e) => toast.error(e.response?.data?.message || 'Lỗi cập nhật'),
  });

  const { mutate: markPaid, isPending: paying } = useMutation({
    mutationFn: (d) => markInvoicePaidApi(id, d),
    onSuccess: () => { toast.success('Đã đánh dấu thu tiền!'); qc.invalidateQueries({ queryKey: ['invoice', id] }); },
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

  if (isLoading) return <SkeletonDetail />;
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
            <button onClick={downloadPdf} data-testid="invoice-download-pdf-btn" className="flex items-center gap-1.5 px-3 py-2 border rounded-lg text-xs font-medium hover:bg-gray-50">
              <Download size={13} /> PDF
            </button>
            <button onClick={() => setShowNotifyModal(true)} data-testid="invoice-notify-btn" className="flex items-center gap-1.5 px-3 py-2 border rounded-lg text-xs font-medium bg-primary/5 text-primary hover:bg-primary/10 border-primary/20 transition-all duration-200">
              <Bell size={13} /> Gửi thông báo
            </button>
            {!invoice.paid && (
              <>
                <button onClick={() => setEditing(!editing)} className="flex items-center gap-1.5 px-3 py-2 border rounded-lg text-xs font-medium hover:bg-gray-50">
                  {editing ? <><X size={13} /> Hủy</> : <><Edit2 size={13} /> Sửa</>}
                </button>
                <button onClick={() => { if (confirm('Đánh dấu đã thu tiền?')) markPaid({ paidAmount: invoice.totalAmount }); }}
                  data-testid="invoice-pay-btn"
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
            <span className="text-primary" data-testid="invoice-total-amount">{formatCurrency(invoice.totalAmount)}</span>
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

      {showNotifyModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border shadow-2xl max-w-lg w-full overflow-hidden transform transition-all duration-300 animate-in fade-in zoom-in-95">
            {/* Header */}
            <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Bell size={18} className="text-primary" />
                Gửi thông báo hóa đơn
              </h3>
              <button onClick={() => setShowNotifyModal(false)} data-testid="close-notify-modal-btn" className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full">
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Xem trước nội dung thông báo</label>
                <pre className="w-full bg-slate-950 text-slate-100 text-xs p-4 rounded-xl font-mono overflow-y-auto max-h-64 whitespace-pre-wrap leading-relaxed border border-slate-800 shadow-inner">
                  {buildMessageText()}
                </pre>
              </div>

              <div className="bg-amber-50 border border-amber-200/60 rounded-xl p-3 text-xs text-amber-800 flex gap-2">
                <span className="font-bold">Lưu ý Zalo:</span>
                <span>Sau khi bạn bấm "Gửi qua Zalo", hệ thống sẽ copy nội dung tin nhắn và mở khung chat với số điện thoại khách thuê. Bạn chỉ cần nhấn <strong>Ctrl+V</strong> và bấm gửi.</span>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t bg-gray-50/50 flex flex-wrap gap-2 justify-end">
              <button onClick={handleCopyText} className="flex items-center gap-1.5 px-4 py-2 border rounded-xl text-xs font-semibold bg-white hover:bg-gray-50 text-gray-700 transition-all duration-200">
                {copied ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
                {copied ? 'Đã copy!' : 'Copy tin nhắn'}
              </button>

              <button onClick={handleSendSMS} className="flex items-center gap-1.5 px-4 py-2 border rounded-xl text-xs font-semibold bg-white hover:bg-gray-50 text-gray-700 transition-all duration-200">
                <MessageSquare size={13} className="text-blue-500" />
                Gửi SMS
              </button>

              <button onClick={handleSendZalo} className="flex items-center gap-1.5 px-4 py-2 border border-blue-200 rounded-xl text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 transition-all duration-200">
                <Send size={13} />
                Gửi qua Zalo
              </button>

              <button onClick={handleWebShare} className="flex items-center gap-1.5 px-4 py-2 border border-teal-200 rounded-xl text-xs font-semibold bg-teal-50 hover:bg-teal-100 text-teal-700 transition-all duration-200">
                <Share2 size={13} />
                Chia sẻ nhanh
              </button>

              {settings?.webhookUrl && (
                <button onClick={() => triggerWebhook()} disabled={notifying} className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-semibold hover:bg-primary/95 disabled:opacity-60 shadow-md active:scale-95 transition-all duration-200">
                  <Bell size={13} />
                  {notifying ? 'Đang gửi Webhook...' : 'Đẩy Webhook'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
