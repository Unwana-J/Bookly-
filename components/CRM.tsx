import React, { useState, useMemo } from 'react';
import { Customer, Transaction, BusinessProfile } from '../types';
import { 
  Users, 
  Search, 
  MessageCircle, 
  Instagram, 
  Facebook,
  Phone,
  User,
  ChevronRight,
  TrendingUp,
  History,
  X,
  CreditCard,
  Package,
  Calendar,
  MapPin,
  ExternalLink,
  ChevronLeft,
  Star,
  Zap,
  Award,
  Plus,
  FileText
} from 'lucide-react';

interface CRMProps {
  customers: Customer[];
  transactions: Transaction[];
  businessProfile: BusinessProfile | null;
  onOpenAddCustomer?: () => void;
  onViewInvoice: (transaction: Transaction) => void;
}

const CRM: React.FC<CRMProps> = ({ customers, transactions, businessProfile, onOpenAddCustomer, onViewInvoice }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const vipThreshold = businessProfile?.vipThreshold || 5;

  const getTier = (orderCount: number) => {
    if (orderCount >= vipThreshold) return { label: 'VIP', color: 'text-amber-400 bg-amber-400/10 border-amber-400/20', icon: <Award size={10} /> };
    if (orderCount > 1) return { label: 'Returning', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20', icon: <History size={10} /> };
    return { label: 'New', color: 'text-blue-500 bg-blue-500/10 border-blue-500/20', icon: <Zap size={10} /> };
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.handle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getChannelIcon = (channel: string, size = 14) => {
    switch (channel) {
      case 'WhatsApp': return <MessageCircle size={size} className="text-green-500" />;
      case 'Instagram': return <Instagram size={size} className="text-pink-500" />;
      case 'Facebook': return <Facebook size={size} className="text-blue-500" />;
      case 'Phone Call': return <Phone size={size} className="text-blue-400" />;
      default: return <User size={size} className="text-gray-400" />;
    }
  };

  const customerTransactions = useMemo(() => {
    if (!selectedCustomer) return [];
    return transactions.filter(t => t.customerHandle === selectedCustomer.handle)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [selectedCustomer, transactions]);

  const avgOrderValue = useMemo(() => {
    if (!selectedCustomer || selectedCustomer.orderCount === 0) return 0;
    return Math.round(selectedCustomer.ltv / selectedCustomer.orderCount);
  }, [selectedCustomer]);

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500 relative">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-[#0F172A]">Unified CRM</h1>
          <p className="text-[#64748B] mt-1 font-medium">Transforming chat threads into a professional customer ledger.</p>
        </div>
        <button 
          onClick={() => onOpenAddCustomer?.()}
          className="h-12 px-6 bg-[#0F172A] text-white font-black rounded-2xl flex items-center justify-center space-x-2 hover:opacity-90 active:scale-95 transition-all shadow-xl"
        >
          <Plus size={20} />
          <span>New Profile</span>
        </button>
      </header>

      {/* CRM Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <div className="cyber-border p-5 rounded-3xl text-center card-shadow">
          <p className="text-[10px] text-[#64748B] uppercase font-black tracking-widest mb-1">Total Profiles</p>
          <p className="text-2xl font-black text-[#0F172A]">{customers.length}</p>
        </div>
        <div className="cyber-border p-5 rounded-3xl text-center card-shadow">
          <p className="text-[10px] text-[#64748B] uppercase font-black tracking-widest mb-1">VIP Count</p>
          <p className="text-2xl font-black text-amber-500">{customers.filter(c => c.orderCount >= vipThreshold).length}</p>
        </div>
        <div className="cyber-border p-5 rounded-3xl text-center card-shadow">
          <p className="text-[10px] text-[#64748B] uppercase font-black tracking-widest mb-1">Avg. LTV</p>
          <p className="text-2xl font-black font-mono text-emerald-600">${Math.round(customers.reduce((s, c) => s + c.ltv, 0) / (customers.length || 1))}</p>
        </div>
        <div className="cyber-border p-5 rounded-3xl text-center card-shadow">
          <p className="text-[10px] text-[#64748B] uppercase font-black tracking-widest mb-1">Active Today</p>
          <p className="text-2xl font-black text-[#0F172A]">4</p>
        </div>
      </div>

      {/* Directory Table */}
      <div className="cyber-border rounded-[32px] overflow-hidden card-shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#0F172A]/5 text-[10px] uppercase font-black tracking-[0.2em] text-[#64748B] bg-[#0F172A]/[0.01]">
                <th className="px-6 py-5">Buyer Identification</th>
                <th className="px-6 py-5">Tier Status</th>
                <th className="px-6 py-5">Lifetime Value</th>
                <th className="px-6 py-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#0F172A]/5">
              {filteredCustomers.map(customer => {
                const tier = getTier(customer.orderCount);
                return (
                  <tr 
                    key={customer.id} 
                    className="group hover:bg-[#F0FDF4] transition-colors cursor-pointer"
                    onClick={() => setSelectedCustomer(customer)}
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-[#0F172A]/5 border border-[#0F172A]/5 flex items-center justify-center font-black text-[#0F172A]">
                          {customer.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-black text-sm text-[#0F172A] leading-none mb-1.5">{customer.name}</p>
                          <div className="flex items-center space-x-2">
                            {getChannelIcon(customer.channel)}
                            <span className="text-[10px] text-[#64748B] font-mono tracking-tighter">{customer.handle}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${tier.color}`}>
                        {tier.label}
                      </div>
                    </td>
                    <td className="px-6 py-5 font-mono font-black text-emerald-600 text-sm">
                      ${customer.ltv}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button className="w-8 h-8 rounded-full bg-[#0F172A]/5 flex items-center justify-center group-hover:bg-[#0F172A] group-hover:text-white transition-all">
                        <ChevronRight size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-over Detail Panel */}
      {selectedCustomer && (
        <>
          <div className="fixed inset-0 bg-[#0F172A]/60 backdrop-blur-sm z-[150] animate-in fade-in" onClick={() => setSelectedCustomer(null)} />
          <div className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-[#0F172A] z-[160] shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col">
            <div className="p-8 border-b border-white/10 flex items-center justify-between bg-white/5">
              <div className="flex items-center gap-4">
                <button onClick={() => setSelectedCustomer(null)} className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center text-slate-300">
                  <ChevronLeft size={20} />
                </button>
                <h2 className="font-black text-xl text-white tracking-tight">Profile Insight</h2>
              </div>
              <button onClick={() => setSelectedCustomer(null)} className="p-2 hover:bg-white/10 rounded-full text-slate-400">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-24 h-24 rounded-[32px] bg-white/10 border border-white/10 flex items-center justify-center text-4xl font-black text-[#2DD4BF]">
                   {selectedCustomer.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white">{selectedCustomer.name}</h3>
                  <p className="text-xs text-slate-400 font-mono mt-1 font-semibold">{selectedCustomer.handle} • Since {selectedCustomer.lastActive}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white/5 border border-white/10 p-4 rounded-3xl text-center">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Lifetime</p>
                  <p className="text-lg font-mono font-black text-[#2DD4BF]">${selectedCustomer.ltv}</p>
                </div>
                <div className="bg-white/5 border border-white/10 p-4 rounded-3xl text-center">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Orders</p>
                  <p className="text-lg font-mono font-black text-white">{selectedCustomer.orderCount}</p>
                </div>
                <div className="bg-white/5 border border-white/10 p-4 rounded-3xl text-center">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Avg Ticket</p>
                  <p className="text-lg font-mono font-black text-white">${avgOrderValue}</p>
                </div>
              </div>

              <div className="space-y-6">
                 <div className="space-y-3">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Shipping Log</h4>
                    <div className="bg-white/5 border border-white/10 p-5 rounded-3xl flex items-start gap-4">
                       <MapPin size={18} className="text-[#2DD4BF] mt-0.5" />
                       <p className="text-sm text-slate-200 leading-relaxed font-medium italic">{selectedCustomer.address || 'No primary address on file.'}</p>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Recent Orders</h4>
                    <div className="space-y-3">
                       {customerTransactions.map(t => (
                         <div key={t.id} className="bg-white/5 border border-white/10 p-5 rounded-3xl flex items-center justify-between">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 bg-black/20 rounded-xl flex items-center justify-center text-slate-400 border border-white/5">
                                  <Calendar size={18} />
                               </div>
                               <div>
                                  <p className="text-sm font-black text-white">{t.productName}</p>
                                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{new Date(t.timestamp).toLocaleDateString()}</p>
                               </div>
                            </div>
                            <div className="text-right">
                               <p className="font-mono font-black text-[#2DD4BF] text-sm">${t.total}</p>
                               <button onClick={() => onViewInvoice(t)} className="text-[9px] font-black text-slate-400 uppercase underline mt-1 hover:text-white transition-colors">Receipt</button>
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>
              </div>
            </div>

            <div className="p-8 border-t border-white/10 bg-white/5">
               <button className="w-full h-14 bg-[#2DD4BF] text-[#0F172A] font-black rounded-2xl flex items-center justify-center gap-2 shadow-xl hover:scale-[1.02] transition-all">
                  <MessageCircle size={18} />
                  <span>Reach out via {selectedCustomer.channel}</span>
               </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CRM;