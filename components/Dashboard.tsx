
import React, { useMemo } from 'react';
import { Product, Customer, Transaction, AppView, BusinessProfile, Expense } from '../types';
import {
  TrendingUp,
  Users as UsersIcon,
  DollarSign,
  PieChart as PieChartIcon,
  Wallet,
  Activity,
  Plus,
  AlertCircle,
  Package,
  ArrowRight,
  Zap,
  Check,
  ShoppingCart,
  Trophy,
  ArrowUpRight,
  Layout
} from 'lucide-react';
import {
  Tooltip,
  Cell,
  PieChart,
  Pie,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid
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
  const widgets = businessProfile?.dashboardWidgets || {
    statCards: true,
    revenueTrend: true,
    topPerformer: true,
    quickActions: true,
    inventoryHealth: true,
    channels: true
  };

  const metrics = useMemo(() => {
    const revenue = transactions.reduce((sum, t) => sum + t.total, 0);
    const cogs = transactions.reduce((sum, t) => sum + (t.costTotal || 0), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const netProfit = revenue - cogs - totalExpenses;
    const margin = revenue > 0 ? (netProfit / revenue) * 100 : 0;
    return { revenue, netProfit, totalExpenses, margin, count: transactions.length };
  }, [transactions, expenses]);

  const trendData = useMemo(() => {
    const days = 7;
    const result = [];
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dailyTotal = transactions
        .filter(t => t.timestamp.startsWith(dateStr))
        .reduce((sum, t) => sum + t.total, 0);
      result.push({
        name: date.toLocaleDateString('en-US', { weekday: 'short' }),
        revenue: dailyTotal
      });
    }
    return result;
  }, [transactions]);

  const topPerformer = useMemo(() => {
    if (products.length === 0) return null;
    return [...products].sort((a, b) => b.totalSales - a.totalSales)[0];
  }, [products]);

  const channelData = useMemo(() => {
    const map = new Map<string, number>();
    transactions.forEach(t => map.set(t.source, (map.get(t.source) || 0) + t.total));
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .filter(d => d.value > 0);
  }, [transactions]);

  const lowStockItems = useMemo(() => products.filter(p => p.stock < (businessProfile?.stockThreshold || 5)), [products, businessProfile]);

  const allDisabled = !widgets.statCards && !widgets.revenueTrend && !widgets.topPerformer && !widgets.quickActions && !widgets.inventoryHealth && !widgets.channels;

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
            <p className="text-[#64748B] text-sm font-medium italic">Performance audit & automated bookkeeping.</p>
          </div>
        </div>
      </header>

      {widgets.statCards && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard label="Gross Revenue" value={`${currency}${metrics.revenue.toLocaleString()}`} trend={`${metrics.count} sales`} icon={<TrendingUp className="text-[#2DD4BF]" size={18} />} />
          <StatCard label="Expense" value={`${currency}${metrics.totalExpenses.toLocaleString()}`} trend="Logged costs" icon={<Wallet className="text-red-500" size={18} />} />
          <StatCard label="Net Profit" value={`${currency}${metrics.netProfit.toLocaleString()}`} trend={`${Math.round(metrics.margin)}% margin`} icon={<DollarSign className="text-emerald-600" size={18} />} />
          <StatCard label="Contacts" value={customers.length > 0 ? customers.length.toString() : '0'} trend="Active directory" icon={<UsersIcon className="text-blue-500" size={18} />} />
        </div>
      )}

      {(widgets.revenueTrend || widgets.topPerformer) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {widgets.revenueTrend && (
            <div className={`${widgets.topPerformer ? 'md:col-span-2' : 'md:col-span-3'} cyber-border p-8 card-shadow flex flex-col min-h-[400px]`}>
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-xl font-black text-[#0F172A]">Revenue Performance</h2>
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">7 Day Trend Activity</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg">
                  <ArrowUpRight size={14} />
                  <span className="text-xs font-black">Live Sync</span>
                </div>
              </div>
              {transactions.length > 0 ? (
                <div className="flex-1 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748B', fontWeight: 700 }} />
                      <YAxis hide />
                      <Tooltip
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', fontWeight: 700 }}
                        formatter={(val: number) => [`${currency}${val.toLocaleString()}`, 'Revenue']}
                      />
                      <Line type="monotone" dataKey="revenue" stroke="#2DD4BF" strokeWidth={4} dot={{ r: 6, fill: '#2DD4BF', strokeWidth: 0 }} activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-3 opacity-30">
                  <Activity size={48} />
                  <p className="text-sm font-bold uppercase tracking-widest">No Sales Data for Trend</p>
                </div>
              )}
            </div>
          )}

          {widgets.topPerformer && (
            <div className={`${widgets.revenueTrend ? '' : 'md:col-span-3'} cyber-border p-8 card-shadow bg-white text-[#0F172A] border-l-4 border-l-[#2DD4BF] flex flex-col`}>
              <div className="flex justify-between items-start mb-6">
                <Trophy size={32} className="text-[#2DD4BF]" />
                <div className="text-right">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Top Performer</p>
                  <p className="text-xs font-black uppercase tracking-widest text-[#2DD4BF]">Weekly Leader</p>
                </div>
              </div>
              {topPerformer ? (
                <div className="space-y-6 flex-1 flex flex-col justify-center">
                  <div>
                    <h3 className="text-2xl font-black tracking-tight mb-2 leading-tight">{topPerformer.name}</h3>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{topPerformer.category} • {topPerformer.totalSales} Units Sold</p>
                  </div>
                  <div className="p-5 bg-slate-50 border border-slate-100 rounded-3xl">
                    <div className="flex justify-between mb-4">
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Revenue Generated</span>
                      <span className="text-lg font-mono font-black text-[#2DD4BF]">{currency}{(topPerformer.price * topPerformer.totalSales).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Net Profit Share</span>
                      <span className="text-lg font-mono font-black text-emerald-400">{currency}{((topPerformer.price - topPerformer.costPrice) * topPerformer.totalSales).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center opacity-30">
                  <Package size={32} className="mb-2" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Sales Needed to Rank</p>
                </div>
              )}
              <button onClick={() => onNavigate('inventory')} className="mt-8 w-full h-14 bg-[#0F172A] text-white font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-[#2DD4BF] hover:text-[#0F172A] transition-all shadow-lg">
                Manage Catalog <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {widgets.quickActions && (
          <div className="cyber-border p-6 space-y-6 card-shadow">
            <h2 className="text-xl font-black text-[#0F172A] flex justify-between items-center">Quick Actions <Zap size={20} className="text-[#2DD4BF]" /></h2>
            <div className="grid grid-cols-2 gap-3">
              <ActionButton icon={<ShoppingCart size={18} />} label="New Order" onClick={onOpenManualSale} color="bg-emerald-500" />
              <ActionButton icon={<Plus size={18} />} label="Add Stock" onClick={() => onNavigate('inventory')} color="bg-[#0F172A]" />
              <ActionButton icon={<UsersIcon size={18} />} label="New Lead" onClick={() => onNavigate('crm')} color="bg-blue-500" />
              <ActionButton icon={<DollarSign size={18} />} label="Log Expense" onClick={() => onNavigate('finance')} color="bg-red-500" />
            </div>
          </div>
        )}

        {widgets.inventoryHealth && (
          <div className="cyber-border p-6 space-y-6 card-shadow available-cue">
            <h2 className="text-xl font-black text-[#0F172A] flex justify-between items-center">Inventory Health <Package size={20} className="text-[#0F172A]" /></h2>
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
        )}

        {widgets.channels && (
          <div className="cyber-border p-6 space-y-6 card-shadow">
            <h2 className="text-xl font-black text-[#0F172A] flex justify-between items-center">Channels <PieChartIcon size={20} className="text-[#64748B]" /></h2>
            {channelData.length > 0 ? (
              <div className="h-[200px] w-full">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={channelData} innerRadius={55} outerRadius={80} paddingAngle={5} dataKey="value">
                      {channelData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #f1f5f9', borderRadius: '16px', fontSize: '10px', fontWeight: 700 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center opacity-30 italic text-xs font-bold uppercase tracking-widest">
                Awaiting First Sale
              </div>
            )}
          </div>
        )}
      </div>

      {allDisabled && (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-20 animate-in fade-in zoom-in-95">
          <div className="w-20 h-20 bg-[#0F172A]/5 rounded-[32px] flex items-center justify-center mb-6">
            <Layout className="text-[#64748B]" size={40} />
          </div>
          <h2 className="text-xl font-black text-[#0F172A]">Clean Canvas</h2>
          <p className="text-[#64748B] text-sm mt-2 max-w-xs">All dashboard widgets are disabled. You can reactivate them in Settings.</p>
          <button
            onClick={() => onNavigate('settings')}
            className="mt-8 px-8 h-12 bg-[#0F172A] text-white font-black rounded-2xl flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-xl"
          >
            Go to Settings
          </button>
        </div>
      )}
    </div>
  );
};

const StatCard: React.FC<{ label: string, value: string, trend: string, icon: React.ReactNode }> = ({ label, value, trend, icon }) => (
  <div className="cyber-border p-6 hover-lift group relative overflow-hidden bg-white">
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
