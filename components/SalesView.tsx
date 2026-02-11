
import React, { useState, useMemo } from 'react';
import { Transaction, FilterState, Product, Customer, SalesSource, TransactionStatus } from '../types';
import {
  History,
  FileText,
  Trash2,
  TrendingUp,
  Package,
  CreditCard,
  MessageCircle,
  Instagram,
  Facebook,
  Store,
  Phone,
  Globe,
  Edit2,
  Archive,
  Eye,
  RotateCcw,
  Printer,
  ChevronDown,
  Circle,
  CheckCircle2,
  Clock,
  ExternalLink,
  // Fix: Added missing Check icon import
  Check
} from 'lucide-react';
import GlobalFilterBar from './GlobalFilterBar';
import LogOrderModal from './LogOrderModal';

interface SalesViewProps {
  transactions: Transaction[];
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  products: Product[];
  customers: Customer[];
  vipThreshold: number;
  onViewInvoice: (transaction: Transaction) => void;
  onArchive: (id: string) => void;
  onEdit: (transaction: Transaction) => void;
  currency: string;
  onStatusChange: (id: string, status: TransactionStatus) => void;
  onAddOrder?: (order: any) => void;
}

const SalesView: React.FC<SalesViewProps> = ({
  transactions,
  filters,
  setFilters,
  products,
  customers,
  vipThreshold,
  onViewInvoice,
  onArchive,
  onEdit,
  currency,
  onStatusChange,
  onAddOrder
}) => {
  const [showArchived, setShowArchived] = useState(false);
  const [showLogOrder, setShowLogOrder] = useState(false);

  const displayedTransactions = transactions.filter(t => t.isArchived === showArchived);

  const stats = useMemo(() => {
    const vol = displayedTransactions.reduce((acc, t) => acc + t.total, 0);
    const cost = displayedTransactions.reduce((acc, t) => acc + (t.costTotal || 0), 0);
    const delivery = displayedTransactions.reduce((acc, t) => acc + (t.deliveryFee || 0), 0);
    // Profit = Total Revenue - Cost of Goods. (Delivery Fee is considered revenue here but often offset by logistics cost)
    return { vol, profit: vol - cost - delivery, items: displayedTransactions.reduce((acc, t) => acc + t.quantity, 0) };
  }, [displayedTransactions]);

  const getChannelIcon = (channel: SalesSource) => {
    switch (channel) {
      case 'WhatsApp': return <MessageCircle size={14} className="text-green-500" />;
      case 'Instagram': return <Instagram size={14} className="text-pink-500" />;
      case 'Facebook': return <Facebook size={14} className="text-blue-500" />;
      case 'Walk-in': return <Store size={14} className="text-amber-500" />;
      case 'Phone Call': return <Phone size={14} className="text-blue-400" />;
      default: return <Globe size={14} className="text-gray-500" />;
    }
  };

  const exportPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-[#0F172A]">Sales Ledger</h1>
          <p className="text-[#64748B] mt-1 font-medium italic">Audit confirmed sales & payment health.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={exportPDF}
            className="h-11 px-5 rounded-2xl bg-[#0F172A] text-white font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:opacity-90 shadow-xl transition-all"
          >
            <Printer size={16} /> Export PDF Report
          </button>
          <button
            onClick={() => setShowLogOrder(true)}
            className="h-11 px-5 rounded-2xl bg-emerald-600 text-white font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-700 shadow-xl transition-all"
          >
            + Add Order
          </button>
          <button
            onClick={() => setShowArchived(!showArchived)}
            className={`h-11 px-5 rounded-2xl flex items-center gap-2 font-black text-xs uppercase tracking-widest transition-all border ${showArchived ? 'bg-red-50 text-red-500 border-red-200' : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-400'
              }`}
          >
            {showArchived ? <Eye size={16} /> : <Archive size={16} />}
            <span>{showArchived ? 'Archived Records' : 'Archive Bin'}</span>
          </button>
        </div>
      </header>

      {/* Log Order Modal */}
      <LogOrderModal
        open={showLogOrder}
        onClose={() => setShowLogOrder(false)}
        products={products}
        customers={customers}
        onSubmit={order => {
          if (typeof onAddOrder === 'function') {
            onAddOrder(order);
          }
        }}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="cyber-border p-6 rounded-[32px] space-y-1 bg-white">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Filtered Volume</p>
          <p className="text-2xl font-black text-[#0F172A] font-mono">{currency}{stats.vol.toLocaleString()}</p>
        </div>
        <div className="cyber-border p-6 rounded-[32px] space-y-1 bg-[#F0FDF4] border-[#2DD4BF]/20">
          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">Estimated Profit</p>
          <p className="text-2xl font-black text-emerald-600 font-mono">{currency}{stats.profit.toLocaleString()}</p>
        </div>
        <div className="cyber-border p-6 rounded-[32px] space-y-1 bg-white">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Units Sold</p>
          <p className="text-2xl font-black text-[#0F172A] font-mono">{stats.items}</p>
        </div>
        <div className="cyber-border p-6 rounded-[32px] space-y-1 bg-white">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Entries</p>
          <p className="text-2xl font-black text-[#0F172A] font-mono">{displayedTransactions.length}</p>
        </div>
      </div>

      <div className="bg-white/[0.02] border border-white/5 p-2 rounded-[32px] print:hidden">
        <GlobalFilterBar
          filters={filters}
          setFilters={setFilters}
          products={products}
          customers={customers}
          vipThreshold={vipThreshold}
        />
      </div>

      {/* Sales List Table */}
      <div className="cyber-border rounded-[32px] overflow-hidden bg-white shadow-sm border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 text-[10px] uppercase font-black tracking-[0.2em] text-gray-400 bg-gray-50/50">
                <th className="px-6 py-5">Date & Status</th>
                <th className="px-6 py-5">Lead Handle</th>
                <th className="px-6 py-5">Order Context</th>
                <th className="px-6 py-5 text-center">Net Profit</th>
                <th className="px-6 py-5 text-right">Total Invoice</th>
                <th className="px-6 py-5 text-right print:hidden">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {displayedTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-gray-400 italic text-sm">
                    {showArchived ? 'Archive is empty.' : 'No matches found.'}
                  </td>
                </tr>
              ) : (
                displayedTransactions.map(t => {
                  const profit = t.total - (t.costTotal || 0) - (t.deliveryFee || 0);
                  const isPaid = t.status === 'paid';

                  return (
                    <tr key={t.id} className="group hover:bg-emerald-50/30 transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => onStatusChange(t.id, isPaid ? 'confirmed' : 'paid')}
                            className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${isPaid ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm' : 'border-gray-200 text-transparent'}`}
                          >
                            <Check size={14} />
                          </button>
                          <div>
                            <p className="text-xs font-black text-[#0F172A]">{new Date(t.timestamp).toLocaleDateString()}</p>
                            <p className={`text-[9px] font-black uppercase tracking-widest mt-0.5 ${isPaid ? 'text-emerald-500' : 'text-amber-500'}`}>{isPaid ? 'Payment Received' : 'Pending Receipt'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono font-bold text-slate-500 tracking-tighter">{t.customerHandle}</span>
                          <div className="p-1 bg-gray-50 rounded-md">{getChannelIcon(t.source)}</div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-xs font-black text-[#0F172A]">{t.productName}</p>
                        <p className="text-[10px] font-bold text-gray-400">Qty: {t.quantity} {t.deliveryFee > 0 && `• Ship: ${currency}${t.deliveryFee}`}</p>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className={`text-[11px] font-black font-mono ${profit >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                          {currency}{profit.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <span className="font-mono font-black text-[#0F172A] text-sm">{currency}{t.total.toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-5 text-right print:hidden">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => onViewInvoice(t)} className="p-2.5 hover:bg-[#0F172A] hover:text-white rounded-xl text-gray-400 transition-all border border-transparent hover:border-gray-100">
                            <FileText size={14} />
                          </button>
                          <button onClick={() => onArchive(t.id)} className="p-2.5 hover:bg-red-500 hover:text-white rounded-xl text-gray-400 transition-all">
                            {showArchived ? <RotateCcw size={14} /> : <Archive size={14} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SalesView;
