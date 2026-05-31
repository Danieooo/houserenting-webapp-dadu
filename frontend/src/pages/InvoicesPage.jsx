import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { getInvoicesApi, bulkCreateInvoicesApi, deleteInvoiceApi, getRoomsApi } from '../services/api';
import { formatCurrency, formatDate } from '../lib/utils';
import { Plus, Trash2, Eye, FileText, Zap } from 'lucide-react';
import { SkeletonTable } from '../components/Skeleton';

function BulkCreateDialog({ onClose }) {
  const qc = useQueryClient();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [readings, setReadings] = useState({});

  const { data: roomsRes } = useQuery({ queryKey: ['rooms'], queryFn: getRoomsApi });
  const occupiedRooms = (roomsRes?.data?.data || []).filter(r => r.status === 'OCCUPIED' && r.tenants?.length > 0);

  const { mutate, isPending } = useMutation({
    mutationFn: bulkCreateInvoicesApi,
    onSuccess: (res) => {
      toast.success(res.data.message);
      qc.invalidateQueries({ queryKey: ['invoices'] });
      onClose();
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Lỗi tạo hóa đơn'),
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[24px] shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-100">
        <div className="p-6 border-b shrink-0 bg-[#FCFAF6]">
          <h2 className="text-lg font-bold flex items-center gap-2 text-slate-800">🌿 Tạo hóa đơn hàng loạt</h2>
          <p className="text-xs text-slate-400 font-semibold mt-1">Cập nhật chỉ số điện/nước mới cho tháng này</p>
        </div>
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-1.5">Tháng</label>
              <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className="w-full px-4 py-2.5 border border-slate-100 bg-slate-50/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-50 focus:border-[#2E7D32] transition-all duration-200 outline-none font-medium text-slate-700">
                {Array.from({length: 12}, (_, i) => <option key={i+1} value={i+1}>Tháng {i+1}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-1.5">Năm</label>
              <input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} className="w-full px-4 py-2.5 border border-slate-100 bg-slate-50/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-50 focus:border-[#2E7D32] transition-all duration-200 outline-none font-medium text-slate-700" />
            </div>
          </div>
          
          <div className="space-y-3">
            {occupiedRooms.length === 0 ? (
              <p className="text-sm text-center text-slate-400 py-6 bg-slate-50 rounded-2xl border border-slate-100/50 font-medium">Không có phòng nào đang thuê</p>
            ) : occupiedRooms.map(r => {
              const prevE = r.invoices?.[0]?.electricityNow || 0;
              const prevW = r.invoices?.[0]?.waterNow || 0;
              return (
                <div key={r.id} className="border border-slate-100 p-4 rounded-2xl text-sm flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between hover:bg-emerald-50/10 hover:border-emerald-100/50 transition-all duration-200">
                   <div className="font-bold text-[#2E7D32]">{r.name}</div>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-slate-400 font-bold">Điện cũ:</span>
                        <input type="number" defaultValue={prevE} 
                           className="w-16 border border-slate-100 bg-slate-50/50 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-50 focus:border-[#2E7D32] font-semibold text-slate-700 transition-all duration-200"
                           onChange={e => {
                             const current = readings[r.id] || {};
                             setReadings({...readings, [r.id]: {...current, electricityPrev: e.target.value}});
                           }} />
                        <span className="text-xs text-slate-400 font-bold ml-1">Mới:</span>
                        <input type="number" placeholder="Số mới" 
                           data-testid={`bulk-electricity-now-${r.id}`}
                           className="w-16 border border-slate-100 bg-slate-50/50 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-50 focus:border-[#2E7D32] font-semibold text-slate-700 transition-all duration-200"
                           onChange={e => {
                             const current = readings[r.id] || {};
                             setReadings({...readings, [r.id]: {...current, electricityNow: e.target.value}});
                           }} />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-slate-400 font-bold">Nước cũ:</span>
                        <input type="number" defaultValue={prevW} 
                           className="w-16 border border-slate-100 bg-slate-50/50 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-50 focus:border-[#2E7D32] font-semibold text-slate-700 transition-all duration-200"
                           onChange={e => {
                             const current = readings[r.id] || {};
                             setReadings({...readings, [r.id]: {...current, waterPrev: e.target.value}});
                           }} />
                        <span className="text-xs text-slate-400 font-bold ml-1">Mới:</span>
                        <input type="number" placeholder="Số mới" 
                           data-testid={`bulk-water-now-${r.id}`}
                           className="w-16 border border-slate-100 bg-slate-50/50 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-50 focus:border-[#2E7D32] font-semibold text-slate-700 transition-all duration-200"
                           onChange={e => {
                             const current = readings[r.id] || {};
                             setReadings({...readings, [r.id]: {...current, waterNow: e.target.value}});
                           }} />
                      </div>
                    </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="p-6 border-t shrink-0 flex gap-3 bg-[#FCFAF6]">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 bg-white border border-slate-100 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-50 active:scale-[0.98] transition-all">Hủy</button>
          <button onClick={() => mutate({ month, year, readings })} disabled={isPending || occupiedRooms.length === 0}
            data-testid="bulk-confirm-btn"
            className="flex-1 px-4 py-2.5 bg-[#2E7D32] hover:bg-[#2E7D32]/95 hover:shadow-[0_8px_20px_rgba(46,125,50,0.15)] text-white rounded-xl text-sm font-bold disabled:opacity-60 active:scale-[0.98] transition-all shadow-md">
            {isPending ? 'Đang tạo...' : 'Xác nhận tạo'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function InvoicesPage() {
  const [showBulk, setShowBulk] = useState(false);
  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterPaid, setFilterPaid] = useState('');

  const params = {};
  if (filterMonth) params.month = filterMonth;
  if (filterYear) params.year = filterYear;
  if (filterPaid !== '') params.paid = filterPaid;

  const { data, isLoading } = useQuery({ queryKey: ['invoices', params], queryFn: () => getInvoicesApi(params) });
  const qc = useQueryClient();
  const { mutate: deleteInv } = useMutation({
    mutationFn: deleteInvoiceApi,
    onSuccess: () => { toast.success('Đã xóa hóa đơn'); qc.invalidateQueries({ queryKey: ['invoices'] }); },
    onError: (e) => toast.error(e.response?.data?.message || 'Lỗi xóa hóa đơn'),
  });
  const invoices = data?.data?.data || [];
  const now = new Date();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Hóa đơn</h1>
          <p className="text-sm text-slate-500 mt-1">{invoices.length} hóa đơn</p>
        </div>
        <button onClick={() => setShowBulk(true)} data-testid="bulk-create-btn" className="flex items-center gap-2 bg-[#0052CC] hover:bg-[#0052CC]/90 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 shadow-[0_4px_12px_rgba(0,82,204,0.15)]">
          <Zap size={16} /> Tạo hàng loạt
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 bg-white rounded-2xl border border-slate-100 p-4 shadow-[0_8px_30px_rgba(0,0,0,0.01)]">
        <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} 
          className="px-3.5 py-2 border border-slate-100 bg-slate-50/50 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-50 focus:border-[#2E7D32] transition-all duration-200 outline-none bg-white text-slate-700">
          <option value="">Tất cả tháng</option>
          {Array.from({length: 12}, (_, i) => <option key={i+1} value={i+1}>Tháng {i+1}</option>)}
        </select>
        <input type="number" placeholder="Năm" value={filterYear} onChange={(e) => setFilterYear(e.target.value)}
          className="w-24 px-3.5 py-2 border border-slate-100 bg-slate-50/50 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-50 focus:border-[#2E7D32] transition-all duration-200 outline-none text-slate-700" />
        <select value={filterPaid} onChange={(e) => setFilterPaid(e.target.value)} 
          className="px-3.5 py-2 border border-slate-100 bg-slate-50/50 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-50 focus:border-[#2E7D32] transition-all duration-200 outline-none bg-white text-slate-700">
          <option value="">Tất cả trạng thái</option>
          <option value="false">Chưa thu</option>
          <option value="true">Đã thu</option>
        </select>
        <button onClick={() => { setFilterMonth(''); setFilterYear(''); setFilterPaid(''); }}
          className="px-4 py-2 border border-slate-100 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-50 active:scale-[0.98] transition-all duration-200">
          Reset bộ lọc
        </button>
      </div>

      {isLoading ? (
        <SkeletonTable />
      ) : invoices.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-[24px] border border-emerald-100/20 p-8 shadow-[0_8px_30px_rgba(0,0,0,0.01)] flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-[#E8F5E9] text-[#2E7D32] rounded-full flex items-center justify-center mb-4 border border-emerald-100/50">
            <FileText size={32} />
          </div>
          <p className="font-bold text-slate-800 text-base leading-tight">Chưa có hóa đơn nào 🌿</p>
          <p className="text-xs text-slate-400 font-semibold mt-1.5 max-w-xs text-center leading-relaxed">Hãy bấm nút "Tạo hàng loạt" ở góc trên để khởi tạo hóa đơn hàng tháng cho các phòng đang thuê.</p>
        </div>
      ) : (
        <div className="bg-white rounded-[24px] border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.01)] overflow-x-auto overflow-hidden">
          <table className="w-full min-w-[600px] text-sm">
            <thead className="bg-[#FCFAF6] border-b border-slate-100">
              <tr>{['Tháng', 'Phòng', 'Khách thuê', 'Tổng tiền', 'Trạng thái', 'Hành động'].map(h => <th key={h} className="text-left px-5 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100/80">
              {invoices.map((inv) => (
                <tr key={inv.id} data-testid={`invoice-row-${inv.month}-${inv.year}-${inv.room.name.replace(/\s+/g, '-')}`} className="hover:bg-emerald-50/10 transition-colors">
                  <td className="px-5 py-4 font-bold text-slate-800">T{inv.month}/{inv.year}</td>
                  <td className="px-5 py-4 font-semibold text-slate-700">{inv.room.name}</td>
                  <td className="px-5 py-4 font-medium text-slate-500">{inv.tenant.name}</td>
                  <td className="px-5 py-4 font-extrabold text-[#2E7D32]">{formatCurrency(inv.totalAmount)}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-block text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${inv.paid ? 'bg-green-100 text-green-700 bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-orange-100 text-orange-700 bg-rose-50 text-rose-700 border-rose-100'}`}>
                      {inv.paid ? 'Đã thu' : 'Chưa thu'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      <Link to={`/invoices/${inv.id}`} data-testid={`invoice-view-detail-${inv.id}`} className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-100 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-800 active:scale-[0.98] transition-all duration-200">
                        <Eye size={13} /> Xem
                      </Link>
                      <button onClick={() => { if (confirm('Xóa hóa đơn này?')) deleteInv(inv.id); }}
                        className="px-3 py-1.5 border border-red-100 rounded-xl text-xs font-bold text-red-600 hover:bg-rose-50/50 active:scale-[0.98] transition-all duration-200">
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showBulk && <BulkCreateDialog onClose={() => setShowBulk(false)} />}
    </div>
  );
}
