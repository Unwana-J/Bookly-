import React, { useState, useMemo } from 'react';
import { Product, Customer, Transaction, AppView, BusinessProfile, Expense, DashboardWidget, WidgetType } from '../types';
import { 
  TrendingUp, 
  Users as UsersIcon, 
  Clock,
  DollarSign,
  PieChart as PieChartIcon,
  Target,
  Wallet,
  Settings,
  Eye,
  ChevronUp,
  ChevronDown,
  X,
  Trophy,
  Activity,
  Plus,
  AlertCircle,
  Package,
  ArrowRight,
  Zap,
  Check,
  ShoppingCart
} from 'lucide-react';
import { 
  Tooltip,
  Cell,
  PieChart,
  Pie,
  ResponsiveContainer
} from 'recharts';

interface DashboardProps {
  products: Product[];
  customers: Customer[];
  transactions: Transaction[];
  expenses: Expense[];
  onNavigate: (view: AppView) => void;
  businessProfile: BusinessProfile | null;
  onOpenManualSale: () => void;
}

const COLORS = ['#2DD4BF', '#0F172A', '#64748B', '#14B8A6', '#334155', '#94A3B8'];

const VendorLogo: React.FC<{ profile: BusinessProfile | null }> = ({ profile }) => {
  if (profile?.logo) {
    return (
      <div className="h-12 w-auto max-w-[160px] flex items-center justify-center overflow-hidden rounded-xl border border-[#0F172A]/5">
        <img src={profile.logo} alt={profile.name} className="h-full w-full object-contain" />
      </div>
    );
  }

  const initials = profile?.name?.split(' ').map(n => n[0]).join('').substr(0, 2).toUpperCase() || 'B';
  return (
    <div className="h-12 w-12 bg-[#2DD4BF] flex items-center justify-center rounded-2xl shadow-lg transform -rotate-3 hover:rotate-0 transition-transform cursor-default">
      <span className="text-[#0F172A] font-black text-xl leading-none">{initials}</span>
    </div>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ products, customers, transactions, expenses, onNavigate, businessProfile, onOpenManualSale }) => {
  const currency = businessProfile?.currency === 'NGN' ? '₦' : '$';

  const metrics = useMemo(() => {
    const revenue = transactions.reduce((sum, t) => sum + t.total, 0);
    const cogs = transactions.reduce((sum, t) => sum + (t.costTotal || 0), 0);
    const overhead = expenses.reduce((sum, e) => sum + e.amount, 0);
    const netProfit = revenue - cogs - overhead;
    const margin = revenue > 0 ? (netProfit / revenue) * 100 : 0;
    return { revenue, netProfit, overhead, margin, count: transactions.length };
  }, [transactions, expenses]);

  const channelData = useMemo(() => {
    const map = new Map<string, number>();
    transactions.forEach(t => map.set(t.source, (map.get(t.source) || 0) + t.total));
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  const lowStockItems = useMemo(() => products.filter(p => p.stock < (businessProfile?.stockThreshold || 5)), [products, businessProfile]);

  return (
    <div className="flex flex-col animate-in fade-in duration-500 pb-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 text-left">
        <div className="flex items-center gap-5">
          <VendorLogo profile={businessProfile} />
          <div className="h-10 w-[1px] bg-[#0F172A]/10 hidden md:block"></div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-[#0F172A] leading-tight">
              {businessProfile?.name || 'My Hub'}
            </h1>
            <p className="text-[#64748B] text-sm font-medium italic">Audit confirmed sales & social channel health.</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard label="Gross Revenue" value={`${currency}${metrics.revenue.toLocaleString()}`} trend={`${metrics.count} sales`} icon={<TrendingUp className="text-[#2DD4BF]" size={18} />} />
        <StatCard label="Overhead" value={`${currency}${metrics.overhead.toLocaleString()}`} trend="Logged costs" icon={<Wallet className="text-red-500" size={18} />} />
        <StatCard label="Net Profit" value={`${currency}${metrics.netProfit.toLocaleString()}`} trend={`${Math.round(metrics.margin)}% margin`} icon={<DollarSign className="text-[#0F172A]" size={18} />} />
        <StatCard label="Contacts" value={customers.length.toString()} trend="Active directory" icon={<UsersIcon className="text-[#64748B]" size={18} />} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="cyber-border p-6 space-y-6 card-shadow">
          <h2 className="text-xl font-black text-[#0F172A] flex justify-between items-center">Quick Actions <Zap size={20} className="text-[#2DD4BF]" /></h2>
          <div className="grid grid-cols-2 gap-3">
            <ActionButton icon={<ShoppingCart size={18} />} label="New Sale" onClick={onOpenManualSale} color="bg-emerald-500" />
            <ActionButton icon={<Plus size={18} />} label="Add Stock" onClick={() => onNavigate('inventory')} color="bg-[#0F172A]" />
            <ActionButton icon={<UsersIcon size={18} />} label="New Lead" onClick={() => onNavigate('crm')} color="bg-[#64748B]" />
            <ActionButton icon={<DollarSign size={18} />} label="Log Expense" onClick={() => onNavigate('expenses')} color="bg-red-500" />
          </div>
        </div>

        <div className="cyber-border p-6 space-y-6 card-shadow available-cue">
          <h2 className="text-xl font-black text-[#0F172A] flex justify-between items-center">Inventory <Package size={20} className="text-[#0F172A]" /></h2>
          <div className="space-y-4">
            <div className="bg-[#F0FDF4] p-4 rounded-2xl flex items-center justify-between border border-[#2DD4BF]/20">
              <div>
                <p className="text-[10px] font-black uppercase text-[#64748B]">Total Items</p>
                <p className="text-xl font-black text-[#0F172A]">{products.length}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black uppercase text-[#64748B]">Total Units</p>
                <p className="text-xl font-black text-[#2DD4BF]">{products.reduce((s, p) => s + p.stock, 0)}</p>
              </div>
            </div>
            {lowStockItems.length > 0 ? (
              <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-100 rounded-2xl">
                <AlertCircle size={18} className="text-red-500" />
                <p className="text-xs font-bold text-red-600">{lowStockItems.length} items low</p>
                <button onClick={() => onNavigate('inventory')} className="ml-auto text-xs font-black uppercase text-[#64748B] hover:text-[#0F172A]"><ArrowRight size={14} /></button>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3 bg-[#F0FDF4] border border-[#2DD4BF]/20 rounded-2xl">
                <Check size={18} className="text-[#2DD4BF]" />
                <p className="text-xs font-bold text-[#2DD4BF]">Inventory Healthy</p>
              </div>
            )}
          </div>
        </div>

        <div className="cyber-border p-6 space-y-6 card-shadow">
          <h2 className="text-xl font-black text-[#0F172A] flex justify-between items-center">Channels <PieChartIcon size={20} className="text-[#64748B]" /></h2>
          <div className="h-[200px] w-full">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={channelData} innerRadius={55} outerRadius={80} paddingAngle={5} dataKey="value">
                  {channelData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{backgroundColor: '#fff', border: '1px solid #eee', borderRadius: '12px', fontSize: '10px'}} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ label: string, value: string, trend: string, icon: React.ReactNode }> = ({ label, value, trend, icon }) => (
  <div className="cyber-border p-6 hover-lift group relative overflow-hidden">
    <div className="w-10 h-10 rounded-2xl bg-[#F0FDF4] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">{icon}</div>
    <p className="text-[10px] font-black text-[#64748B] uppercase tracking-widest">{label}</p>
    <h3 className="text-2xl font-black text-[#0F172A] leading-tight">{value}</h3>
    <p className="text-[9px] font-black text-[#2DD4BF] uppercase tracking-widest pt-1">{trend}</p>
  </div>
);

const ActionButton: React.FC<{ icon: React.ReactNode, label: string, onClick: () => void, color: string }> = ({ icon, label, onClick, color }) => (
  <button onClick={onClick} className="flex flex-col items-center justify-center p-4 bg-white border border-gray-100 rounded-2xl hover:border-[#2DD4BF] transition-all space-y-2 group active:scale-95 shadow-sm min-h-[100px]">
    <div className={`w-10 h-10 ${color} text-white rounded-xl flex items-center justify-center shadow-sm transform group-hover:scale-110 transition-transform`}>{icon}</div>
    <span className="text-[10px] font-black uppercase tracking-widest text-[#64748B] group-hover:text-[#0F172A] transition-colors">{label}</span>
  </button>
);

export default Dashboard;