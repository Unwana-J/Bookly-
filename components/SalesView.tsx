
import React, { useState } from 'react';
import { Transaction, FilterState, Product, Customer, SalesSource } from '../types';
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
  RotateCcw
} from 'lucide-react';
import GlobalFilterBar from './GlobalFilterBar';

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
  currency
}) => {
  const [showArchived, setShowArchived] = useState(false);

  const displayedTransactions = transactions.filter(t => t.isArchived === showArchived);

  const totalVolume = displayedTransactions.reduce((acc, t) => acc + t.total, 0);
  const totalItems = displayedTransactions.reduce((acc, t) => acc + t.quantity, 0);

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

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sales Ledger</h1>
          <p className="text-gray-500 mt-1">Audit and filter your complete history of chat commerce.</p>
        </div>
        <button 
          onClick={() => setShowArchived(!showArchived)}
          className={`h-11 px-5 rounded-2xl flex items-center gap-2 font-bold text-sm transition-all border ${
            showArchived ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-white/5 text-gray-400 border-white/10'
          }`}
        >
          {showArchived ? <Eye size={16} /> : <Archive size={16} />}
          <span>{showArchived ? 'Viewing Archives' : 'View Archived'}</span>
        </button>
      </header>

      {/* Summary Cards for Filtered Set */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="cyber-border p-5 rounded-[28px] space-y-1">
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Filtered Volume</p>
          <p className="text-xl font-black text-emerald-400 font-mono">{currency}{totalVolume.toLocaleString()}</p>
        </div>
        <div className="cyber-border p-5 rounded-[28px] space-y-1">
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Units Sold</p>
          <p className="text-xl font-black text-white font-mono">{totalItems}</p>
        </div>
        <div className="cyber-border p-5 rounded-[28px] space-y-1">
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Record Count</p>
          <p className="text-xl font-black text-blue-400 font-mono">{displayedTransactions.length}</p>
        </div>
        <div className="cyber-border p-5 rounded-[28px] space-y-1">
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Avg Ticket</p>
          <p className="text-xl font-black text-purple-400 font-mono">{currency}{displayedTransactions.length > 0 ? Math.round(totalVolume / displayedTransactions.length) : 0}</p>
        </div>
      </div>

      {/* Integrated Filters Component */}
      <div className="bg-white/[0.02] border border-white/5 p-2 rounded-[32px]">
        <GlobalFilterBar 
          filters={filters} 
          setFilters={setFilters} 
          products={products} 
          customers={customers} 
          vipThreshold={vipThreshold} 
        />
      </div>

      {/* Sales List */}
      <div className="cyber-border rounded-[32px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 text-[10px] uppercase font-black tracking-[0.2em] text-gray-600 bg-white/[0.01]">
                <th className="px-6 py-5">Date & ID</th>
                <th className="px-6 py-5">Customer</th>
                <th className="px-6 py-5">Item Details</th>
                <th className="px-6 py-5">Source</th>
                <th className="px-6 py-5 text-right">Total</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {displayedTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-gray-500 italic text-sm">
                    {showArchived ? 'No archived records found.' : 'No sales match the active filters.'}
                  </td>
                </tr>
              ) : (
                displayedTransactions.map(t => (
                  <tr key={t.id} className="group hover:bg-white/[0.03] transition-colors">
                    <td className="px-6 py-5">
                      <p className="text-xs font-bold text-white mb-1">{new Date(t.timestamp).toLocaleDateString()}</p>
                      <p className="text-[9px] font-mono text-gray-600 uppercase">#{t.id.substr(0, 8)}</p>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center">
                          <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${t.customerHandle}`} className="w-full h-full rounded-full opacity-60" />
                        </div>
                        <span className="text-xs font-mono text-gray-300">{t.customerHandle}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-xs font-bold">{t.productName}</p>
                      <p className="text-[10px] text-gray-500">Qty: {t.quantity} {t.variant && `• ${t.variant}`}</p>
                    </td>
                    <td className="px-6 py-5">
                      <div className="inline-flex items-center gap-2 px-2 py-1 rounded-lg bg-white/5 border border-white/5">
                        {getChannelIcon(t.source)}
                        <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest">{t.source}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <span className="font-mono font-black text-emerald-400 text-sm">{currency}{t.total.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => onEdit(t)}
                          className="p-2 bg-white/5 hover:bg-white text-gray-500 hover:text-black rounded-xl transition-all"
                          title="Edit Transaction"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          onClick={() => onViewInvoice(t)}
                          className="p-2 bg-white/5 hover:bg-white text-gray-500 hover:text-black rounded-xl transition-all"
                          title="View Invoice"
                        >
                          <FileText size={14} />
                        </button>
                        <button 
                          onClick={() => onArchive(t.id)}
                          className={`p-2 transition-all rounded-xl ${showArchived ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-black' : 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-black'}`}
                          title={showArchived ? "Restore Transaction" : "Archive Transaction"}
                        >
                          {showArchived ? <RotateCcw size={14} /> : <Archive size={14} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SalesView;
