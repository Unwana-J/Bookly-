
import React, { useState, useMemo } from 'react';
import { 
  ShoppingBag, 
  Users, 
  Settings as SettingsIcon, 
  LayoutDashboard, 
  Sparkles,
  Wallet,
  History,
  AlertTriangle,
  X,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { Product, Customer, Transaction, AppView, SalesSource, ExtractedSale, ExtractedProduct, BusinessProfile, Expense, ExtractedExpense, FilterState } from './types';
import Inventory from './components/Inventory';
import CRM from './components/CRM';
import Settings from './components/Settings';
import Dashboard from './components/Dashboard';
import Onboarding from './components/Onboarding';
import HoverBot from './components/HoverBot';
import Expenses from './components/Expenses';
import SalesView from './components/SalesView';
import AddProductModal from './components/AddProductModal';
import AddCustomerModal from './components/AddCustomerModal';
import InvoiceModal from './components/InvoiceModal';
import EditTransactionModal from './components/EditTransactionModal';
import ConfirmSaleModal from './components/ConfirmSaleModal';
import ManualEntryModal from './components/ManualEntryModal';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('onboarding');
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null);
  const [isHoverBotActive, setIsHoverBotActive] = useState(false);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);
  const [isManualSaleModalOpen, setIsManualSaleModalOpen] = useState(false);
  const [viewingTransaction, setViewingTransaction] = useState<Transaction | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [pendingSale, setPendingSale] = useState<ExtractedSale | null>(null);

  const [filters, setFilters] = useState<FilterState>({
    customerHandles: [], platforms: [], dateRange: { start: '', end: '' }, months: [], productNames: [], tiers: []
  });

  const [products, setProducts] = useState<Product[]>([
    { id: '1', name: 'Vintage Denim Jacket', price: 45, costPrice: 20, stock: 12, totalSales: 5, category: 'Fashion' },
    { id: '2', name: 'Ceramic Coffee Mug', price: 15, costPrice: 4, stock: 45, totalSales: 2, category: 'Home' },
    { id: '3', name: 'Wireless Headphones', price: 89, costPrice: 40, stock: 8, totalSales: 15, category: 'Electronics' },
  ]);

  const [customers, setCustomers] = useState<Customer[]>([
    { id: 'c1', handle: '@unwana', name: 'Unwana M.', orderCount: 3, ltv: 135, channel: 'WhatsApp', lastActive: '2 hours ago' },
    { id: 'c2', handle: '@jess_c', name: 'Jessica Chen', orderCount: 1, ltv: 15, channel: 'Instagram', lastActive: '1 day ago' },
  ]);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const handleLogout = () => {
    setBusinessProfile(null);
    setView('onboarding');
    setIsHoverBotActive(false);
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      if (t.isArchived && view !== 'sales') return false; 
      if (filters.platforms.length > 0 && !filters.platforms.includes(t.source)) return false;
      if (filters.productNames.length > 0 && !filters.productNames.includes(t.productName)) return false;
      if (filters.customerHandles.length > 0 && !filters.customerHandles.includes(t.customerHandle)) return false;
      return true;
    });
  }, [transactions, filters, view]);

  const commitSale = (saleData: ExtractedSale) => {
    const timestamp = new Date().toISOString();
    const newTransactions: Transaction[] = [];

    saleData.customers?.forEach(customer => {
      const source = customer.platform || businessProfile?.defaultSalesSource || 'WhatsApp';
      customer.items?.forEach(item => {
        const product = products.find(p => p.name.toLowerCase().includes(item.productName.toLowerCase())) || products[0] || { id: 'temp', price: 0, costPrice: 0, name: item.productName };
        const qty = item.quantity || 1;
        
        // Priority: Edited unitPrice > Extracted unitPrice > Catalog price
        const priceToUse = typeof item.unitPrice === 'number' ? item.unitPrice : product.price;
        const total = priceToUse * qty;

        const newT: Transaction = {
          id: Math.random().toString(36).substr(2, 9),
          customerId: 'new', customerHandle: customer.handle,
          productId: product.id, productName: product.name || item.productName,
          quantity: qty, total, costTotal: (product.costPrice || 0) * qty,
          timestamp, status: 'confirmed', source, isArchived: false, editHistory: []
        };
        
        newTransactions.push(newT);
        
        if (product.id !== 'temp') {
          setProducts(prev => prev.map(p => p.id === product.id ? { ...p, stock: Math.max(0, p.stock - qty), totalSales: p.totalSales + qty } : p));
        }
      });

      const existingC = customers.find(c => c.handle === customer.handle);
      const val = customer.orderTotal || 0;
      if (existingC) {
        setCustomers(prev => prev.map(c => c.handle === customer.handle ? { ...c, orderCount: c.orderCount + 1, ltv: c.ltv + val, lastActive: 'Just now' } : c));
      } else if (customer.handle) {
        setCustomers(prev => [{ id: Math.random().toString(36).substr(2, 9), handle: customer.handle, name: customer.handle.replace('@', ''), orderCount: 1, ltv: val, channel: source, lastActive: 'Just now' }, ...prev]);
      }
    });

    if (newTransactions.length > 0) {
      setTransactions(prev => [...newTransactions, ...prev]);
      // Viewing the first one created in this batch
      setViewingTransaction(newTransactions[0]);
    }

    setPendingSale(null);
    setIsHoverBotActive(false);
  };

  if (view === 'onboarding') {
    return <Onboarding onComplete={(profile) => { setBusinessProfile(profile); setView('dashboard'); }} />;
  }

  const currency = businessProfile?.currency === 'NGN' ? '₦' : '$';

  return (
    <div className="min-h-screen bg-[#F0FDF4] text-[#0F172A] font-sans flex flex-col md:flex-row">
      
      <nav className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-20 bg-[#0F172A] border-r border-white/5 py-8 items-center space-y-6 z-[100] nav-glass">
        <div className="w-12 h-12 bg-[#2DD4BF] flex items-center justify-center rounded-2xl mb-8 transform -rotate-3 cursor-pointer" onClick={() => setView('dashboard')}>
          <span className="text-[#0F172A] font-black text-xl">B</span>
        </div>
        <NavItem active={view === 'dashboard'} icon={<LayoutDashboard size={24} />} onClick={() => setView('dashboard')} label="Home" />
        <NavItem active={view === 'sales'} icon={<History size={24} />} onClick={() => setView('sales')} label="Ledger" />
        <NavItem active={view === 'inventory'} icon={<ShoppingBag size={24} />} onClick={() => setView('inventory')} label="Stock" />
        <NavItem active={view === 'crm'} icon={<Users size={24} />} onClick={() => setView('crm')} label="CRM" />
        <NavItem active={view === 'expenses'} icon={<Wallet size={24} />} onClick={() => setView('expenses')} label="Expenses" />
        <NavItem active={view === 'settings'} icon={<SettingsIcon size={24} />} onClick={() => setView('settings')} label="Setup" />
        
        <div className="mt-auto space-y-4">
          <button 
            onClick={() => setIsHoverBotActive(!isHoverBotActive)} 
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${isHoverBotActive ? 'bg-[#2DD4BF] text-[#0F172A]' : 'bg-white/10 text-slate-200 hover:bg-white/20'}`}
          >
            <Sparkles size={24} />
          </button>
          <button 
            onClick={handleLogout}
            className="w-12 h-12 rounded-xl flex items-center justify-center text-red-300 hover:bg-red-500/20 transition-all"
          >
            <LogOut size={24} />
          </button>
        </div>
      </nav>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#0F172A] border-t border-white/5 flex items-center justify-around z-[100] nav-glass px-4">
        <MobileNavItem active={view === 'dashboard'} icon={<LayoutDashboard size={22} />} onClick={() => setView('dashboard')} />
        <MobileNavItem active={view === 'sales'} icon={<History size={22} />} onClick={() => setView('sales')} />
        <button 
          onClick={() => setIsHoverBotActive(!isHoverBotActive)} 
          className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isHoverBotActive ? 'bg-[#2DD4BF] text-[#0F172A]' : 'bg-white/10 text-[#2DD4BF]'}`}
        >
          <Sparkles size={22} />
        </button>
        <MobileNavItem active={view === 'inventory'} icon={<ShoppingBag size={22} />} onClick={() => setView('inventory')} />
        <MobileNavItem active={view === 'settings'} icon={<SettingsIcon size={22} />} onClick={() => setView('settings')} />
      </nav>

      <main className="flex-1 px-6 md:px-8 md:pl-28 lg:pl-32 max-w-[1440px] mx-auto w-full pt-16 md:pt-16 pb-24 md:pb-8 min-h-screen">
        {view === 'dashboard' && <Dashboard products={products} customers={customers} transactions={filteredTransactions.filter(t => !t.isArchived)} expenses={expenses} onNavigate={setView} businessProfile={businessProfile} onOpenManualSale={() => setIsManualSaleModalOpen(true)} />}
        {view === 'sales' && <SalesView transactions={filteredTransactions} filters={filters} setFilters={setFilters} products={products} customers={customers} vipThreshold={businessProfile?.vipThreshold || 5} onViewInvoice={setViewingTransaction} onArchive={(id) => setTransactions(prev => prev.map(t => t.id === id ? { ...t, isArchived: !t.isArchived } : t))} onEdit={setEditingTransaction} currency={currency} />}
        {view === 'inventory' && <Inventory products={products} setProducts={setProducts} onOpenAddProduct={() => setIsAddProductModalOpen(true)} />}
        {view === 'expenses' && <Expenses expenses={expenses} onAddExpense={(e) => setExpenses(prev => [{...e, id: Math.random().toString()}, ...prev])} businessProfile={businessProfile} />}
        {view === 'crm' && <CRM customers={customers} transactions={transactions} businessProfile={businessProfile} onOpenAddCustomer={() => setIsAddCustomerModalOpen(true)} onViewInvoice={setViewingTransaction} />}
        {view === 'settings' && <Settings businessProfile={businessProfile} setBusinessProfile={setBusinessProfile} />}
      </main>

      <HoverBot inventory={products} onConfirmSale={(s) => setPendingSale(s)} onConfirmProduct={(p) => setProducts(prev => [{...p, id: Math.random().toString(), totalSales: 0}, ...prev])} onConfirmExpense={(e) => setExpenses(prev => [{...e, id: Math.random().toString(), timestamp: new Date().toISOString()}, ...prev])} isActive={isHoverBotActive} setIsActive={setIsHoverBotActive} businessProfile={businessProfile} customers={customers} />
      <AddProductModal isOpen={isAddProductModalOpen} onClose={() => setIsAddProductModalOpen(false)} onAdd={(p) => setProducts(prev => [{...p, id: Math.random().toString(), totalSales: 0}, ...prev])} />
      <AddCustomerModal isOpen={isAddCustomerModalOpen} onClose={() => setIsAddCustomerModalOpen(false)} onAdd={(c) => setCustomers(prev => [{...c, id: Math.random().toString(), orderCount: 0, ltv: 0, lastActive: 'New'}, ...prev])} />
      <ManualEntryModal isOpen={isManualSaleModalOpen} onClose={() => setIsManualSaleModalOpen(false)} inventory={products} onConfirm={(s) => setPendingSale(s)} businessProfile={businessProfile} customers={customers} />
      <InvoiceModal isOpen={!!viewingTransaction} onClose={() => setViewingTransaction(null)} transaction={viewingTransaction} businessProfile={businessProfile} customer={customers.find(c => c.handle === viewingTransaction?.customerHandle) || null} />
      {editingTransaction && <EditTransactionModal isOpen={!!editingTransaction} onClose={() => setEditingTransaction(null)} transaction={editingTransaction} onUpdate={(id, updates) => setTransactions(prev => prev.map(t => t.id === id ? {...t, ...updates} : t))} />}
      {pendingSale && <ConfirmSaleModal isOpen={!!pendingSale} onClose={() => setPendingSale(null)} onConfirm={(editedData) => commitSale(editedData)} saleData={pendingSale} products={products} businessProfile={businessProfile} />}
    </div>
  );
};

const NavItem: React.FC<{ active: boolean, icon: React.ReactNode, onClick: () => void, label: string }> = ({ active, icon, onClick, label }) => (
  <button 
    onClick={onClick} 
    className={`group relative flex items-center justify-center w-12 h-12 rounded-xl transition-all ${active ? 'bg-[#2DD4BF] text-[#0F172A]' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}
    aria-label={label}
  >
    {icon}
    <span className="absolute left-full ml-4 px-3 py-1.5 bg-[#0F172A] text-white text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[200]">
      {label}
    </span>
  </button>
);

const MobileNavItem: React.FC<{ active: boolean, icon: React.ReactNode, onClick: () => void }> = ({ active, icon, onClick }) => (
  <button 
    onClick={onClick} 
    className={`flex items-center justify-center w-11 h-11 rounded-xl transition-all ${active ? 'bg-[#2DD4BF] text-[#0F172A]' : 'text-slate-400'}`}
  >
    {icon}
  </button>
);

export default App;
