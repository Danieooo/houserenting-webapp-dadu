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

    return `🔔 *THÔNG BÁO TIỀN PHÒNG - ${invoice.room?.name?.toUpperCase()}* 🔔

Kính gửi *${invoice.tenant?.name}*,
Nhà trọ *${shopName}* thông báo tiền phòng tháng ${invoice.month}/${invoice.year} như sau:

- *Tiền phòng:* ${formatCurrency(invoice.baseRent)}
- *Tiền điện:* ${elecUsed} kWh (${invoice.electricityPrev} → ${invoice.electricityNow}) × ${formatCurrency(invoice.electricityPrice)} = ${formatCurrency(elecUsed * invoice.electricityPrice)}
- *Tiền nước:* ${waterUsed} m³ (${invoice.waterPrev} → ${invoice.waterNow}) × ${formatCurrency(invoice.waterPrice)} = ${formatCurrency(waterUsed * invoice.waterPrice)}
- *Phí vệ sinh/rác:* ${formatCurrency(invoice.garbageFee)}
${invoice.otherFees > 0 ? `- *Phí khác (${invoice.otherNote || 'Không có'}):* ${formatCurrency(invoice.otherFees)}\n` : ''}----------------------------------
💰 *TỔNG CỘNG:* *${formatCurrency(invoice.totalAmount)}*

*Quý khách vui lòng thanh toán bằng cách quét mã QR trên file PDF đính kèm hoặc chuyển khoản theo thông tin:*
🏦 ${paymentInfo}`;
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
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <Link to="/invoices" className="text-slate-400 hover:text-slate-600 active:scale-[0.98] transition-all duration-200"><ArrowLeft size={20} /></Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Hóa đơn tháng {invoice.month}/{invoice.year}</h1>
            <p className="text-sm text-slate-500 mt-1">{invoice.room?.name} · {invoice.tenant?.name}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.01)] overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-wrap gap-4 items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Kỳ tính toán</span>
            <p className="text-sm font-semibold text-slate-600 mt-0.5">{formatDate(invoice.periodStart)} – {formatDate(invoice.periodEnd)}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={downloadPdf} data-testid="invoice-download-pdf-btn" className="flex items-center gap-1.5 px-4 py-2 border border-slate-100 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 active:scale-[0.98] transition-all duration-200">
              <Download size={13} /> PDF
            </button>
            <button onClick={() => setShowNotifyModal(true)} data-testid="invoice-notify-btn" className="flex items-center gap-1.5 px-4 py-2 bg-[#E8F5E9] border border-emerald-100/50 text-[#2E7D32] rounded-xl text-xs font-bold hover:bg-[#E8F5E9]/80 active:scale-[0.98] transition-all duration-200">
              <Bell size={13} /> Gửi thông báo
            </button>
            {!invoice.paid && (
              <>
                <button onClick={() => setEditing(!editing)} className="flex items-center gap-1.5 px-4 py-2 border border-slate-100 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 active:scale-[0.98] transition-all duration-200">
                  {editing ? <><X size={13} /> Hủy</> : <><Edit2 size={13} /> Sửa</>}
                </button>
                <button onClick={() => { if (confirm('Đánh dấu đã thu tiền?')) markPaid({ paidAmount: invoice.totalAmount }); }}
                  data-testid="invoice-pay-btn"
                  disabled={paying} className="flex items-center gap-1.5 px-4 py-2 bg-[#E8F5E9] border border-emerald-200/50 text-[#2E7D32] rounded-xl text-xs font-bold hover:bg-emerald-100/50 active:scale-[0.98] transition-all duration-200">
                  <CheckCircle2 size={13} /> Thu tiền
                </button>
              </>
            )}
          </div>
        </div>

        <div className="p-6 space-y-4">
          {[
            ['Tiền phòng cơ bản', '-', formatCurrency(invoice.baseRent)],
            [`Tiền điện (Chỉ số: ${invoice.electricityPrev} → ${editing ? '?' : invoice.electricityNow})`, `${elecUsed} kWh × ${formatCurrency(invoice.electricityPrice)}`, formatCurrency(elecUsed * invoice.electricityPrice)],
            [`Tiền nước (Chỉ số: ${invoice.waterPrev} → ${editing ? '?' : invoice.waterNow})`, `${waterUsed} m³ × ${formatCurrency(invoice.waterPrice)}`, formatCurrency(waterUsed * invoice.waterPrice)],
            ['Phí rác / vệ sinh', '-', formatCurrency(invoice.garbageFee)],
            [`Phí dịch vụ khác${invoice.otherNote ? ' (' + invoice.otherNote + ')' : ''}`, '-', formatCurrency(invoice.otherFees)],
          ].map(([label, sub, value], i) => (
            <div key={i} className="flex justify-between items-center py-3.5 border-b border-dashed border-emerald-100/50 last:border-0 text-sm">
              <div className="flex flex-col">
                <span className="font-bold text-slate-800">{label}</span>
                {sub && sub !== '-' && <span className="text-[10px] text-slate-400 font-semibold mt-0.5">{sub}</span>}
              </div>
              <span className="font-extrabold text-slate-800">{value}</span>
            </div>
          ))}

          <div className="flex justify-between items-center text-base font-black pt-4 border-t border-slate-100">
            <span className="text-slate-800">TỔNG CỘNG HÓA ĐƠN</span>
            <span className="text-2xl font-black text-[#0052CC]" data-testid="invoice-total-amount">{formatCurrency(invoice.totalAmount)}</span>
          </div>

          <div className="pt-4">
            <span className={`inline-flex items-center gap-1.5 text-xs px-3.5 py-2 rounded-full font-bold border ${invoice.paid ? 'bg-green-100 text-green-700 bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-orange-100 text-orange-700 bg-[#FFF3E0] text-[#E65100] border-orange-200/50'}`}>
              {invoice.paid ? <><CheckCircle2 size={14} className="text-emerald-600" /> Đã thu {formatCurrency(invoice.paidAmount)} ({formatDate(invoice.paidDate)})</> : '⏳ Chưa thu tiền'}
            </span>
          </div>
        </div>

        {editing && (
          <div className="p-6 border-t border-slate-100 bg-[#FCFAF6]">
            <h3 className="font-bold text-sm mb-4 text-slate-800">Cập nhật chỉ số</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: `Chỉ số điện hiện tại (kỳ trước: ${invoice.electricityPrev})`, key: 'electricityNow', type: 'number' },
                { label: `Chỉ số nước hiện tại (kỳ trước: ${invoice.waterPrev})`, key: 'waterNow', type: 'number' },
                { label: 'Phí khác (đ)', key: 'otherFees', type: 'number' },
                { label: 'Ghi chú phí khác', key: 'otherNote', type: 'text' },
              ].map(({ label, key, type }) => (
                <div key={key} className={key === 'otherNote' ? 'col-span-2' : ''}>
                  <label className="block text-xs font-bold mb-1.5 text-slate-400 uppercase tracking-wider">{label}</label>
                  <input type={type} value={form[key] || ''} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-100 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-50 focus:border-[#2E7D32] outline-none transition-all duration-200" />
                </div>
              ))}
            </div>
            <button onClick={() => updateInv(form)} disabled={updating}
              className="mt-4 flex items-center gap-2 px-5 py-2.5 bg-[#2E7D32] hover:bg-[#2E7D32]/95 hover:shadow-[0_8px_20px_rgba(46,125,50,0.15)] text-white rounded-xl text-xs font-bold hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 shadow-md disabled:opacity-60">
              <Save size={14} /> {updating ? 'Đang lưu...' : 'Lưu cập nhật'}
            </button>
          </div>
        )}
      </div>

      {showNotifyModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white/75 border border-white/30 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] max-w-lg w-full overflow-hidden transform transition-all duration-300 animate-in fade-in zoom-in-95 backdrop-blur-md">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white/50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Bell size={18} className="text-[#2E7D32]" />
                Gửi thông báo hóa đơn
              </h3>
              <button onClick={() => setShowNotifyModal(false)} data-testid="close-notify-modal-btn" className="text-slate-400 hover:text-slate-600 transition-colors p-1.5 hover:bg-slate-100 rounded-full">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Xem trước nội dung thông báo</label>
                <pre className="w-full bg-slate-950 text-slate-100 text-xs p-4 rounded-xl font-mono overflow-y-auto max-h-64 whitespace-pre-wrap leading-relaxed border border-slate-800 shadow-inner">
                  {buildMessageText()}
                </pre>
              </div>

              <div className="bg-[#E8F5E9]/50 border border-emerald-100 text-[#2E7D32] rounded-xl p-3.5 text-xs flex gap-2">
                <span className="font-bold">Lưu ý Zalo:</span>
                <span>Sau khi bấm "Gửi qua Zalo", nội dung tin nhắn sẽ tự động copy vào bộ nhớ tạm và mở Zalo khách trọ. Bạn chỉ cần bấm <strong>Ctrl+V</strong> và gửi đi.</span>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 bg-white/50 flex flex-wrap gap-2 justify-end">
              <button onClick={handleCopyText} className="flex items-center gap-1.5 px-4 py-2 border border-slate-100 bg-white rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 active:scale-[0.98] transition-all duration-200">
                {copied ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
                {copied ? 'Đã copy!' : 'Copy tin nhắn'}
              </button>

              <button onClick={handleSendSMS} className="flex items-center gap-1.5 px-4 py-2 border border-slate-100 bg-white rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 active:scale-[0.98] transition-all duration-200">
                <MessageSquare size={13} className="text-slate-500" />
                Gửi SMS
              </button>

              <button onClick={handleSendZalo} className="flex items-center gap-1.5 px-4 py-2 border border-emerald-200/50 rounded-xl text-xs font-bold bg-[#E8F5E9] hover:bg-[#E8F5E9]/80 text-[#2E7D32] transition-all duration-200 active:scale-[0.98]">
                <Send size={13} />
                Gửi qua Zalo
              </button>

              <button onClick={handleWebShare} className="flex items-center gap-1.5 px-4 py-2 border border-orange-200/50 rounded-xl text-xs font-bold bg-[#FFF3E0] hover:bg-[#FFE0B2] text-[#E65100] transition-all duration-200 active:scale-[0.98]">
                <Share2 size={13} />
                Chia sẻ nhanh
              </button>

              {settings?.webhookUrl && (
                <button onClick={() => triggerWebhook()} disabled={notifying} className="flex items-center gap-1.5 px-4 py-2 bg-[#0052CC] hover:bg-[#0052CC]/90 text-white rounded-xl text-xs font-bold hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 shadow-[0_4px_12px_rgba(0,82,204,0.15)] disabled:opacity-60">
                  <Bell size={13} className={notifying ? "animate-pulse" : ""} />
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
