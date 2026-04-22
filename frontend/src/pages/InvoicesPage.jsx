import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { getInvoicesApi, bulkCreateInvoicesApi, deleteInvoiceApi, getRoomsApi } from '../services/api';
import { formatCurrency, formatDate } from '../lib/utils';
import { Plus, Trash2, Eye, FileText, Zap } from 'lucide-react';

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
      qc.invalidateQueries(['invoices']);
      onClose();
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Lỗi tạo hóa đơn'),
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b shrink-0">
          <h2 className="text-lg font-semibold flex items-center gap-2"><Zap size={18} className="text-yellow-500" /> Tạo hóa đơn hàng loạt</h2>
          <p className="text-xs text-muted-foreground mt-1">Cập nhật chỉ số điện/nước mới cho tháng này</p>
        </div>
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tháng</label>
              <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none">
                {Array.from({length: 12}, (_, i) => <option key={i+1} value={i+1}>Tháng {i+1}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Năm</label>
              <input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none" />
            </div>
          </div>
          
          <div className="space-y-3">
            {occupiedRooms.length === 0 ? (
              <p className="text-sm text-center text-muted-foreground py-4">Không có phòng nào đang thuê</p>
            ) : occupiedRooms.map(r => {
              const prevE = r.invoices?.[0]?.electricityNow || 0;
              const prevW = r.invoices?.[0]?.waterNow || 0;
              return (
                <div key={r.id} className="border p-3 rounded-xl text-sm flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between hover:bg-gray-50/50">
                   <div className="font-semibold text-primary">{r.name}</div>
                   <div className="flex gap-4">
                     <div className="flex items-center gap-2">
                       <span className="text-xs text-muted-foreground w-12">Điện (Cũ: {prevE})</span>
                       <input type="number" placeholder="Số mới" 
                          className="w-20 border rounded-md px-2 py-1 focus:ring-1 focus:ring-primary outline-none"
                          onChange={e => setReadings({...readings, [r.id]: {...readings[r.id], electricityNow: e.target.value}})} />
                     </div>
                     <div className="flex items-center gap-2">
                       <span className="text-xs text-muted-foreground w-12">Nước (Cũ: {prevW})</span>
                       <input type="number" placeholder="Số mới" 
                          className="w-20 border rounded-md px-2 py-1 focus:ring-1 focus:ring-primary outline-none"
                          onChange={e => setReadings({...readings, [r.id]: {...readings[r.id], waterNow: e.target.value}})} />
                     </div>
                   </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="p-6 border-t shrink-0 flex gap-3 bg-gray-50 rounded-b-2xl">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2 bg-white border rounded-lg text-sm font-medium hover:bg-gray-50 shadow-sm">Hủy</button>
          <button onClick={() => mutate({ month, year, readings })} disabled={isPending || occupiedRooms.length === 0}
            className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-60 shadow-sm">
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
    onSuccess: () => { toast.success('Đã xóa hóa đơn'); qc.invalidateQueries(['invoices']); },
    onError: (e) => toast.error(e.response?.data?.message || 'Lỗi xóa hóa đơn'),
  });
  const invoices = data?.data?.data || [];
  const now = new Date();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Hóa đơn</h1>
          <p className="text-sm text-muted-foreground mt-1">{invoices.length} hóa đơn</p>
        </div>
        <button onClick={() => setShowBulk(true)} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 shadow-sm">
          <Zap size={16} /> Tạo hàng loạt
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 bg-white rounded-xl border p-4 shadow-sm">
        <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} className="px-3 py-2 border rounded-lg text-sm focus:outline-none">
          <option value="">Tất cả tháng</option>
          {Array.from({length: 12}, (_, i) => <option key={i+1} value={i+1}>Tháng {i+1}</option>)}
        </select>
        <input type="number" placeholder="Năm" value={filterYear} onChange={(e) => setFilterYear(e.target.value)}
          className="w-24 px-3 py-2 border rounded-lg text-sm focus:outline-none" />
        <select value={filterPaid} onChange={(e) => setFilterPaid(e.target.value)} className="px-3 py-2 border rounded-lg text-sm focus:outline-none">
          <option value="">Tất cả</option>
          <option value="false">Chưa thu</option>
          <option value="true">Đã thu</option>
        </select>
        <button onClick={() => { setFilterMonth(''); setFilterYear(''); setFilterPaid(''); }}
          className="px-3 py-2 border rounded-lg text-sm hover:bg-gray-50">Reset</button>
      </div>

      {isLoading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />)}</div>
      ) : invoices.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground"><FileText size={48} className="mx-auto mb-4 opacity-30" /><p>Không có hóa đơn nào</p></div>
      ) : (
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>{['Tháng', 'Phòng', 'Khách thuê', 'Tổng tiền', 'Trạng thái', 'Hành động'].map(h => <th key={h} className="text-left px-4 py-3 font-medium text-muted-foreground">{h}</th>)}</tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="border-b last:border-0 hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 font-medium">T{inv.month}/{inv.year}</td>
                  <td className="px-4 py-3">{inv.room.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{inv.tenant.name}</td>
                  <td className="px-4 py-3 font-semibold">{formatCurrency(inv.totalAmount)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${inv.paid ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                      {inv.paid ? 'Đã thu' : 'Chưa thu'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link to={`/invoices/${inv.id}`} className="flex items-center gap-1 px-2 py-1 border rounded text-xs hover:bg-gray-50">
                        <Eye size={12} /> Xem
                      </Link>
                      <button onClick={() => { if (confirm('Xóa hóa đơn này?')) deleteInv(inv.id); }}
                        className="px-2 py-1 border border-red-200 rounded text-xs text-red-600 hover:bg-red-50">
                        <Trash2 size={12} />
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
